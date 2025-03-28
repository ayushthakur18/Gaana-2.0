const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require('path');
const fs = require('fs')
require("dotenv").config();
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const app = express();

app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");  // Allow all origins
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const YT_API_KEY = process.env.YT_API_KEY;

const AUDIO_DIR = path.join(__dirname, "audio");
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

let logs = [];

app.get('/logs', async (req, res) => {
    res.send(logs);
});

app.use("/audio", express.static(AUDIO_DIR));

const yt = async (query) => {
    logs.push(`${query} came in yt channel`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${YT_API_KEY}&maxResults=1`;

    try {
        const { data } = await axios.get(url);
        if (!data.items.length) {
            logs.push('Couldnt get yt data');
            return { error: "No results found" };
        }

        const videoId = data.items[0].id.videoId;
        const title = data.items[0].snippet.title;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const audioFile = path.join(AUDIO_DIR, `${videoId}.mp3`);
        logs.push(`Successful search now trying to find file: ${audioFile}`);

        // If audio already exists, return it
        if (fs.existsSync(audioFile)) {
            logs.push('Got the audio file from cache');
            return { source: "YouTube", title, audioUrl: `https://my-music-tf55.onrender.com/audio/${videoId}.mp3` };
        }

        logs.push('Converting video to audio');
        try {
            const stream = ytdl(videoUrl, { quality: "highestaudio" });

            ffmpeg(stream)
                .audioCodec("libmp3lame")
                .toFormat("mp3")
                .save(audioFile)
                .on("end", () => logs.push("Conversion complete!"));

            logs.push(`Well something happened successully ${`https://my-music-tf55.onrender.com/audio/${videoId}.mp3`}`);
            return { source: "YouTube", title, audioUrl: `https://my-music-tf55.onrender.com/audio/${videoId}.mp3` };
        } catch (e) {
            logs.push('Problems occured at the time of conversion');
            logs.push(JSON.stringify(e));
            return { error: JSON.stringify(e) }
        }

    } catch (error) {
        logs.push(`Well something occured at the top error handler of yt ${JSON.stringify(error)}`);
        return { error: "YouTube API error", details: error.toString() };
    }
};

app.get("/search", async (req, res) => {
    const query = req.query.q;
    logs.push(`Got a request for query ${query}`);
    try {
        const y = await yt(query);
        if (y?.error) {
            res.json(y);
        }

        logs.push(`sent the response back to server ${JSON.stringify([y])}`);
        res.json([y]);
    } catch (error) {
        logs.push(`Error occured at the top error handler of search ${JSON.stringify(error)}`);
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎶 Server running on port ${PORT}`);
});