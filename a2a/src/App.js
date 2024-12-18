//Default app code
import React, { useState, useEffect } from 'react';
import './App.css';
import RenderHand from './Utils/RenderHand.js';
import * as Menus from './Utils/Menus.js';
import * as serverCommunications from './Utils/ServerCommunications.js';

function App() {
  const [currentScreen, changeCurrentScreen] = useState('MainMenu');
  const [playerNames, setPlayerNames] = useState([]);

  //document.cookie = `playerName=Jack; expires=Thu, 19 Dec 2024 00:00:00`;

  useEffect(() => {
    serverCommunications.initialCommunications(changeCurrentScreen, setPlayerNames);
  }, []);
  

  //Decides which screen to render
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return <Menus.MainMenu serverCommunications={serverCommunications}/>;
      case 'PlayingHand':
        return <RenderHand changeCurrentScreen={changeCurrentScreen} serverCommunications={serverCommunications}/>;
      case 'WaitingRoom':
        return <Menus.WaitMenu playerNames={playerNames} serverCommunications={serverCommunications}/>;
      default:
        return <Menus.MainMenu changeCurrentScreen={changeCurrentScreen} serverCommunications={serverCommunications}/>;
    }
  }

  return (
    <div className="App">
      { renderScreen() }
    </div>
  );
}

export default App;