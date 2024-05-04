import React from "react";
import { useState, useEffect } from "react";

import { Navlink } from "react-router-dom";

const config = require('../config.json');

function PlaylistDetailPage(){
    const [playlistId, setPlaylistId] = useState('');
    const [playlistContents, setPlaylistContents] = useState([]);
    
    useEffect(() => {
        // fetch(`http://${config.server_host}:${config.server_port}/playlists`)
        //     .then(res => res.json())
        //     .then(resJson => {
        //         setPlaylistId(resJson.playlistId);
        //     })

        fetch(`http://${config.server_host}:${config.server_port}/playlist/${playlistId}`)
            .then(res => res.json())
            .then(resJson => setPlaylistContents(resJson));
    }, [playlistId]);
    return (
        <>
            <div className="media-list">
                {playlistContents.map((playlist)=>
                    <div className="title" key={playlist.id}>{playlist.title}</div>
                
                )}

            </div>
        </>
    );

}

export default PlaylistDetailPage;