require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Load API keys from .env
const YT_API_KEY = process.env.YT_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// ✅ 1️⃣ YouTube Search
app.get("/search/youtube", async (req, res) => {
    const query = req.query.q;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${YT_API_KEY}&maxResults=5`;

    try {
        const { data } = await axios.get(url);
        res.json(data.items.map(item => ({
            source: "YouTube",
            title: item.snippet.title,
            videoId: item.id.videoId,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        })));
    } catch (error) {
        res.status(500).json({ error: "YouTube API error" });
    }
});

// ✅ Extract Audio from YouTube Video
app.get("/extract-audio", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: "Missing video URL" });

    const outputFile = path.join(__dirname, "public/audio.mp3");
    const command = `yt-dlp -x --audio-format mp3 "${videoUrl}" -o "${outputFile}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: stderr });

        // ✅ Serve extracted audio
        res.json({ message: "Audio extracted successfully!", audioUrl: `http://localhost:${PORT}/audio.mp3` });
    });
});

// ✅ 2️⃣ Jamendo Search
app.get("/search/jamendo", async (req, res) => {
    const query = req.query.q;
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=5&namesearch=${query}`;

    try {
        const { data } = await axios.get(url);
        res.json(data.results.map(track => ({
            source: "Jamendo",
            title: track.name,
            artist: track.artist_name,
            url: track.audio,
        })));
    } catch (error) {
        res.status(500).json({ error: "Jamendo API error" });
    }
});

// ✅ 3️⃣ Spotify Search (OAuth Required)
app.get("/search/spotify", async (req, res) => {
    const query = req.query.q;

    try {
        // Get Spotify Access Token
        const authResponse = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const accessToken = authResponse.data.access_token;

        // Search for Song
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`;
        const { data } = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        res.json(data.tracks.items.map(track => ({
            source: "Spotify",
            title: track.name,
            artist: track.artists[0].name,
            url: track.external_urls.spotify,
        })));
    } catch (error) {
        res.status(500).json({ error: "Spotify API error" });
    }
});

// ✅ 4️⃣ Combined Search API
app.get("/search", async (req, res) => {
    const query = req.query.q;
    try {
        const [yt, jamendo, spotify] = await Promise.all([
            axios.get(`http://localhost:${PORT}/search/youtube?q=${query}`),
            axios.get(`http://localhost:${PORT}/search/jamendo?q=${query}`),
            axios.get(`http://localhost:${PORT}/search/spotify?q=${query}`)
        ]);

        res.json([...yt.data, ...jamendo.data, ...spotify.data]);
    } catch (error) {
        res.status(500).json({ error: "Error fetching songs" });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🎶 Server running on http://localhost:${PORT}`));
