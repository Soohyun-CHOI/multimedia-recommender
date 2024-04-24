import React from "react";
import {NavLink} from "react-router-dom";
import "../styles/Header.scss";
// import logo from "../assets/images/logo.png";

function Header() {
    return (
        <div id="header">
            <NavLink to="/" className="logo">
                {/*<img src={logo} alt=""/>*/}
            </NavLink>
            <div>
                <NavLink to="/playlists" className="menu">My Playlists</NavLink>
                <NavLink to="/search" className="menu">Search</NavLink>
                <NavLink to="/auth/profile" className="menu">Profile</NavLink>
            </div>
        </div>
    );
}

export default Header;