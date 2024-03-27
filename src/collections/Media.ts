import { CollectionConfig } from "payload/types";

/**
 * The directory to store the media relative to the project root folder.
 */
export const MediaDirectory = "./media";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: (args) => {
      if (args.req.user) {
        return true;
      }

      return {
        isPublic: {
            equals: true
        }
      }
    },
  },
  fields: [
    {
      name: "isPublic",
      type: "checkbox",
      defaultValue: true,
    },
  ],
  upload: {
    staticURL: "/media",
    staticDir: "../" + MediaDirectory,
    mimeTypes: ["image/*", "audio/*"],
  },
};

export default Media;
