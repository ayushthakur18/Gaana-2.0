import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [query, setQuery] = useState("");
    const [source, setSource] = useState("youtube");
    const [track, setTrack] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchMusic = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setTrack(null);

        try {
            const { data } = await axios.get(`http://localhost:5000/api/search?query=${query}&source=${source}`);
            setTrack(data);
        } catch (err) {
            setError("Error fetching music");
        }
        
        setLoading(false);
    };

    return (
        <div className="app-container">
            <h1>Multi-Source Music Player</h1>
            <form onSubmit={searchMusic} className="search-form">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search for a song" 
                    required
                />
                <select value={source} onChange={(e) => setSource(e.target.value)}>
                    <option value="youtube">YouTube</option>
                    <option value="spotify">Spotify</option>
                    <option value="jamendo">Jamendo</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {track && (
                <div className="track-container">
                    <p>Now Playing: <a href={track.url} target="_blank" rel="noopener noreferrer">{track.title}</a></p>
                </div>
            )}
        </div>
    );
};

export default App;
