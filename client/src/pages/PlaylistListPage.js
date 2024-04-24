import React from "react";
import { useState, useEffect } from "react";
import { Navlink } from "react-router-dom";


const config = require('../config.json');

function PlaylistListPage() {
    const [playlists, setPlaylists] = useState([]);
    const [userId, setUserId] = useState([]);

    useEffect(() => {
        // fetch(`${config.server_host}:${config.server_port}/account_info`)
        //     .then(res => res.json())
        //     .then(resJson => {
        //         setUserId(resJson.userId);
        //     })

        fetch(`http://${config.server_host}:${config.server_port}/user_playlist/100000`)
            .then(res => res.json())
            .then(resJson => setPlaylists(resJson));
    });
    return (
        <> 
            test
            <div className="plist">
                <div className="media-wrap">
                    {playlists.map((user_playlist)=>
                        <div key={user_playlist.playlist_id}>
                            <h3>{user_playlist.title}</h3>
                        </div>
                    )}
                </div>
                
            </div>
            
            
        </>
    );
}

export default PlaylistListPage;