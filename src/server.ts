import express from "express";
import payload from "payload";
import { ButtonStyle, Client } from "discord.js";
import { initializeDiscordClient } from "@djfigs1/payload-discord";
import { createButtonRowComponents, sendDiscordAuditMessage } from "./discord/bot";
import { createVRChatSessionEmbed } from "./discord/messages";

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
  onInit: () => {
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
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

      client.on("ready", () => {
        console.log("Logged in as: " + client.user?.displayName);
      });

      // deckard
      client.on("messageCreate", async msg => {
        if (msg.content == "Deckard when") {
          await msg.channel.send("Deckаrd now!")
        }
      })
      return client;
    });
  },
});

// Add your own express routes here
app.listen(process.env.PORT ?? 3000);
