import { CollectionConfig } from "payload/types";

/**
 * The directory to store the media relative to the project root folder.
 */
export const MediaDirectory = "./media";

const Media: CollectionConfig = {
    slug: "media",
    fields: [

    ],
    upload: {
        staticURL: "/media",
        staticDir: "../" + MediaDirectory,
        mimeTypes: ['image/*', 'audio/*']
    }
}

export default Media;