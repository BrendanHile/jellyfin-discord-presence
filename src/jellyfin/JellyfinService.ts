import { SessionsInfo } from "../types/jellyfin/SessionsInfo.js";
import Tags from "../utils/Tags.js";
import JellyfinAPI from "./Client.js";

export const JellyfinService = {
    GetSessions: async () => {
        const response = await JellyfinAPI.get<SessionsInfo>("/Sessions", {
            validateStatus: () => true
        });

        if (response.status == 401) {
            console.log(`[${Tags.Jellyfin}] Failed to get sessions info: ${response.status}. Please update your jellyfin access token.`)
            return null
        }

        return response.data;
    },
    GetSessionByUserID: async (UserId: string) => {
        const sessions = await JellyfinService.GetSessions()

        // console.log(`[${Tags.Debug}] User ID: ${UserId}`)
        const mySession = sessions?.find((x) => x.UserId == UserId) ?? null

        return mySession
    },
    GetMySession: async () => {
        const sessions = await JellyfinService.GetSessions()
        const myUserID = process.env.JELLYFIN_TARGET_USERID

        if (!myUserID) {
            console.log(`[${Tags.System}] JELLYFIN_TARGET_USERID is empty! Please fill out on .env file!`)
            return null
        }

        // console.log(`[${Tags.Debug}] User ID: ${myUserID}`)
        const mySession = sessions?.find((x) => x.UserId == myUserID) ?? null

        return mySession
    },
    GetMyNowPlayingData: async () => {
        const mySession = await JellyfinService.GetMySession()

        if (!mySession) {
            console.log(`[${Tags.Jellyfin}] Couldn't find any active session. Try playing a video.`)
            return null
        }

        const NowPlayingItem = mySession.NowPlayingItem

        return NowPlayingItem
    },
    GetUsersSessions: async () => {
        const sessions = await JellyfinService.GetSessions()

        const output = {
            users_count: sessions?.length ?? 0,
            user_data: sessions ?? []
        }

        return output
    }
}