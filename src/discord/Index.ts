import { Client } from "discord-rpc";
import Tags from "../utils/Tags.js";
import DiscordRPC from "./Client.js";
import { DiscordService } from "./DiscordService.js";

const updateInterval = 1000 * 60 * 15 // I suggest putting around >15s
const clientId = process.env.DISCORD_CLIENT_ID

if (!clientId) {
    console.log(`[${Tags.System}] DISCORD_CLIENT_ID is missing on .env file. Pleaseee fill it out.`)
    process.exit(1)
}

DiscordRPC.on('ready', async (rpc: Client) => {
    console.log(`[${Tags.Discord}] Connected to Discord as ${rpc?.user?.username ?? "Unknown Username"} (${rpc?.user?.id ?? "Unknown User ID"}).`);

    setInterval(async () => {
        await DiscordService.UpdateRPC()
    }, updateInterval);

    await DiscordService.UpdateRPC()
});

DiscordRPC.on("error", (e) => {
    console.log(`[${Tags.Discord}] Failed to connect to Discord PRC.`);
    console.error(e)
})

console.log(`[${Tags.Discord}] Connecting to Discord RPC...`);

try {
    DiscordRPC.login({ clientId })
} catch (e) {
    console.log(`[${Tags.Discord}] Failed to connect to Discord PRC.`);
    console.error(e)
}