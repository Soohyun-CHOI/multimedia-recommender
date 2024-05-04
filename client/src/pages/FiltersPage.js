import React, {useState} from 'react';
import {Box, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import "../styles/Filters.scss"
import christmasImage from '../assets/image/christmas_themed.jpg'
import halloweenImage from '../assets/image/halloween_themed.jpg'
import Banner from "../components/Banner";

const config = require('../config.json');

function FiltersPage() {
    const [isChristmas, setIsChristmas] = useState(false);
    const [isHalloween, setIsHalloween] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const themeData = {
            christmas: isChristmas,
            halloween: isHalloween
        };

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(themeData)
        };
        console.log(requestOptions);

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/ordered_suggestion`, requestOptions);
            if (!response.ok) {
                throw new Error('Failure');
            }
            const data = await response.json();
            console.log('Response:', data);
            navigate("/suggestions");
        } catch (error) {
            console.error('failure', error);
            alert('failure');
        }
    }

    return (
        <>
            <Banner/>
            <Box className='filter-page'>
                <div className='header'>Select Options</div>
                <div className='selections'>
                    <Box
                        className={`selection-box ${isChristmas ? 'selected' : ''}`}
                        onClick={() => setIsChristmas(!isChristmas)}
                    >
                        <div className="image-container">
                            <img src={christmasImage} alt="Christmas"/>
                            <div>Christmas</div>
                        </div>
                    </Box>
                    <Box
                        className={`selection-box ${isHalloween ? 'selected' : ''}`}
                        onClick={() => setIsHalloween(!isHalloween)}
                    >
                        <div className="image-container">
                            <img src={halloweenImage} alt="Halloween"/>
                            <div>Halloween</div>
                        </div>
                    </Box>
                </div>

                <Button onClick={handleSubmit}>Submit</Button>
            </Box>
        </>
    )
}

export default FiltersPage;