import { initializeDiscordClient } from "@djfigs1/payload-discord";
import { Client } from "discord.js";
import express from "express";
import payload from "payload";
import { setClient } from "@xrclub/club.js/dist/discord/bot";
import { ICXR } from "./server/icxr";

require("dotenv").config();
const app = express();

// Redirect root to ICXR
app.get("/", (_, res) => {
  res.redirect("https://icxr.org");
});

// Initialize Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET!,
  express: app,
  onInit: async () => {
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    await ICXR.init()
    
    initializeDiscordClient(async () => {
      var client = new Client({
        intents: [
          "MessageContent",
          "Guilds",
          "GuildMessages",
          "GuildMembers",
          "GuildMessageReactions",
        ],
      });

      client.on("ready", c => {
        setClient(c as any);
        console.log("Logged in as: " + client.user?.displayName);
      });

      return client;
    });
  },
});

// Add your own express routes here
app.listen(process.env.PORT ?? 3000);
