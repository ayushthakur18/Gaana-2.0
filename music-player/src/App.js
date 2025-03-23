import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchMusic = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError("");
    setSongs([]);

    try {
      const { data } = await axios.get(`https://my-music-tf55.onrender.com/search?q=${query}`);
      setSongs(data);
    } catch (err) {
      setError("Failed to fetch music. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>🎵 Music Finder</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={searchMusic}>Search</button>
      </div>

      {loading && <p>Loading music...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <div key={index} className="song-card">
              <h3>{song.title}</h3>
              <p>Source: {song.source}</p>
              {song.audioUrl ? (
                <audio controls>
                  <source src={song.audioUrl} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <a href={song.url} target="_blank" rel="noopener noreferrer">
                  Listen Here
                </a>
              )}
            </div>
          ))
        ) : (
          !loading && <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default App;
