import path from 'path';
import { createDiscordPlugin } from "payload-discord";
import { buildConfig } from 'payload/config';
import Admins from './collections/Admins';
import Events from './collections/Events';
import Projects from './collections/Projects';
import Universities from './collections/Universities';
import GoogleCalendar from './globals/GoogleCalendar';

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


