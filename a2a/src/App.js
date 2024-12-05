import React, { useEffect, useState } from 'react';
import './App.css';
import RenderHand from './Utils/RenderHand.js';
import Menus from './Utils/Menus.js';
//import '' from './DataStorage.js'

function App() {
  const [currentScreen, changeCurrentScreen] = useState('MainMenu');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'MainMenu':
        return <Menus.MainMenu changeCurrentScreen={changeCurrentScreen}/>;
      case 'PlayingHand':
        return <RenderHand changeCurrentScreen={changeCurrentScreen}/>;
      case 'WaitingRoom':
        return <Menus.WaitMenu changeCurrentScreen={changeCurrentScreen}/>;
    }
  }

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;