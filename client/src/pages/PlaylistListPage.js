import React from "react";
import {useState, useEffect} from "react";
import "../styles/PlaylistListPage.scss"
import {useAuth0} from "@auth0/auth0-react";
import {NavLink} from "react-router-dom";
import Banner from "../components/Banner";


const config = require('../config.json');


function PlaylistListPage() {
    const [playlists, setPlaylists] = useState([]);
    const {user, isAuthenticated} = useAuth0();

    useEffect(() => {
        if (isAuthenticated) {
            fetch(`http://${config.server_host}:${config.server_port}/user_playlist/${user.email}`)
                .then(res => res.json())
                .then(resJson => setPlaylists(resJson));
        }
    }, [isAuthenticated]);

    return (
        <>
            <Banner/>
            <div className="plist">
                <div className="title">MY PLAYLISTS</div>
                <div className="media-wrap">
                    {playlists.map((user_playlist) => (
                        <NavLink
                            to={`/playlist/${user_playlist.playlist_id}`} // Assuming your playlist detail route is like '/playlist/:playlist_id'
                            key={user_playlist.playlist_id}
                        >
                            <div className="item">
                                <div className="title">{user_playlist.title}</div>
                                <div className="time">{user_playlist.timestamp && user_playlist.timestamp.slice(0, 10)}</div>
                            </div>
                        </NavLink>
                    ))}
                </div>

            </div>


        </>
    );
}

export default PlaylistListPage;