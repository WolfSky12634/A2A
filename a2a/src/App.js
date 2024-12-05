import React, { useEffect } from 'react';
import './App.css';
import RenderHand from './Utils/RenderHand.js';
import {initialCommunications} from './Utils/ServerCommunications.js';
//import '' from './DataStorage.js'

function App() {
  initialCommunications(1234);

  return (
    <div className="App">
      <RenderHand/>
    </div>
  );
}

export default App;