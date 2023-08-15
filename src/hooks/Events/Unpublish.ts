import {
  AfterDeleteHook
} from "payload/dist/collections/config/types";
import { Event } from "payload/generated-types";
import { getICXRGuild } from "../../discord/bot";

const UnpublishHook: AfterDeleteHook<Event> = async (args) => {
  // Don't run this hook again if an update was triggered by this hook.
  if (args.context.hookUpdate) return;

  let event = args.doc;
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
};

export default UnpublishHook;
