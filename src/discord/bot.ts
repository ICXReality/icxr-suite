import { getDiscordClient } from "@djfigs1/payload-discord/dist/discord/bot";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Channel,
  Guild,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  MessagePayload
} from "discord.js";
import payload from "payload";

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
