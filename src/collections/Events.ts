import { CollectionConfig } from "payload/types";
import PublishHook from "../hooks/Events/Publish";
import { guildEventField } from "payload-discord/dist/fields/guilds";
import UnpublishHook from "../hooks/Events/Unpublish";
import ImportResponsesEndpoint from "../endpoints/Events/ImportResponses";

function isInFuture(value: any) {
  let isInFuture = new Date(value).getTime() > Date.now();
  return isInFuture ? true : "Date needs to be in future!";
}

const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "name",
  },
  endpoints: [
    ImportResponsesEndpoint
  ],
  hooks: {
    afterChange: [ PublishHook ],
    beforeDelete: [ UnpublishHook ]
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
      name: "organizer",
      type: "group",
      fields: [
        {
          name: "university",
          type: "relationship",
          relationTo: "universities"
        },
        {
          name: "contactName",
          type: "text",
        },
        {
          name: "contactEmail",
          type: "text"
        },
        {
          name: "formSubmission",
          type: "text",
          index: true
        }
      ]
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
    }),
    {
      name: "googleCalendarId",
      type: "text",
      hidden: true
    }
  ],
};

export default Events;
