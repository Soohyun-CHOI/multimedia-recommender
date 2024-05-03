import React, {useState, useEffect} from "react";
import {NavLink, useLocation} from "react-router-dom";
import config from "../config.json";
import Banner from "../components/Banner";
import {handleStringSize} from "../helpers/helpers";
import "../styles/ResultsPage.scss";

function ResultsPage() {
    const location = useLocation();
    const {searchInfo, selectedTypes, selectedMoods} = location.state;
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            const urls = createApiUrls(searchInfo, selectedTypes, selectedMoods);
            const apiPromises = urls.map(url => fetch(url).then(res => res.json()));
            try {
                const resultsFromApis = await Promise.all(apiPromises);
                setResults(resultsFromApis.flat());
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setResults([]);
            }
        };

        fetchResults();
    }, [searchInfo, selectedTypes, selectedMoods]);

    const createApiUrls = (searchInfo, types, moods) => {
        const moodParams = moods.map(mood => `${mood}=true`).join('&');
        let urls = [];

        Object.entries(types).forEach(([type, isSelected]) => {
            if (isSelected) {
                const baseApiUrl = `http://${config.server_host}:${config.server_port}/${type}s`;
                urls.push(`${baseApiUrl}?title=${encodeURIComponent(searchInfo)}&${moodParams}`);
            }
        });

        return urls;
    }

    return (
        <>
            <Banner/>
            <div id="results">
                {results.map(media =>
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
        </>
    );
}

export default ResultsPage;