import React from "react";
import {useState, useEffect} from "react";
import {NavLink, useParams} from "react-router-dom";
import Banner from "../components/Banner";
import {handleStringSize} from "../helpers/helpers";

const config = require('../config.json');

function PlaylistDetailPage() {
    const params = useParams();
    const playlistId = params.playlistId
    const [playlistContents, setPlaylistContents] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/playlist/${playlistId}`)
            .then(res => res.json())
            .then(resJson => setPlaylistContents(resJson));
    }, []);

    console.log(playlistContents);

    return (
        <>
            <Banner/>
            <div className="title">{}</div>
            <div className="media-list">
                {playlistContents.map((media) =>
                    <div className="media" key={media.media_id}>
                        <div className="media-type">
                            {(media.media_type || " ").toUpperCase()}
                        </div>
                        <NavLink to={`/media/${media.media_id}`}>
                            <img src={media.image} alt=""/>
                        </NavLink>
                        <NavLink to={`/media/${media.media_id}`} className="media-title">
                            {handleStringSize(media.title)}
                        </NavLink>
                    </div>
                )}
            </div>
        </>
    );
}

export default PlaylistDetailPage;