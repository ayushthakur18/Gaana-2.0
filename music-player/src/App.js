// import React, { useState } from "react";
// import axios from "axios";

// function App() {
//     const [query, setQuery] = useState("");
//     const [songs, setSongs] = useState([]);
//     const [error, setError] = useState(null);

//     // 🔍 Function to search music across all platforms
//     const searchMusic = async () => {
//         if (!query.trim()) return; // Ignore empty queries

//         try {
//             setError(null);
//             const response = await axios.get(`http://localhost:5000/search?q=${query}`);
//             setSongs(response.data);
//         } catch (err) {
//             setError("Error fetching music. Please try again.");
//         }
//     };

//     return (
//         <div style={{ textAlign: "center", padding: "20px" }}>
//             <h1>🎵 Multi-Source Music Player</h1>
//             <input
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search for a song..."
//                 style={{ padding: "10px", width: "300px" }}
//             />
//             <button onClick={searchMusic} style={{ padding: "10px 20px", marginLeft: "10px" }}>
//                 Search
//             </button>

//             {error && <p style={{ color: "red" }}>{error}</p>}
            
//             {console.log("h")}
//             {console.log(songs)}

//             <div style={{ marginTop: "20px" }}>
//                 {songs.map((song, index) => (
//                     <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
//                         <p><strong>{song.title}</strong> ({song.source})</p>
                        
//                         console.log(song);
                        

//                         {/* 🎧 If audioUrl exists, show audio player */}
//                         {song.audioUrl ? (
//                             <audio controls>
//                                 <source src={song.audioUrl} type="audio/mp3" />
//                                 Your browser does not support the audio tag.
//                             </audio>
//                         ) : (
//                             <a href={song.url} target="_blank" rel="noopener noreferrer">🎧 Listen</a>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default App;


import React, { useState } from "react";
import axios from "axios";

function App() {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [error, setError] = useState(null);

    // 🔍 Function to search music across all platforms
    const searchMusic = async () => {
        if (!query.trim()) return; // Ignore empty queries

        try {
            setError(null);
            console.log("Fetching songs...");

            const response = await axios.get(`http://localhost:5000/search?q=${query}`);
            
            if (response.data && Array.isArray(response.data)) {
                setSongs(response.data);
                console.log("Songs received:", response.data);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Error fetching music:", err);
            setError("Error fetching music. Please try again.");
            setSongs([]); // Ensure previous results are cleared
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>🎵 Multi-Source Music Player</h1>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a song..."
                style={{ padding: "10px", width: "300px" }}
            />
            <button onClick={searchMusic} style={{ padding: "10px 20px", marginLeft: "10px" }}>
                Search
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginTop: "20px" }}>
                {songs.length === 0 && !error && <p>No results found.</p>}

                {songs.map((song, index) => (
                    <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <p><strong>{song.title}</strong> ({song.source})</p>

                        {/* 🎧 If audioUrl exists, show audio player */}
                        {song.audioUrl ? (
                            <audio controls>
                                <source src={song.audioUrl} type="audio/mp3" />
                                Your browser does not support the audio tag.
                            </audio>
                        ) : (
                            <a href={song.url} target="_blank" rel="noopener noreferrer">🎧 Listen</a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
