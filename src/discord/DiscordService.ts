import { Presence } from "discord-rpc"
import { JellyfinService } from "../jellyfin/JellyfinService.js"
import DiscordRPC from "./Client.js"
import Tags from "../utils/Tags.js"

export const DiscordService = {
    UpdateRPC: async () => {
        const mySession = await JellyfinService.GetMySession()

        if (mySession) {
            const np = mySession?.NowPlayingItem

            const isPaused = mySession?.PlayState.IsPaused

            const username = mySession.UserName // Your jellyfin username
            const deviceName = mySession.DeviceName // example: MASDEPAN-LAPTOP (Chrome)
            // const clientName = mySession.Client // likely 'Jellyfin Web' or 'Jellyfin Android'

            const obj: Presence = {
                startTimestamp: Date.now(),
                largeImageKey: "jellyfin_logo",
                largeImageText: `Jellyfin on ${deviceName} `,
                details: undefined,
                state: undefined
            };

            if (!np) {
                obj.details = "On Homepage"
                obj.state = "Scrolling through videos."
            } else {
                // show playing
                const startTime = Date.now() - Math.floor(mySession?.PlayState?.PositionTicks / 10000);
                
                // const mediaType: NowPlayingItemType = np?.Type
                const seriesName = np?.SeriesName
                const episodeName = np?.Name
                const seasonName = np?.SeasonName
                const episodeNumber = np?.IndexNumber ?? 0

                // idk bout this one lol
                const shortSeasonName = "S" + seasonName?.split(" ")[1]

                const shortSeaNEpsName = `${shortSeasonName}:E${episodeNumber}`
                if (isNaN(Number(seasonName?.split(" ")[1]))) {
                    // not valid series
                    obj.details = `${seriesName}`
                    obj.state = `${seasonName} ${episodeName}`
                } else {
                    // valid series
                    obj.details = `${seriesName}`
                    obj.state = `${shortSeaNEpsName} - ${episodeName}`
                }

                obj.smallImageKey = isPaused == true ? "paused_gradient" : "playing_gradient"
                obj.smallImageText = `${isPaused == true ? "Paused" : `Playing | ${username}`}`
                obj.startTimestamp = isPaused == true ? undefined : startTime
            }

            await DiscordRPC.setActivity(obj)

            console.log(`[${Tags.Discord}] ==================================================================`)
            console.log(`[${Tags.Discord}] Active Session : ${username}`)
            console.log(`[${Tags.Discord}] Device         : ${deviceName}`)
            console.log(`[${Tags.Discord}] Video State    : ${isPaused ? "Paused" : "Playing"}`)
            console.log(``)
            console.log(`[${Tags.Discord}] Details        : ${obj.details}`)
            console.log(`[${Tags.Discord}] State          : ${obj.state}`)
            console.log(`[${Tags.Discord}] Large Img Text : ${obj.largeImageText}`)
            console.log(`[${Tags.Discord}] ==================================================================`)
            console.log(``)
        }
    }
}