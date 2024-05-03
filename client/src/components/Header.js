import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Header.scss";
// import logo from "../assets/images/logo.png";
import { useAuth0 } from "@auth0/auth0-react";

function Header() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const { logout } = useAuth0();

  if (isAuthenticated) {
    return (
      <div id="header">
        <NavLink to="/" className="logo">
          {/*<img src={logo} alt=""/>*/}
        </NavLink>
        <div>
          <NavLink to="/playlists" className="menu">
            My Playlists
          </NavLink>
          <NavLink to="/search" className="menu">
            Search
          </NavLink>
          <NavLink to="/account" className="menu">
            Profile
          </NavLink>
          <button
            className="menu"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="header">
      <NavLink to="/" className="logo">
        {/*<img src={logo} alt=""/>*/}
      </NavLink>
      <div>
        <button className="menu" onClick={() => loginWithRedirect()}>
          Log In
        </button>
        <NavLink to="/search" className="menu">
          Search
        </NavLink>
      </div>
    </div>
  );
}

export default Header;
