import React from "react";
import {NavLink} from "react-router-dom";
import "../styles/HomPage.scss";

function HomePage() {
    return (
        <>
            <div className="banner">
                <div className="title">THEME YOUR LIFE</div>
                <div className="menu-wrap">
                    <NavLink className="menu" to="/playlists">My Playlists</NavLink>
                    <NavLink className="menu" to="/search">Search Media</NavLink>
                </div>
            </div>
        </>
    );
}

export default HomePage;