import React, {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import "../styles/HomPage.scss";
import config from "../config.json";
import {handleStringSize} from "../helpers/helpers";
import AddPlaylist from "../components/AddPlaylist";
import {useAuth0} from "@auth0/auth0-react";
import defaultImage from "../assets/image/movie_default.jpg";

function HomePage() {
    const [summer, setSummer] = useState([]);
    const [happy, setHappy] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const {user, loginWithRedirect, isAuthenticated, isLoading} = useAuth0();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    function addNewUser() {
        fetch(`http://${config.server_host}:${config.server_port}/new_user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data); // Handle the response data here
            });
    }

    useEffect(() => {
        isAuthenticated && addNewUser();

        fetch(
            `http://${config.server_host}:${config.server_port}/random_all/3/summer`
        )
            .then((res) => res.json())
            .then((resJson) => setSummer(resJson));

        fetch(
            `http://${config.server_host}:${config.server_port}/random_all/3/happy`
        )
            .then((res) => res.json())
            .then((resJson) => setHappy(resJson));
    }, [isAuthenticated]);

    function handleStringSize(str) {
        if (!str) return str;
        if (str.length >= 24) return str.slice(0, 25) + "...";
        return str;
    }

    return (
        <>
            <div className="main-banner">
                <div className="title">THEME YOUR LIFE</div>
                <div className="menu-wrap">
                    {isAuthenticated && (
                        <>
                            <button onClick={handleOpenModal} className="menu">
                                Create Playlist
                            </button>
                            <NavLink className="menu" to="/playlists">
                                My Playlists
                            </NavLink>
                            <NavLink className="menu" to="/search">
                                Search Media
                            </NavLink>
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <button className="menu" onClick={() => loginWithRedirect()}>
                                Log In
                            </button>
                        </>
                    )}
                </div>
            </div>
            <AddPlaylist open={isModalOpen} handleClose={handleCloseModal}/>
            <div className="theme">
                <div className="title">Summer for You</div>
                <div className="media-wrap">
                    {summer.map((media) => (
                        <div className="media" key={media.media_id}>
                            <div className="media-type">
                                {(media.media_type || " ").toUpperCase()}
                            </div>
                            <NavLink to={`/media/${media.media_id}`}>
                                <img
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                    src={media.image}
                                    alt="media image"
                                />
                            </NavLink>
                            <NavLink to={`/media/${media.media_id}`} className="media-title">
                                {handleStringSize(media.title)}
                            </NavLink>
                        </div>
                    ))}
                </div>
            </div>
            <div className="theme">
                <div className="title">Happy for You</div>
                <div className="media-wrap">
                    {happy.map((media) => (
                        <div className="media" key={media.media_id}>
                            <div className="media-type">
                                {(media.media_type || " ").toUpperCase()}
                            </div>
                            <NavLink to={`/media/${media.media_id}`}>
                                <img
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                    src={media.image}
                                    alt="media image"
                                />
                            </NavLink>
                            <NavLink to={`/media/${media.media_id}`} className="media-title">
                                {handleStringSize(media.title)}
                            </NavLink>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default HomePage;
