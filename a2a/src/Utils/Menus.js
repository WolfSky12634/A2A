//Controls the menu screens
import { useState } from 'react';
import './Menus.css'
import {initialCommunications} from './ServerCommunications.js';
import { Spinners } from './VisualEffects.js';

//Renders the Main Menu visuals
function MainMenu({changeCurrentScreen}) {
    const [instanceCode, setInstanceCode] = useState('');
    const [errorEnter, setErrorEnter] = useState(false)
    const [errorConnect, setErrorConnect] = useState(false)


    //Joins the game if the Game Instance Code is valid, or creates a new game if it is valid, and the instance code is not being used currently
    const joinGame = () => {
        console.log()
        if(instanceCode.length < 4 || !Number.isInteger(Number(instanceCode))){ setErrorConnect(false); setErrorEnter(true); return; }
        if(!initialCommunications(instanceCode)) { setErrorEnter(false); setErrorConnect(instanceCode); return; }
        changeCurrentScreen("WaitingRoom");
    };
    
    //Changes the text in the input text box
    const handleInputChange = (event) => { setInstanceCode(event.target.value); };

    return(
        <div className="menu">
            <button className="menu-button" onClick={joinGame}>Play</button>
            <input type="text" value={instanceCode} onChange={handleInputChange} placeholder="Enter Game Code:" className="input-field"/>
            {(errorEnter || errorConnect) && <span className='error-text'>{errorEnter?"GameCode must be at least 4 numerical digits":`Unable to connect to ${errorConnect}`}</span>}
        </div>
    )

}

//Renders the Waiting Menu visuals
function WaitMenu({ changeCurrentScreen }) {
    return(
        <div style={{ position: "relative", margin: "auto" }}>
            <span style={{position: "absolute", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", fontSize: "16px", 
            fontWeight: "bold", color: "green", textShadow: "1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black"}}>
                Waiting for more Players...
            </span>
            <Spinners/>
        </div>
    );
}

export default {MainMenu, WaitMenu};