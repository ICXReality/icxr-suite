import { ButtonStyle, EmbedBuilder } from "discord.js";
import moment from "moment";
import { Event } from "payload/generated-types";
import { DiscordMessage, createButtonRowComponents } from "./bot";

export function createEventMessage(event: Event): DiscordMessage {
  let embed = createEventEmbed(event);
  let message: DiscordMessage = {
    embeds: [embed]
  }

  if (event.discordEvent?.event && event.discordEvent.guild)
  {
    let rows = createButtonRowComponents([
      {
        style: ButtonStyle.Link,
        label: "View Discord Event",
        url: `https://discord.com/events/${event.discordEvent.guild}/${event.discordEvent.event}`
      }
    ])

    message.components = rows;
  }

  return message;
}

/**
 * Creates an embed that describes the details about a specified event.
 *
 * @param event The event to create an embed from
 * @returns An embed builder configured with details about the event
 */
export function createEventEmbed(event: Event): EmbedBuilder {
  // Build an embed with all of the event information.
  let embed = new EmbedBuilder();
  embed.setColor("Purple");
  embed.setTitle(event.name);

  // Add event description
  if (event.description) {
    embed.setDescription(event.description);
  }

  // Add event thumbnail (if it exists)
  if (event.thumbnail) {
    embed.setImage(event.thumbnail);
  }

  // Add event location
  embed.addFields({
    name: "Location",
    value: event.location,
    inline: false
  })

  let startMoment = moment(event.startDate);
  let endMoment = moment(event.endDate);
  let startTime = startMoment.unix();
  let endTime = endMoment.unix();

  // Add event date
  embed.addFields({
    name: "Start",
    value: `<t:${startTime}:F> `,
    inline: false
  },
  {
   name: "End",
   value: `<t:${endTime}:F>`,
   inline: true
  });

  return embed;
}

export type VRCSession = {
    name: string,
    host: {
        name: string,
        id: string,
        profileUrl: string
    },
    capacity: number,
    players: number,
    thumbnail: string,
    region: string
}

export function createVRChatSessionEmbed(session: VRCSession): EmbedBuilder {
    let embed = new EmbedBuilder();
    embed.setColor("Blue");

    embed.setTitle(session.name)

    embed.setAuthor({
        name: session.host.name,
        iconURL: session.host.profileUrl,
        url: `https://vrchat.com/home/user/${session.host.id}`
    })

    embed.addFields({
        name: "Players",
        value: `${session.players} / ${session.capacity}`,
        inline: true
    })

    embed.setImage(session.thumbnail)

    embed.addFields({
        name: "Region",
        value: "US",
        inline: true
    })

    return embed;
}