//Default app code
import React, { useState } from 'react';
import './App.css';
import RenderHand from './Utils/RenderHand.js';
import Menus from './Utils/Menus.js';
import * as serverCommunications from './Utils/ServerCommunications.js';

function App() {
  const [currentScreen, changeCurrentScreen] = useState('MainMenu');

  serverCommunications.initialCommunications(changeCurrentScreen);
  

  //Decides which screen to render
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return <Menus.MainMenu changeCurrentScreen={changeCurrentScreen} serverCommunications={serverCommunications}/>;
      case 'PlayingHand':
        return <RenderHand changeCurrentScreen={changeCurrentScreen} serverCommunications={serverCommunications}/>;
      case 'WaitingRoom':
        return <Menus.WaitMenu changeCurrentScreen={changeCurrentScreen} serverCommunications={serverCommunications}/>;
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