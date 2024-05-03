import React, {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";
import config from "../config.json";
import Banner from "../components/Banner";

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
            {results.map((res, idx) =>
                <div key={idx}>
                    {res.title}
                </div>
            )}
        </>
    )
}

export default ResultsPage;