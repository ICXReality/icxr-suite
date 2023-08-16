import {
  BeforeDeleteHook
} from "payload/dist/collections/config/types";
import { removeEventFromGuild } from "../../discord/bot";
import { removeEventFromCalendar } from "../../server/gapi";

const UnpublishHook: BeforeDeleteHook = async (args) => {
  // Don't run this hook again if an update was triggered by this hook.
  if (args.context.hookUpdate) return;

  let eventId = args.id.toString();
  await removeEventFromGuild(eventId);
  await removeEventFromCalendar(eventId);
};

export default UnpublishHook;
