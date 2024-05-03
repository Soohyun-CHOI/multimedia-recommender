import React, {useEffect, useState} from 'react';
import {NavLink} from 'react-router-dom';
import "../styles/Suggestions.scss"

const config = require('../config.json');

function SuggestionPage() {
    const [resultData, setResultData] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/suggested_media`)
            .then(res => res.json())
            .then(resJson => setResultData(resJson));
    });

    function handleStringSize(str) {
        if (!str) return str
        if (str.length >= 24) return str.slice(0, 25) + "...";
        return str;
    }

    return (
        <div id="suggest-results">
            {resultData.map((suggested_media) =>
                <div className="media" key={suggested_media.media_id}>
                    <div className="media-type">{(suggested_media.media_type || " ").toUpperCase()}</div>
                    <NavLink to={`/media/${suggested_media.media_id}`}>
                        <img src={suggested_media.image} alt=""/>
                    </NavLink>
                    <NavLink to={`/media/${suggested_media.media_id}`} className="media-title">
                        {handleStringSize(suggested_media.title)}
                    </NavLink>
                </div>
            )}
        </div>
    )
}

export default SuggestionPage;