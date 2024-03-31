import { AfterChangeHook } from "payload/dist/collections/config/types";
import { Event } from "payload/generated-types";
import { sendDiscordAuditMessage } from "../../discord/bot";
import { createEventEmbed } from "@xrclub/club.js/dist/events/extensions/discord";
import { ICXREventTransformer } from "./EventTransform";

/**
 * This hook will create a notification in the audit log whenever an event is
 * created and presumably needs approval.
 */
const NotifyCreationHook: AfterChangeHook<Event> = async args => {
    // Make sure we don't have a noHook
    if (args.context.noHook)
        return;

    // We only care when the event is created.
    if (args.operation !== "create")
        return;

    let embed = await createEventEmbed(ICXREventTransformer.deserialize(args.doc));
    sendDiscordAuditMessage({content: "# New Event Created", embeds: [ embed ]})
}

export default NotifyCreationHook;