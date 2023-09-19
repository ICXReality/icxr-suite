import { getDiscordClient } from "@djfigs1/payload-discord/dist/discord/bot";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Channel,
  Guild,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  MessagePayload,
} from "discord.js";
import payload from "payload";
import { Event } from "payload/generated-types";
import { resolveDocument } from "../server/payload-util";
import { createEventEmbed, createEventMessage, truncate } from "./messages";

export type DiscordMessage =
  | string
  | MessagePayload
  | (MessageCreateOptions & MessageEditOptions);
export type NewDiscordMessage = string | MessagePayload | MessageCreateOptions;
export type EditableDiscordMessage =
  | string
  | MessagePayload
  | MessageEditOptions;

export async function getICXRGuild(): Promise<Guild | null> {
  let client = getDiscordClient();
  let icxr = await payload.findGlobal({ slug: "icxr" });
  if (client && icxr.discord?.guild) {
    let guild = await client.guilds.fetch(icxr.discord.guild);
    return guild;
  }

  return null;
}

/**
 * Updates a specified guild to create/update a scheduled event (what you see
 * in the top left of the guild) with a specified ICXR event.
 *
 * @param event The event to reference in the guild event
 * @param guild The guild to publish the event to
 */
async function updateGuildScheduledEvent(event: Event, guild: Guild) {
  // Calculated truncated event details in case they are too long to fit within
  // a scheduled event.

  let eventDetails = {
    name: truncate(event.name, 100),
    scheduledStartTime: event.startDate,
    scheduledEndTime: event.endDate,
    description: event.description ? truncate(event.description, 1000) : undefined,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    entityType: GuildScheduledEventEntityType.External,
    entityMetadata: {
      location: truncate(event.location, 100, "")
    },
    image: event.thumbnail,
  };

  // Edit the event if one already exists.
  var shouldCreateNewEvent = true;
  if (event.discordEvent?.guild && event.discordEvent?.event) {
    shouldCreateNewEvent = false;
    try {
      let existingEvent = await guild.scheduledEvents.fetch(
        event.discordEvent.event
      );
      await existingEvent.edit(eventDetails);
    } catch {
      shouldCreateNewEvent = true;
    }
  }
  // If there was no event, or we failed to edit the previous one (it could
  // have been removed), then create a new one.
  if (shouldCreateNewEvent) {
    let createdEvent = await guild.scheduledEvents.create(eventDetails);
    event = await payload.update({
      id: event.id,
      collection: "events",
      data: {
        discordEvent: {
          guild: guild.id,
          event: createdEvent.id,
        },
      },
      context: {
        noHook: true,
      },
      showHiddenFields: true,
      overrideAccess: true,
    });
  }

  return event;
}

export async function removeEventFromGuild(event: string | Event) {
  event = await resolveDocument(event, "events");
  // Remove a Discord event if one was created.
  if (event.discordEvent?.event && event.discordEvent.guild) {
    let guild = await getICXRGuild();
    if (guild) {
      let existingEvent = await guild.scheduledEvents.fetch(
        event.discordEvent.event
      );
      if (existingEvent) {
        await existingEvent.delete();
      }
    }
  }

  // Remove an event event if one was created.
  if (event.discordMessage?.channel && event.discordMessage.message) {
    let message = await fetchChannelMessage(
      event.discordMessage.channel,
      event.discordMessage.message
    );
    if (message) {
      await message.delete();
    }
  }
}

async function updateGuildEventEmbedMessage(
  event: Event,
  guild: Guild
): Promise<Event> {
  let config = await payload.findGlobal({ slug: "icxr" });
  let client = await getDiscordClient();
  if (!client) return event;

  let eventsChannel = config.discord?.eventsChannel;
  if (!eventsChannel) return event;
  let channel;
  try {
    channel = (await guild.channels.fetch(eventsChannel))!;
  } catch {
    console.error("Failed to get events channel!");
    return event;
  }

  let eventMessageData = createEventMessage(event);

  // Attempt to see if there is an event message already existing, and if so,
  // edit it with the new embed.
  var shouldCreateNewMessage = true;
  if (event.discordMessage?.channel && event.discordMessage.message) {
    let editResult = await editChannelMessage(
      event.discordMessage.channel,
      event.discordMessage.message,
      eventMessageData
    );
    shouldCreateNewMessage = editResult === null;
  }

  // If we need to create a new message, do so and save the resulting message
  // id.
  if (shouldCreateNewMessage && channel.isTextBased()) {
    let sentMessage = await channel.send(eventMessageData);
    await payload.update({
      collection: "events",
      id: event.id,
      data: {
        discordMessage: {
          message: sentMessage.id,
          channel: sentMessage.channelId,
        },
      },
      context: {
        noHook: true,
      },
    });
  }

  return event;
}

export async function publishEventOnDiscord(
  event: string | Event
): Promise<Event> {
  event = await resolveDocument(event, "events");
  let guild = await getICXRGuild();

  // Ensure that we have a guild to publish the event to.
  if (!guild) return event;

  // We update the scheduled event first and retrieve the updated event such
  // that an event embed message can refer to the scheduled event via a button
  // or link.
  event = await updateGuildScheduledEvent(event, guild);
  event = await updateGuildEventEmbedMessage(event, guild);

  return event;
}

export async function sendDiscordAuditMessage(
  message: DiscordMessage
): Promise<Message | null> {
  // Make sure we have an audit channel id to write to.
  let config = await payload.findGlobal({ slug: "icxr" });
  let auditChannelId = config.discord?.auditChannel;
  if (!auditChannelId) return null;

  let sentMessage = await sendChannelMessage(message, auditChannelId);

  return sentMessage;
}

/**
 * Attempts to send a message via the ICXR client to a specified channel id.
 * If the message could not be sent, this will return null.
 *
 * @param message The message to send
 * @param channelId The id of the channel to put the message
 * @returns The sent message (or null if none sent)
 */
export async function sendChannelMessage(
  message: DiscordMessage,
  channelId: string
): Promise<Message | null> {
  let client = await getDiscordClient();

  // Make sure we have a client to send a message through.
  if (!client) return null;

  let channel: Channel | null;
  try {
    channel = await client.channels.fetch(channelId);
  } catch {
    payload.logger.error("Failed to fetch audit channel from id!");
    channel = null;
  }

  // Ensure that we have a valid channel and that it is text based.
  if (!(channel && channel.isTextBased())) return null;

  let sentMessage = await channel.send(message);

  return sentMessage;
}

export async function fetchChannelMessage(
  channelId: string,
  messageId: string
) {
  let client = await getDiscordClient();

  // Make sure we have a client to send a message through.
  if (!client) return null;

  let channel: Channel | null;
  try {
    channel = await client.channels.fetch(channelId);
  } catch {
    payload.logger.error("Failed to fetch audit channel from id!");
    channel = null;
  }

  // Ensure that we have a valid channel and that it is text based.
  if (!(channel && channel.isTextBased())) return null;

  let message: Message | null;
  try {
    message = await channel.messages.fetch(messageId);
  } catch {
    message = null;
    payload.logger.error("Failed to fetch message from id!");
  }

  return message;
}

export async function editChannelMessage(
  channelId: string,
  messageId: string,
  content: EditableDiscordMessage
): Promise<Message | null> {
  let messageToEdit = await fetchChannelMessage(channelId, messageId);
  if (!messageToEdit) return null;

  let newMessage: Message | null;
  try {
    newMessage = await messageToEdit.edit(content);
  } catch {
    payload.logger.error("Failed to edit message!");
    newMessage = null;
  }

  return newMessage;
}

type DiscordButton = {
  style: ButtonStyle;
  label: string;
  customId?: string;
  url?: string;
  emoji?: string;
};

export function createButtonRowComponents(
  buttons: DiscordButton[]
): ActionRowBuilder<ButtonBuilder>[] {
  let maxRows = 5;
  let maxButtonsPerRow = 5;
  let totalButtons = Math.min(buttons.length, maxRows * maxButtonsPerRow);

  let numRows = Math.min(5, Math.ceil(buttons.length / 5));
  let rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (var r = 0; r < numRows; r++) {
    let rowStart = maxButtonsPerRow * r;
    let rowEnd = Math.min(rowStart + maxButtonsPerRow, totalButtons);
    let row = new ActionRowBuilder<ButtonBuilder>();

    for (var i = rowStart; i < rowEnd; i++) {
      let button = buttons[i];
      row.addComponents(createButton(button));
    }

    rows.push(row);
  }

  return rows;
}

export function createButton(button: DiscordButton) {
  let builder = new ButtonBuilder();

  builder = builder.setStyle(button.style);
  builder = builder.setLabel(button.label);
  if (button.customId) builder = builder.setCustomId(button.customId);
  if (button.url) builder = builder.setURL(button.url);
  if (button.emoji) builder = builder.setEmoji(button.emoji);

  return builder;
}
