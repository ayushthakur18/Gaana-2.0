const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require('path');
const fs = require('fs')
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
app.use(cors());
const YT_API_KEY = process.env.YT_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

// Ensure "audio" directory exists
const AUDIO_DIR = path.join(__dirname, "audio");
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

// Function to execute shell commands with a promise
const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(stderr || error);
            else resolve(stdout);
        });
    });
};

// 1️⃣ YouTube Search & Audio Extraction
app.get("/search/youtube", async (req, res) => {
    const query = req.query.q;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${YT_API_KEY}&maxResults=1`;

    try {
        const { data } = await axios.get(url);
        if (!data.items.length) return res.status(404).json({ error: "No results found" });

        const videoId = data.items[0].id.videoId;
        const title = data.items[0].snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const audioFile = path.join(AUDIO_DIR, `${videoId}.mp3`);

        // If audio already exists, return it
        if (fs.existsSync(audioFile)) {
            return res.json({ source: "YouTube", title, audioUrl: `http://localhost:${PORT}/audio/${videoId}.mp3` });
        }

        // Extract audio using yt-dlp
        const command = `yt-dlp -x --audio-format mp3 "${videoUrl}" -o "${AUDIO_DIR}/%(id)s.%(ext)s"`;
        await runCommand(command);

        res.json({ source: "YouTube", title, audioUrl: `http://localhost:${PORT}/audio/${videoId}.mp3` });

    } catch (error) {
        res.status(500).json({ error: "YouTube API error", details: error.toString() });
    }
});

// Serve audio files
app.use("/audio", express.static(AUDIO_DIR));

// 2️⃣ Jamendo Search
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

// 3️⃣ Spotify Search (OAuth Required)
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

// Combined Search API
app.get("/search", async (req, res) => {
    const query = req.query.q;
    try {
        const [yt] = await Promise.all([
            axios.get(`http://localhost:5000/search/youtube?q=${query}`),
            // axios.get(`http://localhost:5000/search/jamendo?q=${query}`),
            // axios.get(`http://localhost:5000/search/spotify?q=${query}`)
        ]);

        console.log('sent', yt.data);
        

        res.json([yt.data]); // , ...jamendo.data, ...spotify.data
    } catch (error) {
        res.status(500).json({ error: "Error fetching songs" });
    }
});

const PORT = process.env.PORT || 5000;  // Render sets PORT dynamically

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎶 Server running on port ${PORT}`);
});
