import React from "react";
import { useState, useEffect } from "react";
import "../styles/PlaylistListPage.scss"
import { Navlink } from "react-router-dom";

function PlaylistDetailPage(){
    const [playlistId, setPlaylistId] = useState('');
    const [playlistContents, setPlaylistContents] = useState([]);
    
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/playlist`)

        fetch(`http://${config.server_host}:${config.server_port}/playlist/${playlistId}`)
    })

}

export default PlaylistDetailPage;