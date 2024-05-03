import React, {useState, useEffect} from "react";
import Banner from "../components/Banner";
import {useNavigate} from "react-router-dom";
import {Range} from 'react-range';
import "../styles/SearchPage.scss"

function SearchPage() {
    const moods = [
        "christmas", "halloween", "valentine", "celebration", "relaxing", "nature", "industrial", "sunshine",
        "sad", "happy", "summer", "winter", "sports", "playful", "energetic", "scary", "anger", "optimistic",
        "adventurous", "learning", "artistic", "science", "cozy", "colorful", "space"
    ]

    const movieGenres = [
        "Comedy", "Crime", "Drama", "Science Fiction", "War", "Romance", "Horror", "Thriller", "Action", "Adventure",
        "Fantasy", "Mystery", "Animation", "Family", "Foreign", "Music", "History", "Documentary", "Western", "TV Movie"
    ]

    const showGenres = [
        "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy",
        "Game-Show", "History", "Horror", "Music", "Musical", "Mystery", "News", "Reality-TV", "Romance", "Sci-Fi",
        "Short", "Sport", "Talk-Show", "Thriller", "War", "Western"
    ]

    const songTags = ["rap", "rock", "pop", "rb", "country", "misc"]

    const bookCategories = [
        "fiction", "history", "religion", "juvenile fiction", "biography autobiography", "business economics", "computers",
        "social science", "juvenile nonfiction", "science", "education", "cooking", "sports recreation", "family relationships",
        "literary criticism", "music", "medical", "health fitness", "body mind spirit", "language arts disciplines",
        "political science", "art", "psychology", "philosophy", "travel", "technology engineering", "selfhelp", "poetry",
        "foreign language study", "crafts hobbies"
    ]

    const gameGenres = [
        "Action", "Adventure", "Indie", "RPG", "Strategy", "Simulation", "Casual", "Free to Play", "Massively Multiplayer",
        "Early Access", "Education", "Racing", "Sports", "Utilities", "Web Publishing", "Animation & Modeling", "Design & Illustration",
        "Photo Editing", "Accounting", "Game Development", "Audio Production", "Video Production", "Software Training",
        "360 Video", "Documentary", "Episodic", "Movie", "Short", "Tutorial", "Gore", "Violent", "Nudity", "Sexual Content"
    ]

    const gameCategories = [
        "Multi-player", "Online PvP", "PvP", "Shared/Split Screen PvP", "Valve Anti-Cheat enabled", "Single-player",
        "Partial Controller Support", "Steam Achievements", "Steam Cloud", "Steam Trading Cards", "Co-op", "Full controller support",
        "Remote Play on Phone", "Remote Play on Tablet", "Remote Play on TV", "Remote Play Together", "Shared/Split Screen",
        "Shared/Split Screen Co-op", "Online Co-op", "Steam Leaderboards", "In-App Purchases", "Cross-Platform Multiplayer",
        "Stats", "MMO", "Commentary available", "Captions available", "Includes level editor", "Steam Workshop",
        "LAN Co-op", "LAN PvP", "Steam Turn Notifications", "VR Only", "Tracked Controller Support", "VR Supported", "Includes Source SDK",
        "VR Support", "HDR available", "Mods", "Mods (require HL2)", "Tracked Motion Controller Support", "SteamVR Collectibles"
    ]

    const initialTypes = {
        movie: false,
        show: false,
        song: false,
        book: false,
        game: false
    }

    const [filterData, setFilterData] = useState({
        movie: {
            year_range: [1900, 2023],
            genre: []
        },
        show: {
            year_range: [1900, 2023],
            genre: [],
            rating_num: ""
        },
        song: {
            year_range: [1900, 2023],
            tag_list: []
        },
        book: {
            year_range: [1900, 2023],
            category: []
        },
        game: {
            year_range: [1900, 2023],
            genre: [],
            category: [],
            game_score: ""
        }
    })

    const [searchInfo, setSearchInfo] = useState("");
    const [selectedTypes, setSelectedTypes] = useState({...initialTypes});
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const CheckboxGroup = ({label, options, selectedOptions, setSelectedOptions}) => (
        <fieldset>
            <legend>{label}</legend>
            {options.map(option => (
                <label key={option}>
                    <input
                        type="checkbox"
                        checked={selectedOptions.includes(option)}
                        onChange={() => toggleOption(option, selectedOptions, setSelectedOptions)}
                    />
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
            ))}
        </fieldset>
    )

    const RadioButtonGroup = ({label, name, options, selectedValue, onChange}) => (
        <div>
            <fieldset>
                <legend>{label}</legend>
                {options.map(option => (
                    <label key={option}>
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={selectedValue === option}
                            onChange={onChange}
                        />
                        {option}
                    </label>
                ))}
            </fieldset>
        </div>
    )

    useEffect(() => {
        const resetForm = () => {
            setSearchInfo("");
            setSelectedTypes({...initialTypes});
            setSelectedMoods([]);
        }

        resetForm();
    }, []);

    const toggleOption = (option, selectedOptions, setSelectedOptions) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter(item => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    }

    const handleSelectedTypes = (type) => {
        setSelectedTypes(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    }

    const handleRangeData = (type, values) => {
        setFilterData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                year_range: values
            }
        }));
    }

    const handleFilterData = (type, field, value) => {
        setFilterData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
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
            selectedMoods: [...selectedMoods],
            filterData: {...filterData}
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
                        {Object.keys(selectedTypes).map(type =>
                            <div className="type" key={type}>
                                <label key={type}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes[type]}
                                        onChange={() => handleSelectedTypes(type)}
                                    />
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                                {selectedTypes[type] && (
                                    <>
                                        <div>Year Range: {filterData[type].year_range[0]} - {filterData[type].year_range[1]}</div>
                                        <Range
                                            step={1}
                                            min={1900}
                                            max={2023}
                                            values={filterData[type].year_range}
                                            onChange={values => handleRangeData(type, values)}
                                            renderTrack={({props, children}) => (
                                                <div {...props} style={{
                                                    height: '6px',
                                                    width: '100%',
                                                    backgroundColor: '#ccc'
                                                }}>{children}</div>
                                            )}
                                            renderThumb={({props}) => (
                                                <div {...props} style={{
                                                    ...props.style,
                                                    height: '20px',
                                                    width: '20px',
                                                    backgroundColor: '#555'
                                                }}/>
                                            )}
                                        />
                                        {type === "movie" && (
                                            <CheckboxGroup
                                                label="Genres" options={movieGenres}
                                                selectedOptions={filterData[type].genre}
                                                setSelectedOptions={options => handleFilterData(type, "genre", options)}
                                            />
                                        )}
                                        {type === "show" && (
                                            <>
                                                <RadioButtonGroup
                                                    label="Min Rating"
                                                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                                    name="show-rating"
                                                    selectedValue={filterData[type].rating_num}
                                                    onChange={e => handleFilterData(type, "rating-num", e.target.value)}
                                                />
                                                <CheckboxGroup
                                                    label="Genres" options={showGenres}
                                                    selectedOptions={filterData[type].genre}
                                                    setSelectedOptions={options => handleFilterData(type, "genre", options)}
                                                />
                                            </>
                                        )}
                                        {type === "song" && (
                                            <CheckboxGroup
                                                label="Genres" options={songTags}
                                                selectedOptions={filterData[type].tag_list}
                                                setSelectedOptions={options => handleFilterData(type, "tag_list", options)}
                                            />
                                        )}
                                        {type === "book" && (
                                            <CheckboxGroup
                                                label="Genres" options={bookCategories}
                                                selectedOptions={filterData[type].category}
                                                setSelectedOptions={options => handleFilterData(type, "category", options)}
                                            />
                                        )}
                                        {type === "game" && (
                                            <>
                                                <RadioButtonGroup
                                                    label="Min Rating"
                                                    options={[0, 20, 40, 60, 80, 100]}
                                                    name="game-score"
                                                    selectedValue={filterData[type].game_score}
                                                    onChange={e => handleFilterData(type, "game_score", e.target.value)}
                                                />
                                                <CheckboxGroup
                                                    label="Genres" options={gameGenres}
                                                    selectedOptions={filterData[type].genre}
                                                    setSelectedOptions={options => handleFilterData(type, "genre", options)}
                                                />
                                                <CheckboxGroup
                                                    label="Categories" options={gameCategories}
                                                    selectedOptions={filterData[type].category}
                                                    setSelectedOptions={options => handleFilterData(type, "category", options)}
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchPage;