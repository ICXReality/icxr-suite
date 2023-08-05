import { buildConfig } from 'payload/config';
import path from 'path';
import Admins from './collections/Admins';
import { createDiscordPlugin } from "payload-discord"
import Events from './collections/Events';
import payload from 'payload';
import GoogleCalendar from './globals/GoogleCalendar';
import Universities from './collections/Universities';
import Projects from './collections/Projects';
export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Admins.slug,
  },
  collections: [
    Admins,
    Events,
    Universities,
    Projects
  ],
  globals: [
    GoogleCalendar
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    createDiscordPlugin({
      payload: payload,
      options: {
        intents: []
      }
    })
  ]
});


