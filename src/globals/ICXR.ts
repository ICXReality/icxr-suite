import { GlobalConfig } from "payload/types";
import { guildChannelField, guildField } from "payload-discord/dist/fields";

const ICXR: GlobalConfig = {
  slug: "icxr",
  label: "ICXR",
  fields: [
    guildField({
        name: "guild"
    })
  ],
  typescript: {
    interface: "ICXR",
  },
};

export default ICXR;
