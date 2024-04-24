import React, {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import "../styles/HomPage.scss";
import config from "../config.json";
import Banner from "../components/Banner";

function HomePage() {
    const [summer, setSummer] = useState([]);
    const [cheerful, setCheerful] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/random_all/10/summer`)
            .then(res => res.json())
            .then(resJson => setSummer(resJson));

        fetch(`http://${config.server_host}:${config.server_port}/random_all/10/summer`)
            .then(res => res.json())
            .then(resJson => setCheerful(resJson));
    }, []);

    function handleStringSize(str) {
        if (str.length >= 24) return str.slice(0, 25) + "...";
        return str;
    }

    return (
        <>
            <div className="banner">
                <div className="title">THEME YOUR LIFE</div>
                <div className="menu-wrap">
                    <NavLink className="menu" to="/playlists">My Playlists</NavLink>
                    <NavLink className="menu" to="/search">Search Media</NavLink>
                </div>
            </div>
            <div className="theme">
                <div className="title">Summer for You</div>
                <div className="media-wrap">
                    {summer.map(media =>
                        <div className="media" key={media.media_id}>
                            <div className="media-type">{(media.media_type || " ").toUpperCase()}</div>
                            <NavLink to={`/media/${media.media_id}`}>
                                <img src={media.image} alt=""/>
                            </NavLink>
                            <NavLink to={`/media/${media.media_id}`} className="media-title">
                                {handleStringSize(media.title)}
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
            <div className="theme">
                <div className="title">Cheerful for You</div>
                <div className="media-wrap">
                    {cheerful.map(media =>
                        <div className="media" key={media.media_id}>
                            <div className="media-type">{(media.media_type || " ").toUpperCase()}</div>
                            <NavLink to={`/media/${media.media_id}`}>
                                <img src={media.image} alt=""/>
                            </NavLink>
                            <NavLink to={`/media/${media.media_id}`} className="media-title">
                                {handleStringSize(media.title)}
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default HomePage;