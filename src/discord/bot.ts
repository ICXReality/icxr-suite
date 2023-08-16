import {
  Guild,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
import payload from "payload";
import { getDiscordClient } from "payload-discord/dist/discord/bot";
import { Event } from "payload/generated-types";
import { resolveDocument } from "../server/payload-util";

export async function getICXRGuild(): Promise<Guild | null> {
  let client = getDiscordClient();
  let icxr = await payload.findGlobal({ slug: "icxr" });
  if (client && icxr.guild) {
    let guild = await client.guilds.fetch(icxr.guild);
    return guild;
  }

  return null;
}

export async function updateGuildWithEvent(
  event: string | Event
): Promise<Event> {
  event = await resolveDocument(event, "events");
  let guild = await getICXRGuild();
  if (guild) {
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
