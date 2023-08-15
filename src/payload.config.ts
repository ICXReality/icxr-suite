import path from 'path';
import { createDiscordPlugin } from "payload-discord";
import { buildConfig } from 'payload/config';
import Admins from './collections/Admins';
import Events from './collections/Events';
import Projects from './collections/Projects';
import Universities from './collections/Universities';
import GoogleCalendar from './globals/GoogleCalendar';
import ICXR from './globals/ICXR';
import { webpackIgnore } from './webpack-ignore';

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Admins.slug,
    webpack: webpackIgnore(
      path.resolve(__dirname, "./mocks/EmptyObject.js"),
      ["./hooks/", "./discord/"],
      ["util"]
    )
  },
  collections: [
    Admins,
    Events,
    Universities,
    Projects
  ],
  globals: [
    ICXR,
    GoogleCalendar
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true
  },
  plugins: [
    createDiscordPlugin({
      options: {
        intents: []
      }
    })
  ]
});


