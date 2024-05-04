import React from "react";
import { useState, useEffect } from "react";
import "../styles/PlaylistListPage.scss"
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";


const config = require('../config.json');


function PlaylistListPage() {
    const [playlists, setPlaylists] = useState([]);
    const { user, isAuthenticated, isLoading } = useAuth0();
    

    useEffect(() => {
        // fetch(`${config.server_host}:${config.server_port}/account_info`)
        //     .then(res => res.json())
        //     .then(resJson => {
        //         setUserId(resJson.userId);
        //     })

        fetch(`http://${config.server_host}:${config.server_port}/user_playlist/${user.email}`)
            .then(res => res.json())
            .then(resJson => setPlaylists(resJson));
    });
    return (
        <> 
            <div className="plist">
                <div className="title">MY PLAYLISTS</div>
                <div className="media-wrap">
                    {playlists.map((user_playlist)=>
                        <div className="item" key={user_playlist.playlist_id}>
                            <h3>{user_playlist.title}</h3>
                            <p>{user_playlist.creator}</p>
                        </div>
                    )}
                </div>
                
            </div>
            
            
        </>
    );
}

export default PlaylistListPage;