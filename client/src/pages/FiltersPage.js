import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import {useNavigate} from 'react-router-dom';

import Banner from "../components/Banner";
import "../styles/Filters.scss";


import adventurousImage from '../assets/image/adventurous_themed.jpg';
import angerImage from '../assets/image/anger_themed.jpg';
import artisticImage from '../assets/image/artistic_themed.jpg';
import celebrationImage from '../assets/image/celebration_themed.jpg';
import christmasImage from '../assets/image/christmas_themed.jpg';
import colorfulImage from '../assets/image/colorful_themed.jpg';
import cozyImage from '../assets/image/cozy_themed.jpg';
import energeticImage from '../assets/image/energetic_themed.jpg';
import halloweenImage from '../assets/image/halloween_themed.jpg';
import happyImage from '../assets/image/happy_themed.jpg';
import industrialImage from '../assets/image/industrial_themed.jpg';
import learningImage from '../assets/image/learning_themed.jpg';
import natureImage from '../assets/image/nature_themed.jpg';
import optimisticImage from '../assets/image/optimistic_themed.jpg';
import playfulImage from '../assets/image/playful_themed.jpg';
import relaxedImage from '../assets/image/relaxed_themed.jpg';
import sadImage from '../assets/image/sad_themed.jpg';
import scaryImage from '../assets/image/scary_themed.jpg';
import scienceImage from '../assets/image/science_themed.jpg';
import spaceImage from '../assets/image/space_themed.jpg';
import sportsImage from '../assets/image/sports_themed.jpg';
import summerImage from '../assets/image/summer_themed.jpg';
import sunshineImage from '../assets/image/sunshine_themed.jpg';
import valentineImage from '../assets/image/valentine_themed.jpg';
import winterImage from '../assets/image/winter_themed.jpg';



const config = require('../config.json');

function FiltersPage() {
    const [adventurousTag, setAdventurousTag] = useState(false);
    const [angerTag, setAngerTag] = useState(false);
    const [artisticTag, setArtisticTag] = useState(false);
    const [celebrationTag, setCelebrationTag] = useState(false);
    const [christmasTag, setChristmasTag] = useState(false);
    const [colorfulTag, setColorfulTag] = useState(false);
    const [cozyTag, setCozyTag] = useState(false);
    const [energeticTag, setEnergeticTag] = useState(false);
    const [halloweenTag, setHalloweenTag] = useState(false);
    const [happyTag, setHappyTag] = useState(false);
    const [industrialTag, setIndustrialTag] = useState(false);
    const [learningTag, setLearningTag] = useState(false);
    const [natureTag, setNatureTag] = useState(false);
    const [optimisticTag, setOptimisticTag] = useState(false);
    const [playfulTag, setPlayfulTag] = useState(false);
    const [relaxedTag, setRelaxedTag] = useState(false);
    const [sadTag, setSadTag] = useState(false);
    const [scaryTag, setScaryTag] = useState(false);
    const [scienceTag, setScienceTag] = useState(false);
    const [spaceTag, setSpaceTag] = useState(false);
    const [sportsTag, setSportsTag] = useState(false);
    const [summerTag, setSummerTag] = useState(false);
    const [sunshineTag, setSunshineTag] = useState(false);
    const [valentineTag, setValentineTag] = useState(false);
    const [winterTag, setWinterTag] = useState(false);

    const navigate = useNavigate();


    

    const handleSubmit = async (event) => {
        event.preventDefault();
        const themeData = {
    
            adventurous: adventurousTag,
            anger: angerTag,
            artistic: artisticTag,
            celebration: celebrationTag,
            christmas: christmasTag,
            colorful: colorfulTag,
            cozy: cozyTag,
            energetic: energeticTag,
            halloween: halloweenTag,
            happy: happyTag,
            industrial: industrialTag,
            learning: learningTag,
            nature: natureTag,
            optimistic: optimisticTag,
            playful: playfulTag,
            relaxed: relaxedTag,
            sad: sadTag,
            scary: scaryTag,
            science: scienceTag,
            space: spaceTag,
            sports: sportsTag,
            summer: summerTag,
            sunshine: sunshineTag,
            valentine: valentineTag,
            winter: winterTag

            
        };
    

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(themeData)
        };

        try {
            const response = await fetch(`http://${config.server_host}:${config.server_port}/ordered_suggestion`, requestOptions);
            if (!response.ok){
                throw new Error('Failure');
            }
            const data = await response.json();
            console.log('Response:', data);
            navigate("/suggestions");
            
            
            
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
                    className={`selection-box ${adventurousTag ? 'selected' : ''}`}
                    onClick={() => setAdventurousTag(!adventurousTag)}
                >
                    <div className="image-container">
                        <img src={adventurousImage} alt="Adventurous" />
                        <div>Adventurous</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${angerTag ? 'selected' : ''}`}
                    onClick={() => setAngerTag(!angerTag)}
                >
                    <div className="image-container">
                        <img src={angerImage} alt="Anger" />
                        <div>Anger</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${artisticTag ? 'selected' : ''}`}
                    onClick={() => setArtisticTag(!artisticTag)}
                >
                    <div className="image-container">
                        <img src={artisticImage} alt="Artistic" />
                        <div>Artistic</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${celebrationTag ? 'selected' : ''}`}
                    onClick={() => setCelebrationTag(!celebrationTag)}
                >
                    <div className="image-container">
                        <img src={celebrationImage} alt="Celebration" />
                        <div>Celebration</div>
                    </div>
                </Box>
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
                    className={`selection-box ${colorfulTag ? 'selected' : ''}`}
                    onClick={() => setColorfulTag(!colorfulTag)}
                >
                    <div className="image-container">
                        <img src={colorfulImage} alt="Colorful" />
                        <div>Colorful</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${cozyTag ? 'selected' : ''}`}
                    onClick={() => setCozyTag(!cozyTag)}
                >
                    <div className="image-container">
                        <img src={cozyImage} alt="Cozy" />
                        <div>Cozy</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${energeticTag ? 'selected' : ''}`}
                    onClick={() => setEnergeticTag(!energeticTag)}
                >
                    <div className="image-container">
                        <img src={energeticImage} alt="Energetic" />
                        <div>Energetic</div>
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
                <Box 
                    className={`selection-box ${happyTag ? 'selected' : ''}`}
                    onClick={() => setHappyTag(!happyTag)}
                >
                    <div className="image-container">
                        <img src={happyImage} alt="Happy" />
                        <div>Happy</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${industrialTag ? 'selected' : ''}`}
                    onClick={() => setIndustrialTag(!industrialTag)}
                >
                    <div className="image-container">
                        <img src={industrialImage} alt="Industrial" />
                        <div>Industrial</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${learningTag ? 'selected' : ''}`}
                    onClick={() => setLearningTag(!learningTag)}
                >
                    <div className="image-container">
                        <img src={learningImage} alt="Learning" />
                        <div>Learning</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${natureTag ? 'selected' : ''}`}
                    onClick={() => setNatureTag(!natureTag)}
                >
                    <div className="image-container">
                        <img src={natureImage} alt="Nature" />
                        <div>Nature</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${optimisticTag ? 'selected' : ''}`}
                    onClick={() => setOptimisticTag(!optimisticTag)}
                >
                    <div className="image-container">
                        <img src={optimisticImage} alt="Optimistic" />
                        <div>Optimistic</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${playfulTag ? 'selected' : ''}`}
                    onClick={() => setPlayfulTag(!playfulTag)}
                >
                    <div className="image-container">
                        <img src={playfulImage} alt="Playful" />
                        <div>Playful</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${relaxedTag ? 'selected' : ''}`}
                    onClick={() => setRelaxedTag(!relaxedTag)}
                >
                    <div className="image-container">
                        <img src={relaxedImage} alt="Relaxed" />
                        <div>Relaxed</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${sadTag ? 'selected' : ''}`}
                    onClick={() => setSadTag(!sadTag)}
                >
                    <div className="image-container">
                        <img src={sadImage} alt="Sad" />
                        <div>Sad</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${scaryTag ? 'selected' : ''}`}
                    onClick={() => setScaryTag(!scaryTag)}
                >
                    <div className="image-container">
                        <img src={scaryImage} alt="Scary" />
                        <div>Scary</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${scienceTag ? 'selected' : ''}`}
                    onClick={() => setScienceTag(!scienceTag)}
                >
                    <div className="image-container">
                        <img src={scienceImage} alt="Science" />
                        <div>Science</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${spaceTag ? 'selected' : ''}`}
                    onClick={() => setSpaceTag(!spaceTag)}
                >
                    <div className="image-container">
                        <img src={spaceImage} alt="Space" />
                        <div>Space</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${sportsTag ? 'selected' : ''}`}
                    onClick={() => setSportsTag(!sportsTag)}
                >
                    <div className="image-container">
                        <img src={sportsImage} alt="Sports" />
                        <div>Sports</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${summerTag ? 'selected' : ''}`}
                    onClick={() => setSummerTag(!summerTag)}
                >
                    <div className="image-container">
                        <img src={summerImage} alt="Summer" />
                        <div>Summer</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${sunshineTag ? 'selected' : ''}`}
                    onClick={() => setSunshineTag(!sunshineTag)}
                >
                    <div className="image-container">
                        <img src={sunshineImage} alt="Sunshine" />
                        <div>Sunshine</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${valentineTag ? 'selected' : ''}`}
                    onClick={() => setValentineTag(!valentineTag)}
                >
                    <div className="image-container">
                        <img src={valentineImage} alt="Valentine" />
                        <div>Valentine</div>
                    </div>
                </Box>
                <Box 
                    className={`selection-box ${winterTag ? 'selected' : ''}`}
                    onClick={() => setWinterTag(!winterTag)}
                >
                    <div className="image-container">
                        <img src={winterImage} alt="Winter" />
                        <div>Winter</div>
                    </div>
                </Box>

                </div>
        
                <Button onClick={handleSubmit}>Submit</Button>
                
            </Box>
        </>
    )
    

};
 

export default FiltersPage;