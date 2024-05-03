import React, {useState, useEffect} from "react";
import {NavLink} from "react-router-dom";
import "../styles/HomPage.scss";
import config from "../config.json";
import {handleStringSize} from "../helpers/helpers";
import AddPlaylist from "../components/AddPlaylist";

function HomePage() {
    const [summer, setSummer] = useState([]);
    const [happy, setHappy] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/random_all/3/summer`)
            .then(res => res.json())
            .then(resJson => setSummer(resJson));

        fetch(`http://${config.server_host}:${config.server_port}/random_all/3/happy`)
            .then(res => res.json())
            .then(resJson => setHappy(resJson));
    }, []);

    return (
        <>
            <div className="main-banner">
                <div className="title">THEME YOUR LIFE</div>
                <div className="menu-wrap">
                    <button onClick={handleOpenModal} className="menu">Add Playlist</button>
                    <NavLink className="menu" to="/playlists">My Playlists</NavLink>
                    <NavLink className="menu" to="/search">Search Media</NavLink>
                </div>
            </div>
            <AddPlaylist open={isModalOpen} handleClose={handleCloseModal} />
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
                <div className="title">Happy for You</div>
                <div className="media-wrap">
                    {happy.map(media =>
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