//Default app code

import React, { useState } from 'react';
import './App.css';
import RenderHand from './Utils/RenderHand.js';
import Menus from './Utils/Menus.js';

function App() {
  const [currentScreen, changeCurrentScreen] = useState('MainMenu');

  //Decides which screen to render
  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return <Menus.MainMenu changeCurrentScreen={changeCurrentScreen}/>;
      case 'PlayingHand':
        return <RenderHand changeCurrentScreen={changeCurrentScreen}/>;
      case 'WaitingRoom':
        return <Menus.WaitMenu changeCurrentScreen={changeCurrentScreen}/>;
      default:
        return <Menus.MainMenu changeCurrentScreen={changeCurrentScreen}/>;
    }
  }

  return (
    <div className="App">
      { renderScreen() }
    </div>
  );
}

export default App;