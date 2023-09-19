import { getDiscordClient } from "@djfigs1/payload-discord/dist/discord/bot";
import {
  EmbedBuilder,
  Guild
} from "discord.js";
import payload from "payload";
import { Event } from "payload/generated-types";
import { resolveDocument } from "../server/payload-util";
import moment from "moment";

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
async function updateGuildEvent(event: Event, guild: Guild) {
  let eventDetails = {
    name: event.name,
    scheduledStartTime: event.startDate,
    scheduledEndTime: event.endDate,
    description: event.description,
    privacyLevel: 2, // GuildScheduledEventPrivacyLevel.GuildOnly, <-- THESE ENUMS CAUSE IMPORT ERRORS. WHY? I DUNNO
    entityType: 3, // GuildScheduledEventEntityType.External,
    entityMetadata: {
      location: event.location,
    },
    image: event.thumbnail
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
}

async function updateGuildEventEmbed(event: Event, guild: Guild): Promise<Event> {
  let config = await payload.findGlobal({slug: "icxr"})
  let client = await getDiscordClient();
  if (!client) return event;

  let eventsChannel = config.discord?.eventsChannel
  if (!eventsChannel) return event;
  let channel;
  try {
    channel = (await guild.channels.fetch(eventsChannel))!;
  } catch {
    console.error("Failed to get events channel!");
    return event;
  }

  // Build an embed with all of the event information.
  let embed = new EmbedBuilder();
  embed.setColor("Purple");
  embed.setTitle(event.name)

  // Add event description
  if (event.description) {
    embed.setDescription(event.description);
  }

  // Add event thumbnail (if it exists)
  if (event.thumbnail) {
    embed.setImage(event.thumbnail)
  }

  let startMoment = moment(event.startDate);
  let endMoment = moment(event.endDate);

  // Add event information
  let when: string;
  if (startMoment.isSame(endMoment, "date")) {
    let startDate = startMoment.format("dddd, MMMM Do YYYY");
    let startTime = startMoment.format("h:mm A");
    let endTime = endMoment.format("h:mm A");
    let date = `${startDate} from ${startTime} - ${endTime}`;
    when = date;
  } else {
    when = "Long range"
  }

  embed.addFields({
    name: "When",
    value: when,
  });

  // Attempt to see if there is an event message already existing, and if so,
  // edit it with the new embed.
  var shouldCreateNewMessage = true
  if (event.discordMessage?.channel && event.discordMessage.message)
  {
    try {
      let existingChannel = (await client.channels.fetch(event.discordMessage.channel))!;
      if (existingChannel.isTextBased()) {
        let existingMessage = await existingChannel.messages.fetch(event.discordMessage.message);
        existingMessage.edit({embeds: [embed]})
        shouldCreateNewMessage = false;
      }
    } catch {
      shouldCreateNewMessage = true;
    }
  }

  // If we need to create a new message, do so and save the resulting message
  // id.
  if (shouldCreateNewMessage && channel.isTextBased()) {
    let sentMessage = await channel.send({ embeds: [embed] })
    await payload.update({
      collection: 'events',
      id: event.id,
      data: {
        discordMessage: {
          message: sentMessage.id,
          channel: sentMessage.channelId
        }
      },
      context: {
        noHook: true
      }
    })
  }

  return event;
}

export async function updateEventOnDiscord(
  event: string | Event
): Promise<Event> {
  event = await resolveDocument(event, "events");
  let guild = await getICXRGuild();

  // Ensure that we have a guild to publish the event to.
  if (!guild) return event;

  event = await updateGuildEvent(event, guild);
  event = await updateGuildEventEmbed(event, guild);

  return event;
}
