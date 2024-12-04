import React, { useEffect } from 'react';
import './App.css';
import DisplayHand from './Utils/RenderHand.js';
import {initialCommunications} from './Utils/ServerCommunications.js';
//import '' from './DataStorage.js'

function App() {
  initialCommunications();

  return (
    <div className="App">
      <DisplayHand/>
    </div>
  );
}

export default App;