import express from 'express';
import cors from 'cors';
import {players} from './Utils/GameInstanceData.js';
import { getCookieValue } from './Utils/ServerCommunications.js';

const frontendAddress = 'http://192.168.1.133:3000';

const exp = express(); // Create an Express app
exp.use(express.text()); exp.use(express.json());

//let players = new Map();

exp.use(cors({
  origin: frontendAddress, // Explicitly specify the frontend's origin
  credentials: true               // Allow credentials (cookies)
}));

exp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', frontendAddress);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Define a route to handle POST requests
exp.post('/joinGame', (req, res) => {
    const cookies = req.body.deviceCookies;
    if(!cookies) { res.send('No Cookies Identified'); return; }
    //const UUID = null;
    const UUID = getCookieValue(cookies,'deviceUUID');//getCookieValue(req.Cookie,"deviceUUID");

    if(!UUID) { res.send('Not Recieved UUID'); return;}
    players.set(UUID,UUID);
    res.send('Recieved UUID');
    console.log(`UUID Added: ${UUID}`)
    console.log('Active Players: ');
    players.forEach((value,key) =>{console.log(value)})
});

// Start the server
const PORT = 3001;
exp.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});