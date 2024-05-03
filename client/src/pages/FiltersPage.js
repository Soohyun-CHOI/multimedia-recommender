import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { NavLink } from 'react-router-dom';
import "../styles/Filters.scss"
import christmasImage from '../assets/image/christmas_themed.jpg'
import halloweenImage from '../assets/image/halloween_themed.jpg'
const config = require('../config.json');

function FiltersPage() {
    const [christmasTag, setChristmasTag] = useState(false);
    const [halloweenTag, setHalloweenTag] = useState(false);
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        const themeData = {
            christmas: christmasTag,
            halloween: halloweenTag
        };
    

        const requestOptions = {
            method: 'POST',
            //headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(themeData)
        };
        console.log("We are here 1");
        console.log(requestOptions);

        try {
            console.log("We are here 2");
            const response = await fetch(`http://${config.server_host}:${config.server_port}/ordered_suggestion`, requestOptions);
            console.log("We are here 3");
            if (!response.ok){
                throw new Error('Failure');
            }
            console.log("We are here");
            const data = await response.json();
            console.log('Response:', data);
            
            
            
        }catch(error){
            console.error('failure', error);
            alert('failure');
        }
    }
    return(
        <>
            <Box className='filter-page'>
                <div className='header'>Select Options</div>
                <div className='selections'>
                    <Box 
                        className={`selection-box ${christmasTag ? 'selected' : ''}`}
                        onClick={() => setChristmasTag(!christmasTag)}
                    >
                        <div className="image-container">
                            <img src={christmasImage} alt="Christmas" />
                            <div>Christmas</div>
                        </div>
                    </Box>
                    <Box 
                        className={`selection-box ${halloweenTag ? 'selected' : ''}`}
                        onClick={() => setHalloweenTag(!halloweenTag)}
                    >
                        <div className="image-container">
                            <img src={halloweenImage} alt="Halloween" />
                            <div>Halloween</div>
                        </div>
                    </Box>
                </div>
        
                <NavLink to="/suggestions">
                    <Button onClick={handleSubmit}>Submit</Button>
                </NavLink>
                
            </Box>
        </>
    )
    

};
 

export default FiltersPage;