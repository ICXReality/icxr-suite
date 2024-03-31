import { ClubEventData } from "@xrclub/club.js/dist/events/event";
import {
  DiscordClubEventData,
  DiscordClubEventExtension,
} from "@xrclub/club.js/dist/events/extensions/discord";
import {
  GCalClubEventData,
  GCalClubEventExtension,
} from "@xrclub/club.js/dist/events/extensions/gcal";
import { Transformer } from "@xrclub/club.js/dist/util/transformer";
import payload from "payload";
import { setGApiAuthentication } from "@xrclub/club.js/dist/gapi/auth";

export type ICXREvent = ClubEventData &
  DiscordClubEventData &
  GCalClubEventData;

class ICXRStateManager {
  public events: Transformer<ICXREvent>;
  private _discordEventExtension: DiscordClubEventExtension<ICXREvent>;
  private _gcalEventExtension: GCalClubEventExtension<ICXREvent>;

  constructor() {
    this.events = new Transformer();
    this._discordEventExtension = new DiscordClubEventExtension({});
    this._gcalEventExtension = new GCalClubEventExtension([]);
    this.events.addExtension(this._discordEventExtension);
    this.events.addExtension(this._gcalEventExtension);
  }

  public async init() {
    let icxr = await payload.findGlobal({ slug: "icxr" });

    // Setup Discord
    if (icxr.discord?.guild) {
      let eventChannel = icxr.discord.eventsChannel ?? null;
      this._discordEventExtension.setGuilds({
        [icxr.discord.guild]: eventChannel,
      });

      let tagToRoles: Record<string, string> =
        icxr.discord.notificationRoles?.reduce(
          (o, x) => ({
            ...o,
            [x.tag]: x.role?.role!,
          }),
          {}
        ) ?? {};
      this._discordEventExtension.setMentionRoles(tagToRoles);
    }

    // Setup Google Calendar
    if (
      icxr.google?.clientId &&
      icxr.google.clientSecret &&
      icxr.google.refreshToken
    ) {
      setGApiAuthentication(
        icxr.google.clientId,
        icxr.google.clientSecret,
        icxr.google.refreshToken
      );

      if (icxr.google.calendarId) {
        this._gcalEventExtension.setCalendarIds([icxr.google.calendarId]);
      }
    }
  }
}

export const ICXR = new ICXRStateManager();
