import path from "path";
import { createDiscordPlugin } from "@djfigs1/payload-discord";
import { buildConfig } from "payload/config";
import Admins from "./collections/Admins";
import Events from "./collections/Events";
import Projects from "./collections/Projects";
import Universities from "./collections/Universities";
import ICXR from "./globals/ICXR";
import { webpackIgnore } from "./webpack-ignore";
import Media from "./collections/Media";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export default buildConfig({
  serverURL: process.env.PUBLIC_URL,
  admin: {
    bundler: webpackBundler(),
    user: Admins.slug,
    webpack: webpackIgnore(
      path.resolve(__dirname, "./mocks/EmptyObject.js"),
      ["./hooks/", "./discord/", "./server/", "./endpoints/"],
      ["util"]
    ),
  },
  collections: [Admins, Events, Universities, Projects, Media],
  globals: [ICXR],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    disable: true,
  },
  db: mongooseAdapter({
    url: process.env.MONGO_URL!
  }),
  editor: lexicalEditor({}),
  plugins: [
    createDiscordPlugin({
      options: {
        intents: [],
      },
    }),
  ],
});
