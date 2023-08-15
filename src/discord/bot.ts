import { Guild } from "discord.js";
import payload from "payload";
import { getDiscordClient } from "payload-discord/dist/discord/bot";

export async function getICXRGuild(): Promise<Guild | null> {
    let client = getDiscordClient();
    let icxr = await payload.findGlobal({ slug: "icxr" })
    if (client && icxr.guild) {
        let guild = await client.guilds.fetch(icxr.guild);
        return guild;
    }

    return null;
}