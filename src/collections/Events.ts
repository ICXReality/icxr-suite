import {
  guildChannelField,
  guildEventField,
} from "@djfigs1/payload-discord/dist/fields/guilds";
import { CollectionConfig } from "payload/types";
import {
  EventAfterDeleteHook,
  EventBeforeChangeHook,
} from "../hooks/Events/EventTransform";
import NotifyCreationHook from "../hooks/Events/NotifyCreation";

function isInFuture(value: any) {
  let isInFuture = new Date(value).getTime() > Date.now();
  return isInFuture ? true : "Date needs to be in future!";
}

const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
  },
  endpoints: [],
  hooks: {
    beforeChange: [EventBeforeChangeHook],
    afterChange: [NotifyCreationHook],
    afterDelete: [EventAfterDeleteHook],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "isPublished",
      type: "checkbox",
      required: true,
    },
    {
      name: "location",
      type: "group",
      fields: [
        {
          name: "irl",
          type: "text",
        },
        {
          name: "online",
          type: "text",
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "thumbnail",
      type: "text",
    },
    {
      type: "row",
      fields: [
        {
          name: "startDate",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
          validate: isInFuture,
        },
        {
          name: "endDate",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
          validate: isInFuture,
        },
      ],
    },
    {
      name: "discord",
      type: "group",
      fields: [
        {
          type: "checkbox",
          name: "createGuildEvent",
          required: true,
          defaultValue: true,
        },
        {
          type: "checkbox",
          name: "createEmbedMessage",
          required: true,
          defaultValue: true,
        },
        {
          type: "checkbox",
          name: "mentionNotificationRoles",
          required: true,
          defaultValue: true,
        },
        {
          name: "eventMessages",
          type: "array",
          fields: [
            {
              type: "text",
              name: "messageId",
              required: true,
            },
            {
              type: "text",
              name: "channelId",
              required: true,
            },
          ],
        },
        {
          name: "guildEvents",
          type: "array",
          fields: [
            {
              type: "text",
              name: "eventId",
              required: true,
            },
            {
              type: "text",
              name: "guildId",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "gcal",
      type: "group",
      fields: [
        {
          name: "publishOnGCal",
          type: "checkbox",
          required: true,
          defaultValue: true,
        },
        {
          name: "events",
          type: "array",
          fields: [
            {
              name: "eventId",
              type: "text",
              required: true,
            },
            {
              name: "calendarId",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "organizer",
      type: "group",
      fields: [
        {
          name: "university",
          type: "relationship",
          relationTo: "universities",
        },
        {
          name: "contactName",
          type: "text",
        },
        {
          name: "contactEmail",
          type: "text",
        },
        {
          name: "formSubmission",
          type: "text",
          index: true,
        },
      ],
    },
    {
      name: "attendance",
      type: "number",
      required: true,
      defaultValue: 0,
    },
    guildEventField({
      name: "discordEvent",
      hidden: true,
    }),
    {
      name: "discordMessage",
      hidden: true,
      type: "group",
      fields: [
        guildChannelField({
          name: "channel",
        }),
        {
          name: "message",
          type: "text",
        },
      ],
    },
    {
      name: "googleCalendarId",
      type: "text",
      hidden: true,
    },
  ],
};

export default Events;
