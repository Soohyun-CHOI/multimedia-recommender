import React, { useState } from 'react';
import {NavLink} from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import "../styles/LoginPage.scss"
import config from "../config.json";

//place holder log in page

function LoginPage() {
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Save the user ID to local storage
        localStorage.setItem('userId', userId || '100000'); // Default to '100000' if no input
        alert('Logged in with user ID: ' + (userId || '100000'));
        // Here you might redirect the user to another page or update the app's state
        navigate('/');

    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            <NavLink to="/" className="home-link">Home</NavLink>
        </div>
    );
}

export default LoginPage;
