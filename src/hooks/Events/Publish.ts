import { AfterChangeHook } from "payload/dist/collections/config/types";
import { Event } from "payload/generated-types";
import { getICXRGuild } from "../../discord/bot";
import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";

const PublishHook: AfterChangeHook<Event> = async (args) => {
  // Don't run this hook again if an update was triggered by this hook.
  if (args.context.hookUpdate)
    return;

  let event = args.doc;
  // Only create a discord event if it is approved, it is specified that a
  // discord event should be published, and a discord event has not been
  // created already.
  if (event.status == "Approved" && event.publishDiscord) {
    let guild = await getICXRGuild();
    if (guild) {
      let eventDetails = {
        name: event.name,
        scheduledStartTime: event.startDate,
        scheduledEndTime: event.endDate,
        description: event.description,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.External,
        entityMetadata: {
          location: event.location,
        },
      };

      // Create / edit the Discord event.
      if (event.discordEvent?.guild && event.discordEvent?.event) {
        let existingEvent = await guild.scheduledEvents.fetch(event.discordEvent.event);
        if (existingEvent) {
          await existingEvent.edit(eventDetails)
        }
      } else {
        let createdEvent = await guild.scheduledEvents.create(eventDetails);
        await args.req.payload.update({
          id: event.id,
          collection: "events",
          data: {
            discordEvent: {
              guild: guild.id,
              event: createdEvent.id
            }
          },
          context: {
            hookUpdate: true
          }
        })
      }
    }
  }
};

export default PublishHook;
