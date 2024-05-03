import React, {useState, useEffect} from "react";
import {NavLink, useLocation} from "react-router-dom";
import config from "../config.json";
import Banner from "../components/Banner";
import {handleStringSize} from "../helpers/helpers";
import "../styles/ResultsPage.scss";

function ResultsPage() {
    const location = useLocation();
    const {searchInfo, selectedTypes, selectedMoods, filterData} = location.state;
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            const urls = createApiUrls(searchInfo, selectedTypes, selectedMoods, filterData);
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

    const createApiUrls = (searchInfo, types, moods, filterData) => {
        const moodParams = moods.map(mood => `${mood}=true`).join('&');
        let urls = [];

        Object.entries(types).forEach(([type, isSelected]) => {
            if (isSelected) {
                let params = [];
                const baseApiUrl = `http://${config.server_host}:${config.server_port}/${type}s`;

                params.push(`title=${encodeURIComponent(searchInfo)}`);
                params.push(moodParams);

                if (filterData[type]) {
                    if (filterData[type].year_range) {
                        params.push(`year_min=${filterData[type].year_range[0]}`);
                        params.push(`year_max=${filterData[type].year_range[1]}`);
                    }
                    if (filterData[type].genre) {
                        params.push(`genre=${filterData[type].genre.join('|')}`);
                    }
                    if (filterData[type].category) {
                        params.push(`category=${filterData[type].category.join('|')}`);
                    }
                    if (filterData[type].rating_num) {
                        params.push(`rating_num=${filterData[type].rating_num}`);
                    }
                    if (filterData[type].game_score) {
                        params.push(`game_score=${filterData[type].game_score}`);
                    }
                    if (filterData[type].tag_list) {
                        params.push(`tag_list=${filterData[type].tag_list.join('|')}`)
                    }
                }

                urls.push(`${baseApiUrl}?${params.join('&')}`);
            }
        });
        console.log(urls);
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