import React from "react";
import {NavLink} from "react-router-dom";

function Header() {
    return (
        <>
            <div className="nav">
                <NavLink to="/" className="logo">
                    logo
                </NavLink>
                <NavLink to="/auth/profile">Profile</NavLink>
            </div>
            <div className="banner">
                <div className="title">THEME YOUR LIFE</div>
                <div className="menu">
                    <NavLink to="/playlists">My Playlists</NavLink>
                    <NavLink to="/search">Search</NavLink>
                </div>
            </div>
        </>
    );
}

export default Header;