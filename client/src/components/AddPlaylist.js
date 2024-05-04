import React, {useEffect, useState} from "react";
import {Box, Button, TextField, Modal, Checkbox} from "@mui/material";
import "../styles/AddPlaylist.scss";
import {useAuth0} from "@auth0/auth0-react";
import {NavLink, useNavigate} from "react-router-dom";

const config = require("../config.json");

function AddPlaylist({open, handleClose}) {

    const [titleInput, setTitleInput] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const { user } = useAuth0();
    const navigate = useNavigate();

    const handleCheckboxChange = (event) => {
        setIsPublic(event.target.checked);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!titleInput.trim()) {
            alert("Playlist name is required.");
            return;
        }

        // server side parameters
        //   const user_id = req.body.user_id;
        //   const playlist_name = req.body.playlist_name;
        //   const public = req.body.public;
        //   const image_URL = req.body.image_URL ?? "N/A";

        const playlistData = {
            playlist_name: titleInput, 
            public: isPublic, 
            user_id: user.email
        };

        const requestOptions = {
            method: "POST", 
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify(playlistData)
        };

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/new_playlist`, requestOptions);
            if (!response.ok) {
                throw new Error("Failed to create new playlist");
            }
            const data = await response.json();
            console.log("Response:", data);
            
            const newPlaylistId = data.playlist_id;
            localStorage.setItem('playlistId', newPlaylistId);
            console.log("New playlistId set in local storage:", newPlaylistId);

            handleClose();
            navigate('/filters');
        } catch (error) {
            console.error("Failed to create new playlist:", error);
            alert("Failed to add playlist.");
        }
    };

    return (
        <>
            <Modal open={open} onClose={handleClose} className="add-playlist-modal">
                <Box className="modal-content">
                    <div className="header">New Playlist</div>
                    <div className="body">
                        <TextField
                            fullWidth
                            label="Playlist Name"
                            variant="outlined"
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                        <Checkbox
                            name="Public"
                            checked={isPublic}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                    <div className="footer">
                        <Button onClick={handleClose} className="button">
                            Close
                        </Button>
                        <NavLink to="/filters">
                            <Button onClick={handleSubmit} className="button">
                                Find A Theme
                            </Button>
                        </NavLink>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

export default AddPlaylist;