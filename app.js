const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to access backend
const PORT = 5000;
const JAMENDO_CLIENT_ID = "515fa03c"; // Replace with your API key

// secret - a467b6cc1c614a7bbbe7ffe5ed0d079d

// 🎵 Fetch songs from Jamendo
// app.get("/search", async (req, res) => {
//     const query = req.query.q || "lofi"; // Default search query
//     const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${query}`;
    
//     try {
//         const response = await axios.get(url);



//         res.json(response.data.results);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching songs" });
//     }
// });

app.get("/search", async (req, res) => {
    const query = req.query.q || "lofi"; // Default search query
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=5&namesearch=${query}`;

    try {
        const response = await axios.get(url);
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: "Error fetching songs" });
    }
});

app.listen(PORT, () => console.log(`🎶 Server running on http://localhost:${PORT}`));
