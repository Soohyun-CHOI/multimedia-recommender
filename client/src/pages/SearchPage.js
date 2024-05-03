import React, {useState, useEffect} from "react";
import Banner from "../components/Banner";
import {useNavigate} from "react-router-dom";

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
            setSelectedMoods(moods.filter(m => m !== mood))
        } else {
            setSelectedMoods([...selectedMoods, mood])
        }
    }

    const handleSearch = () => {
        console.log({
            searchInfo,
            SelectedTypes: Object.entries(selectedTypes).filter(([key, value]) => value).map(([key]) => key),
            selectedMoods
        });
        const state = {
            searchInfo,
            selectedTypes: {...selectedTypes},
            selectedMoods: [...selectedMoods]
        }
        navigate("/results", {state});
        console.log("Sending state:", state);
    }

    return (
        <>
            <Banner/>
            <input
                type="text"
                placeholder="Taylor Swift"
                value={searchInfo}
                onChange={e => setSearchInfo(e.target.value)}
            />
            <div>
                {Object.keys(selectedTypes).map(type =>
                    <label key={type}>
                        <input
                            type="checkbox"
                            checked={selectedTypes[type]}
                            onChange={() => handleSelectedTypes(type)}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                )}
            </div>
            <div>
                <button onClick={() => setShowDropdown(!showDropdown)}>Select Moods</button>
                {showDropdown &&
                    <div style={{position: 'absolute', background: 'white', border: '1px solid gray', padding: '10px'}}>
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
                <button onClick={handleSearch}>Search</button>
            </div>
        </>
    )
}

export default SearchPage;