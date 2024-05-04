import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import Banner from "../components/Banner";
import config from "../config.json";
import "../styles/MediaDetailPage.scss";
import defaultImage from "../assets/image/movie_default.jpg";
import {useAuth0} from "@auth0/auth0-react";

function MediaDetailPage() {
    const params = useParams();
    const mediaId = params.mediaId;
    const {user, isAuthenticated} = useAuth0();
    const [media, setMedia] = useState([]);
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

    useEffect(() => {
        fetch(
            `http://${config.server_host}:${config.server_port}/media?media_id=${mediaId}`
        )
            .then(res => res.json())
            .then(resJson => setMedia(resJson[0]));

        if (isAuthenticated) {
            fetch(`http://${config.server_host}:${config.server_port}/user_playlist/${user.email}`)
                .then(res => res.json())
                .then(resJson => setMyPlaylists(resJson));
        }
    }, [mediaId, user, isAuthenticated]);

    const toggleAddMode = () => {
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setSelectedPlaylistId("");
    };

    const handleSubmit = async () => {
        if (selectedPlaylistId) {
            await fetch(`http://${config.server_host}:${config.server_port}/new_media`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({playlist_id: selectedPlaylistId, media_id: mediaId})
            });
            setIsAdding(false);
            setSelectedPlaylistId("");
        } else {
            alert("Please select a playlist.");
        }
    }

    return (
        <>
            <Banner/>
            <div id="media-detail">
                <img
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                    }}
                    src={media.image}
                    alt="media image"
                />
                <div className="contents">
                    <div className="title-wrap">
                        <div>
                            <div className="media-type">
                                {(media.media_type || " ").toUpperCase()}
                            </div>
                            <div className="title">{media.title}</div>
                        </div>
                        {isAuthenticated &&
                            <>
                                {isAdding ? (
                                    <div className="adding">
                                        <select value={selectedPlaylistId}
                                                onChange={e => setSelectedPlaylistId(e.target.value)}>
                                            <option value="">Select a playlist</option>
                                            {myPlaylists.map(playlist => (
                                                <option key={playlist.playlist_id}
                                                        value={playlist.playlist_id}>{playlist.title}</option>
                                            ))}
                                        </select>
                                        <div className="buttons">
                                            <button onClick={handleCancel}>Cancel</button>
                                            <button onClick={handleSubmit}>Add</button>
                                        </div>
                                    </div>
                                ) : <button onClick={toggleAddMode}>Add to My Playlist</button>}
                            </>
                        }
                    </div>
                    {media.media_type === "mv" && (
                        <>
                            <div className="info-wrap">
                                <div className="info">
                                    <span>• Release Year :</span> {media.release_date}
                                </div>
                                <div className="info">
                                    <span>• Genre :</span> {media.genres}
                                </div>
                                <div className="info">
                                    <span>• Cast :</span> {media.cast}
                                </div>
                            </div>
                            <div className="description">
                                <div className="title">Overview</div>
                                <div className="content">{media.overview}</div>
                            </div>
                        </>
                    )}
                    {media.media_type === "tv" && (
                        <>
                            <div className="info-wrap">
                                <div className="info">
                                    <span>• Release Year :</span> {media.release_year}
                                </div>
                                <div className="info">
                                    <span>• Genre :</span> {media.genres}
                                </div>
                                <div className="info">
                                    <span>• Rating :</span> {media.rating} / 10
                                </div>
                                <div className="info">
                                    <span>• Cast :</span> {media.cast}
                                </div>
                            </div>
                            <div className="description">
                                <div className="title">Synopsis</div>
                                <div className="content">{media.synopsis}</div>
                            </div>
                        </>
                    )}
                    {media.media_type === "mu" && (
                        <>
                            <div className="info-wrap">
                                <div className="info">
                                    <span>• Artist :</span> {media.artist}
                                </div>
                                <div className="info">
                                    <span>• Release Year :</span> {media.year}
                                </div>
                                <div className="info">
                                    <span>• Genre :</span> {media.tag}
                                </div>
                                <div className="info">
                                    <span>• Views :</span> {media.views}
                                </div>
                            </div>
                            <div className="description">
                                <div className="title">Lyrics</div>
                                <div className="content">{media.lyrics}</div>
                            </div>
                        </>
                    )}
                    {media.media_type === "gm" && (
                        <>
                            <div className="info-wrap">
                                <div className="info">
                                    <span>• Developer :</span> {media.developers}
                                </div>
                                <div className="info">
                                    <span>• Release Date :</span> {media.release_date}
                                </div>
                                <div className="info">
                                    <span>• Genre :</span> {media.genres}
                                </div>
                                <div className="info">
                                    <span>• Category :</span> {media.categories}
                                </div>
                                <div className="info">
                                    <span>• Score :</span> {media.metacritic_score} / 100
                                </div>
                                <div className="info">
                                    <span>• Price :</span> ${media.price}
                                </div>
                            </div>
                            <div className="description">
                                <div className="title">Description</div>
                                <div className="content">{media.about_the_game}</div>
                            </div>
                        </>
                    )}
                    {media.media_type === "bk" && (
                        <>
                            <div className="info-wrap">
                                <div className="info">
                                    <span>• Author :</span> {media.authors}
                                </div>
                                <div className="info">
                                    <span>• Publisher :</span> {media.publisher}
                                </div>
                                <div className="info">
                                    <span>• Published Date :</span> {media.published_date}
                                </div>
                                <div className="info">
                                    <span>• Genre :</span> {media.categories}
                                </div>
                            </div>
                            <div className="description">
                                <div className="title">Description</div>
                                <div className="content">{media.description}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default MediaDetailPage;
