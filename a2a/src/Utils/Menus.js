import { useState } from 'react';
import './Menus.css'
import {initialCommunications} from './ServerCommunications.js';

function MainMenu({changeCurrentScreen}) {
    const [gameCode, setGameCode] = useState('');
    const [errorEnter, setErrorEnter] = useState(false)
    
    const handleInputChange = (event) => {
        setGameCode(event.target.value);
    };

    const beginGame = () => {
        if(!gameCode || gameCode.length < 4){ setErrorEnter(true); return; }
        initialCommunications(gameCode);
        changeCurrentScreen("WaitingRoom");
    };


    return(
        <div className="menu">
            <button className="menu-button" onClick={beginGame}>Play</button>
            <input type="text" value={gameCode} onChange={handleInputChange} placeholder="Enter Game Code:" className="input-field"/>
            {errorEnter && <span className='error-text'>The GameCode must be longer than 4 digits</span>}
        </div>
    )

}

function WaitMenu({changeCurrentScreen}) {
    return(
        <div className="menu">
            <button className="menu-button" onClick={console.log("Wait")}>Wait</button>
        </div>
    )

}

export default {MainMenu, WaitMenu};