import React, {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import "../styles/HomPage.scss";

function HomePage() {
    const [summer, setSummer] = useState([]);
    const [cheerful, setCheerful] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/")
            .then(res => res.json())
            .then(resJson => setSummer(resJson));

        fetch("http://localhost:8080/")
            .then(res => res.json())
            .then(resJson => setCheerful(resJson));
    })

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
                        <div className="media">
                            <NavLink to={`/media/:${media.media_id}`}>
                                <img src={media.image} alt=""/>
                            </NavLink>
                            <NavLink to={`/media/:${media.media_id}`} className="media-title">
                                {media.title}
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
            <div className="theme">
                <div className="title">Cheerful for You</div>
                <div className="media-wrap">
                    {cheerful.map(media =>
                        <div className="media">
                            <NavLink to={`/media/:${media.media_id}`}>
                                <img src={media.image} alt=""/>
                            </NavLink>
                            <NavLink to={`/media/:${media.media_id}`} className="media-title">
                                {media.title}
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default HomePage;