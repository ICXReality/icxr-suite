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

export default buildConfig({
  serverURL: "http://localhost:3000",
  admin: {
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
  plugins: [
    createDiscordPlugin({
      options: {
        intents: [],
      },
    }),
  ],
});
