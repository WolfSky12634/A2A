//Controls the menu screens
import { useState } from 'react';
import './Menus.css'
import { Spinners } from './VisualEffects.js';

//Renders the Main Menu visuals
export function MainMenu({serverCommunications}) {
    const [instanceCode, setInstanceCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [errorEnter, setErrorEnter] = useState(false)
    const [errorConnect, setErrorConnect] = useState(false)
    const [nameError, setNameError] = useState(false);

    function dataCheck(){
        let pass = true;
        if(instanceCode.length < 4 || !Number.isInteger(Number(instanceCode))){ setErrorConnect(false); setErrorEnter(true); pass = false; }
        else { setErrorConnect(false); setErrorEnter(false); }
        if(playerName.length <= 0) { setNameError(true); pass = false; }
        else { setNameError(false); }
        if(pass) { return true; }
        return false;
    }

    //Joins the game if the Game Instance Code is valid, or creates a new game if it is valid, and the instance code is not being used currently
    const host = () => {
        if(dataCheck())
        { serverCommunications.hostGame(instanceCode, playerName, (responseData) => { setErrorEnter(false); setErrorConnect(responseData.status === "SUCCESS"?false:instanceCode); }); 
    }
    };


    //Joins the game if the Game Instance Code is valid, or creates a new game if it is valid, and the instance code is not being used currently
    const join = () => {
        if(dataCheck())
        { serverCommunications.joinGame(instanceCode, playerName, (responseData) => { setErrorEnter(false); setErrorConnect(responseData.status === "SUCCESS"?false:instanceCode); }); }
    };

    
    //Changes the text in the input text box
    const handleInstanceCodeInputChange = (event) => { setInstanceCode(event.target.value); };
    const handlePlayerNameInputChange = (event) => { setPlayerName(event.target.value); };

    return(
        <div className="menu">
            <button className="menu-button" onClick={host}>Host</button>
            <input type="text" value={instanceCode} onChange={handleInstanceCodeInputChange} placeholder="Enter Game Code:" className="input-field"/>
            <input type="text" value={playerName} onChange={handlePlayerNameInputChange} placeholder="Enter Player Name:" className={`${nameError ? 'input-error' : 'input-field'}`}/>
            <button className="menu-button" onClick={join}>Play</button>
            {(errorEnter || errorConnect) && <span className='error-text'>{errorEnter?"GameCode must be at least 4 numerical digits":`Unable to use GameCode ${errorConnect}`}</span>}
        </div>
    )

}

//Renders the Waiting Menu visuals
export function WaitMenu({playerNames, serverCommunications }) {
    const nameCircleRadius = 150;
    return(
        <div style={{ position: "relative", margin: "auto" }}>
            
            {/* Spinner Visual */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <Spinners />
            </div>

            {/* Waiting Text */}
            <span style={{position: "absolute", top: "50%", transform: "translate(-50%, -50%)", textAlign: "center", fontSize: "16px", 
            fontWeight: "bold", color: "green", textShadow: "1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black"}}>
                Waiting for more Players...
            </span>

            {/* Player Names */}
            {playerNames.map((player,index) => {
                const angle = (2*Math.PI * index) / playerNames.length;
                console.log(angle);
                const x = nameCircleRadius * Math.sin(angle);
                const y = nameCircleRadius * Math.cos(angle)*-1;

                return(
                    <span key={index} style={{position: "absolute", left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)", textAlign: "center", 
                    fontSize: "14px", fontWeight: "bold", color: "white", textShadow: "1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black, -1px -1px 0 black",}}>
                        {player}
                    </span>

                )
            })
            }
            <button className="menu-button" style={{ position: "absolute", top: `${nameCircleRadius + 40}px`, 
            left: "-80px", transform: "translateX(0, 0)", textAlign: "center", }} onClick={() => console.log("test")} >
                Start 
            </button>
        </div>
    );
}