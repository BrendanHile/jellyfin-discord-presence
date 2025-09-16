import axios from "axios"

const jellyfinUrl = process.env.JELLYFIN_URL; // Jellyfin server url
const accessToken = process.env.JELLYFIN_ACCESS_TOKEN; // Jellyfin API Access Token

const JellyfinAPI = axios.create({
    baseURL: jellyfinUrl,
    headers: {
        'X-Emby-Token': accessToken,
        'Content-Type': 'application/json'
    }
});

export default JellyfinAPI