import React, {useState, useEffect} from "react";
import Banner from "../components/Banner";
import {useNavigate} from "react-router-dom";
import "../styles/SearchPage.scss"

function SearchPage() {
    const moods = [
        "christmas", "halloween", "valentine", "celebration", "relaxing", "nature", "industrial", "sunshine",
        "sad", "happy", "summer", "winter", "sports", "playful", "energetic", "scary", "anger", "optimistic",
        "adventurous", "learning", "artistic", "science", "cozy", "colorful", "space"
    ]
    const initialTypes = {
        movie: false,
        show: false,
        song: false,
        book: false,
        game: false
    }

    const [searchInfo, setSearchInfo] = useState("");
    const [selectedTypes, setSelectedTypes] = useState({...initialTypes});
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const resetForm = () => {
            setSearchInfo("");
            setSelectedTypes({...initialTypes});
            setSelectedMoods([]);
        }

        resetForm();
    }, []);

    const handleSelectedTypes = (type) => {
        setSelectedTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }))
    }

    const toggleSelectedMoods = mood => {
        if (selectedMoods.includes(mood)) {
            setSelectedMoods(selectedMoods.filter(m => m !== mood))
        } else {
            setSelectedMoods([...selectedMoods, mood])
        }
    }

    const handleSearch = () => {
        // checks if any types are selected
        const isTypeSelected = Object.values(selectedTypes).some(value => value);

        // if no types are selected, treats all types as selected
        const resTypes = isTypeSelected ? selectedTypes : Object.keys(initialTypes).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});

        const state = {
            searchInfo,
            selectedTypes: resTypes,
            selectedMoods: [...selectedMoods]
        }
        navigate("/results", {state});
        console.log("Sending state:", state);
    }

    return (
        <>
            <Banner/>
            <div id="search">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search Your Media"
                        value={searchInfo}
                        onChange={e => setSearchInfo(e.target.value)}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <div className="filters">
                    <div className="moods">
                        <button onClick={() => setShowDropdown(!showDropdown)}>Select Moods <span>▼</span></button>
                        {showDropdown &&
                            <div className="drop-down">
                                {moods.map(mood =>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedMoods.includes(mood)}
                                            onChange={() => toggleSelectedMoods(mood)}
                                        />
                                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                    </label>
                                )}
                            </div>
                        }
                    </div>
                    <div className="types">
                        {Object.keys(selectedTypes).map((type, idx) =>
                            <div className="type" key={idx}>
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes[type]}
                                        onChange={() => handleSelectedTypes(type)}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchPage;