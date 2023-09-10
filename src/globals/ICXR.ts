import { guildField } from "@djfigs1/payload-discord/dist/fields";
import { GlobalConfig } from "payload/types";

const ICXR: GlobalConfig = {
  slug: "icxr",
  label: "ICXR",
  fields: [
    guildField({
      name: "guild",
    }),
    {
      name: "google",
      label: "Google API",
      type: "group",
      fields: [
        {
          name: "clientId",
          type: "text",
        },
        {
          name: "clientSecret",
          type: "text",
        },
        {
          name: "refreshToken",
          type: "text",
          label: "Refresh Token",
          admin: {
            description:
              "Warning: This token effectively grants indefinite access to the ICXR Google Account. As such, do not share this token publicly!",
          },
        },
        {
          name: "calendarId",
          type: "text",
          admin: {
            description: "The Calendar that will be updated with events.",
          },
        },
        {
          name: "eventRequestForm",
          type: "group",
          fields: [
            {
              name: "eventForm",
              type: "text",
              admin: {
                description:
                  "The form whose responses will be scraped for event submissions.",
              },
            },
            {
              name: "nameId",
              type: "text",
            },
            {
              name: "locationId",
              type: "text",
            },
            {
              name: "descriptionId",
              type: "text",
            },
            {
              name: "startDateId",
              type: "text",
            },
            {
              name: "endDateId",
              type: "text",
            },
            {
              name: "contactNameId",
              type: "text",
            },
            {
              name: "contactEmailId",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
  typescript: {
    interface: "ICXR",
  },
};

export default ICXR;
