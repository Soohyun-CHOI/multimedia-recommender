import React, {useEffect, useState} from 'react';
import {NavLink} from 'react-router-dom';
import "../styles/SuggestionPage.scss"
import {handleStringSize} from "../helpers/helpers";
import Banner from "../components/Banner";

const config = require('../config.json');

function SuggestionPage() {
    const [resultData, setResultData] = useState([]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/suggested_media?num_media=50`)
            .then(res => res.json())
            .then(resJson => setResultData(resJson))
    }, []);

    return (
        <>
            <Banner/>
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
        </>
    )
}

export default SuggestionPage;