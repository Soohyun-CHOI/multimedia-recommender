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
    const [maxMood, setMaxMood] = useState([]);

    const [playlistContents, setPlaylistContents] = useState([]);
    const [editList, setEditList] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const [collaborators, setCollaborators] = useState([]);
    const [editCollab, setEditCollab] = useState([]);
    const [deletedCollab, setDeletedCollab] = useState([]);
    const [isEditingCollab, setIsEditingCollab] = useState(false);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/playlist/${playlistId}`)
            .then(res => res.json())
            .then(resJson => {
                setPlaylistContents(resJson);
                setEditList(resJson);
            });

        fetch(`http://${config.server_host}:${config.server_port}/playlist_max_mood/${playlistId}`)
            .then(res => res.json())
            .then(resJson => setMaxMood(resJson[0]));

        fetch(`http://${config.server_host}:${config.server_port}/collaborators/${playlistId}`)
            .then(res => res.json())
            .then(resJson => {
                setCollaborators(resJson);
                setEditCollab(resJson);
            });
    }, [playlistId]);

    const toggleEditMode = () => {
        if (isEditing) {
            setEditList([...playlistContents]);
            setDeletedItems([]);
        }
        setIsEditing(!isEditing);
    }

    const toggleEditCollabMode = () => {
        if (isEditingCollab) {
            setEditCollab([...collaborators]);
            setDeletedCollab([]);
        }
        setIsEditingCollab(!isEditingCollab);
    }

    const handleDelete = mediaId => {
        setDeletedItems(prev => [...prev, mediaId]);
        setEditList(editList.filter(item => item.media_id !== mediaId));
    }

    const handleDeleteCollab = userId => {
        setDeletedCollab(prev => [...prev, userId]);
        setEditCollab(editCollab.filter(item => item.user_id !== userId));
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

    const handleSubmitCollab = async () => {
        for (let userId of deletedCollab) {
            await fetch(`http://${config.server_host}:${config.server_port}/delete_collaborator`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({playlist_id: playlistId, user_id: userId})
            });
        }
        setCollaborators(editCollab);
        setDeletedCollab([]);
        setIsEditingCollab(false);
    }

    return (
        <>
            <Banner/>
            <div className="title-wrap">
                <div className="titles">
                    <div className="title">{playlistContents[0] ? playlistContents[0].playlist_title : ""}</div>
                    <div className="max-mood">{maxMood.max_mood}</div>
                </div>
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
            <div className="collab">
                <div>
                    <div>Collaborators :</div>
                    {editCollab.map(item =>
                        <>
                            <div key={item.user_id}>{item.user_id}</div>
                            {isEditingCollab && (
                                <button onClick={() => handleDeleteCollab(item.user_id)}>Delete</button>
                            )}
                        </>
                    )}
                </div>
                <button onClick={toggleEditCollabMode}>{isEditingCollab ? "Cancel" : "Edit Collaborators"}</button>
                {isEditingCollab ? (
                    <button onClick={handleSubmitCollab} className="submit">Submit</button>
                ) : (
                    <NavLink to="">
                        <div className="more">Add Collaborators</div>
                    </NavLink>
                )}
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