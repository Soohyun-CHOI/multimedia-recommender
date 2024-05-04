import React from "react";
import {useState, useEffect} from "react";
import {NavLink, useParams} from "react-router-dom";
import Banner from "../components/Banner";
import {handleStringSize} from "../helpers/helpers";
import "../styles/PlaylistDetailPage.scss";

const config = require('../config.json');

function PlaylistDetailPage() {
    const params = useParams();
    const playlistId = params.playlistId
    const [playlistContents, setPlaylistContents] = useState([]);
    const [editList, setEditList] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/playlist/${playlistId}`)
            .then(res => res.json())
            .then(resJson => {
                setPlaylistContents(resJson);
                setEditList(resJson);
            });
    }, [playlistId]);

    const toggleEditMode = () => {
        if (isEditing) {
            setEditList([...playlistContents]);
            setDeletedItems([]);
        }
        setIsEditing(!isEditing);
    }

    const handleDelete = mediaId => {
        setDeletedItems(prev => [...prev, mediaId]);
        setEditList(editList.filter(item => item.media_id !== mediaId));
    }

    const handleSubmit = async () => {
        for (let mediaId of deletedItems) {
            await fetch(`http://${config.server_host}:${config.server_port}/delete_media`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({playlist_id: playlistId, media_id: mediaId})
            });
        }
        setPlaylistContents(editList);
        setDeletedItems([]);
        setIsEditing(false)
    }

    return (
        <>
            <Banner/>
            <div className="title-wrap">
                <div className="title">{playlistContents[0] ? playlistContents[0].playlist_title : ""}</div>
                <div className="buttons">
                    <button onClick={toggleEditMode}>{isEditing ? "Cancel" : "Edit"}</button>
                    {isEditing ? (
                        <button onClick={handleSubmit} className="submit">Submit</button>
                    ) : (
                        <NavLink to="/search">
                            <div className="more">Search More Media +</div>
                        </NavLink>
                    )}
                </div>

            </div>
            <div className="media-list">
                {editList.map(media =>
                    <div className="media" key={media.media_id}>
                        <div className="top">
                            <div className="media-type">
                                {(media.media_type || " ").toUpperCase()}
                            </div>
                            {isEditing && (
                                <button onClick={() => handleDelete(media.media_id)}>X</button>
                            )}
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