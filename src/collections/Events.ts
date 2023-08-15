import { CollectionConfig } from "payload/types";
import PublishHook from "../hooks/Events/Publish";
import { guildEventField } from "payload-discord/dist/fields/guilds";
import UnpublishHook from "../hooks/Events/Unpublish";

function isInFuture(value: any) {
  let isInFuture = new Date(value).getTime() > Date.now();
  return isInFuture ? true : "Date needs to be in future!";
}

const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    afterChange: [ PublishHook ],
    afterDelete: [ UnpublishHook ]
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "publishDiscord",
      type: "checkbox",
      label: "Publish event on Discord",
      required: true,
      defaultValue: true,
    },
    {
      name: "publishCalendar",
      type: "checkbox",
      label: "Publish event on Google Calendar",
      required: true,
      defaultValue: true,
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "Pending",
      options: ["Pending", "Approved", "Rejected"],
    },
    {
      name: "location",
      type: "text",
      required: true
    },
    {
      name: "description",
      type: "textarea",
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
              pickerAppearance: "dayAndTime"
            }
          },
          validate: isInFuture
        },
        {
          name: "endDate",
          type: "date",
          required: true,
          admin: {
            date: {
              pickerAppearance: "dayAndTime"
            }
          },
          validate: isInFuture
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
      hidden: true
    })
  ],
};

export default Events;
