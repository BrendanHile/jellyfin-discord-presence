
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 4444;

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = process.env;
const REDIRECT_URI = `http://localhost:${PORT}/auth/discord/callback`;

app.get('/', (req, res) => {
    // Provide the user with the link to start the OAuth2 flow.
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=rpc.activities.write`;
    res.send(`
        <h1>Discord OAuth2 Server</h1>
        <p>Your server is running correctly.</p>
        <p>Click the link below to authorize your application.</p>
        <a href="${authUrl}">Authorize with Discord</a>
        <p><strong>Note:</strong> Make sure you have added <code>${REDIRECT_URI}</code> to your application's Redirect URIs in the Discord Developer Portal.</p>
    `);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;

    console.log(`Received authorization code: ${code}`);

    if (!code) {
        return res.status(400).send("Authorization denied by user.");
    }

    try {
        const params = new URLSearchParams();
        params.append('client_id', DISCORD_CLIENT_ID);
        params.append('client_secret', DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);

        console.log("Exchanging code for access token...");

        const tokenResponse = await axios.post(
            'https://discord.com/api/v10/oauth2/token',
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        console.log("\n--- TOKEN EXCHANGE SUCCESSFUL ---");
        console.log("Access Token:", access_token);
        console.log("Refresh Token:", refresh_token);
        console.log(`Expires in: ${expires_in} seconds`);
        console.log("---------------------------------\n");

        res.send("<h1>Authentication Successful!</h1><p>You can now close this tab. The tokens have been logged to the server console.</p>");

    } catch (error) {
        console.error("Error exchanging code for token:", error.response?.data || error.message);
        res.status(500).send("An error occurred while authenticating with Discord.");
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        console.error("\nFATAL ERROR: DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET is not defined.");
        console.error("Please create a '.env' file and add your credentials.\n");
        process.exit(1);
    }
});