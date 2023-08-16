import { AfterChangeHook } from "payload/dist/collections/config/types";
import { Event } from "payload/generated-types";
import { updateGuildWithEvent } from "../../discord/bot";
import { updateCalendarWithEvent } from "../../server/gapi";

const PublishHook: AfterChangeHook<Event> = async (args) => {
  // Don't run this hook again if an update was triggered by this hook.
  if (args.context.noHook)
    return;

  let event = args.doc;
  // Only create a discord event if it is approved, it is specified that a
  // discord event should be published, and a discord event has not been
  // created already.
  if (event.status == "Approved") {
    if (event.publishDiscord) {
      event = await updateGuildWithEvent(event);
    }

    if (event.publishCalendar) {
      event =await updateCalendarWithEvent(event);
    }
  }
};

export default PublishHook;
