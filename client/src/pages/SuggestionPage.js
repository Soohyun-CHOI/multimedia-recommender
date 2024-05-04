import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/SuggestionPage.scss";
import { handleStringSize } from "../helpers/helpers";
import Banner from "../components/Banner";
import defaultImage from "../assets/image/movie_default.jpg";

const config = require("../config.json");

function SuggestionPage() {
  const [resultData, setResultData] = useState([]);

  const playlistId = localStorage.getItem("playlistId");
  console.log("Retrieved playlistId from local storage:", playlistId);

  const [addedMedia, setAddedMedia] = useState({});
  const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/suggested_media?num_media=10`)
            .then(res => res.json())
            .then(resJson => setResultData(resJson))
    }, []);

    const fetchAdditionalMedia = (type) => {
        const url = `http://${config.server_host}:${config.server_port}/additional_media?type=${type}`;
        fetch(url)
        .then((res) => {
            if (!res.ok) {
            throw new Error(
                `Failed to fetch additional media: ${res.statusText}`
            );
            }
            return res.json();
        })
        .then((data) => {
            console.log("Fetched additional media:", data); // Log the data to see what is received
            setResultData(data);
        })
        .catch((error) => {
            console.error("Error fetching additional media", error);
            alert("Error fetching additional media: " + error.message);
        });
    };

    const handleAddMedia = async (media_id) => {
        console.log("Adding media with ID:", media_id);
        const selectedData = {
        playlist_id: localStorage.getItem("playlistId"),
        media_id: media_id,
        };

        const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedData),
        };
        // route A: /new_media, requires playlist_id and media_id
        try {
        const response = await fetch(
            `http://${config.server_host}:${config.server_port}/new_media`,
            requestOptions
        );
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error("Failed to add media");
        }
        const data = await response.json();
        console.log("Media added successfully:", data); // Log successful addition

        // setAddedMedia(prev => {
        //     const newMediaState = { ...prev, [media_id]: true };
        //     console.log("Updated addedMedia state:", newMediaState); // Log the new state
        //     return newMediaState;
        // });
        setAddedMedia((prev) => ({ ...prev, [media_id]: true }));
        } catch (error) {
        console.error("Failed to add media", error);
        alert("Failed to add media");
        }
    };

    const handleDone = () => {
        navigate(`/playlist/${localStorage.getItem('playlistId')}`);
    };



    return (
        <>
            <Banner/>
            <div className="media-controls">
                <div>Add suggested media to your new playlist!</div>
                <button onClick={() => fetchAdditionalMedia('bk')}>Get More Books</button>
                <button onClick={() => fetchAdditionalMedia('tv')}>Get More Shows</button>
                <button onClick={() => fetchAdditionalMedia('mv')}>Get More Movies</button>
                <button onClick={() => fetchAdditionalMedia('mu')}>Get More Music</button>
                <button onClick={() => fetchAdditionalMedia('gm')}>Get More Games</button>
            </div>
            <div id="suggest-results">
                <div className="scrollable-content">
                    {resultData.map((suggested_media) =>
                        <div className="media" key={suggested_media.media_id}>
                            <div className="media-type">{(suggested_media.media_type || " ").toUpperCase()}</div>
                            <NavLink to={`/media/${suggested_media.media_id}`}>
                                <img
                                    onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultImage;
                                    }}
                                    src={suggested_media.image}
                                    alt="suggestd media image"
                                />
                            </NavLink>
                            <NavLink to={`/media/${suggested_media.media_id}`} className="media-title">
                                {handleStringSize(suggested_media.title)}
                            </NavLink>
                            {!addedMedia[suggested_media.media_id] && (
                                <button onClick={() => handleAddMedia(suggested_media.media_id)}>ADD</button>
                            )}
                        </div>
                    )}
                </div>
                
                
            </div>
            <button onClick={handleDone} className="done-button">Done</button>
        </>
    )
}

export default SuggestionPage;
