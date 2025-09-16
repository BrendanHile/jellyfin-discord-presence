const axios = require("axios");
const RPC = require('discord-rpc');

const jellyfinUrl = "http://localhost:8096"; // Jellyfin server url
const UserId = "d5e42f72aed541679521d7178d95827e" // target account id
const accessToken = "9a72fa11fa5d4f6c8611c00116b3ab23"; // Jellyfin API Access Token
const discordRPCUpdateRate = 15 // seconds | Recommended 15s+ to prevent rate limit. 

const api = axios.create({
    baseURL: jellyfinUrl,
    headers: {
        'X-Emby-Token': accessToken,
        'Content-Type': 'application/json'
    }
});

const rpc = new RPC.Client({ transport: 'ipc' });

async function fetchSessions() {
    const response = await api.get("/Sessions");
    return response.data;
}

let updateCount = 1
async function updateRPC() {
    try {
        let sessions = await fetchSessions()

        if (sessions.length === 0) {
            console.log("No active playback sessions.");
            return;
        }

        sessions = sessions.filter(x => x.UserId == UserId)

        const currentSession = sessions[0]
        const playingData = currentSession?.NowPlayingItem

        const username = currentSession.UserName
        const deviceName = currentSession.DeviceName 
        const clientName = currentSession.Client 

        const IsPaused = currentSession?.PlayState.IsPaused

        const obj = {
            startTimestamp: Date.now(),
            largeImageKey: "jellyfin_logo",
            largeImageText: `Jellyfin on ${deviceName} `,
        };

        if (!playingData) {
            obj.details = "On Home"
            obj.state = "Not watching anything right now."
        } else {
            // show playing
            const startTime = Date.now() - Math.floor(currentSession?.PlayState?.PositionTicks / 10000);

            const mediaType = playingData?.Type
            const seriesName = playingData?.SeriesName
            const episodeName = playingData?.Name
            const seasonName = playingData?.SeasonName
            const episodeNumber = playingData?.IndexNumber ?? 0

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

            obj.smallImageKey = IsPaused == true ? "paused_gradient" : "playing_gradient"
            obj.smallImageText = `${IsPaused == true ? "Paused" : `Playing | ${username}`}`
            obj.startTimestamp = IsPaused == true ? undefined : startTime
        }

        await rpc.setActivity(obj)
        
        console.log(`Update #${updateCount}`)
        console.log("==================================================================")
        console.log(`Active Session : ${username}`)
        console.log(`Device         : ${deviceName}`)
        console.log(`Client         : ${clientName}`)
        console.log(`Video Paused   : ${IsPaused}`)
        console.log("")
        console.log(`Details        : ${obj.details}`)
        console.log(`State          : ${obj.state}`)
        console.log(`Large Img Text : ${obj.largeImageText}`)
        console.log("==================================================================")
        console.log("")

        updateCount++
    } catch (error) {
        console.error("Failed to fetch sessions:", error.message);
    }
}

async function fetchSessionsUser() {
    // gets all running sessions from server.

    const sessions = await fetchSessions()

    if (sessions?.length == 0) {
        console.log(`No Active Sessions.`)
        return
    } else {
        console.log("")
        console.log(`Found ${sessions?.length} Active Session${sessions?.length > 1 ? "s" : ""} on Jellyfin Server.`)
        sessions?.forEach((res, i) => {
            console.log(`[ ${i+1} ] ${res.UserName} on ${res?.DeviceName} (${res?.Client} ${res?.ApplicationVersion}) | ${res?.RemoteEndPoint}`)
            console.log(`    ↳ Username: ${res?.UserName}`)
            console.log(`    ↳ User ID: ${res?.UserId}`)
            console.log(`    ↳ Device Name: ${res?.UserId}`)
            console.log(`    ↳ Client: ${res?.Client} ${res?.ApplicationVersion}`)
            console.log(`    ↳ IP Address: ${res?.RemoteEndPoint}`)
            console.log(`    ↳ Tracked User: ${res?.UserId == UserId ? "Yes" : "No"}`)
        });
        console.log("")
    }
    
    // first update
    updateRPC();
    
    setInterval(() => {
        updateRPC();
    }, discordRPCUpdateRate * 1000);
}

fetchSessionsUser()

rpc.on('ready', () => {
    console.log(`Successfully connected to Discord as ${rpc.user.username}.`);
});

rpc.on("error", (e) => {
    console.log(`Discord PRC Error: ${e}`);
})

console.log("Attempting to connect to Discord RPC...");
rpc.login({ clientId: "1387060456979566815" }).catch(console.error);