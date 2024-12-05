import express from 'express';
import cors from 'cors';
import {GameInstance} from './GameInstanceData.js';
import { getCookieValue } from '../Utils/ServerCommunications.js';

import { ipaddress } from '../Utils/ServerCommunications.js';

const frontendAddress = ipaddress+':3000';

const exp = express(); // Create an Express app
exp.use(express.text()); exp.use(express.json());

let currentGames = new Map();

exp.use(cors({
  origin: frontendAddress, // Explicitly specify the frontend's origin
  credentials: true               // Allow credentials (cookies)
}));

function checkForUserUUID(deviceCookies){
  if(!deviceCookies) { console.log("No Cookies Identified"); return { error:'No Cookies Identified' }; }
  const UUID = getCookieValue(deviceCookies,'deviceUUID');
  if(!UUID) { console.log("Not Recieved UUID"); return { error:'Not Recieved UUID' }}
    
  return UUID;
}

function checkForUserInstanceCode(instanceCode){
  if(!instanceCode) {console.log("No Instance Code Identified"); return { error:'No Instance Code Identified' } }
  return instanceCode;
}

function respondWithErrors(res, result){
  if(result.error) { res.send(uuidResult.error); return null; }
  return result;
}

function createGameInstance(instanceCode){
  let game = currentGames.get(instanceCode);
  if(!game) { game = new GameInstance(instanceCode); currentGames.set(instanceCode, game);}
  return game;
}

function removeGameInstance(instanceCode){
  if(!currentGames.has(instanceCode)) { console.log(`Game instance ${instanceCode} does not exist`); return; }
  currentGames.delete(instanceCode);
}


exp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', frontendAddress);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Define a route to handle POST requests
exp.post('/joinGame', (req, res) => {
    //Gets the UUID and instanceCode
    const instanceCode = respondWithErrors(res, checkForUserInstanceCode(req.body.instanceCode));
    const UUID = respondWithErrors(res, checkForUserUUID(req.body.deviceCookies));
    if (!instanceCode || !UUID) { return; }
    
    let game = currentGames.get(instanceCode);
    if(!game) { game = createGameInstance(instanceCode); }
    game.addPlayer(UUID);

    res.send('Recieved UUID');
});

exp.post('/getPlayerHand', (req, res) => {
  //Gets the UUID and instanceCode
  const instanceCode = respondWithErrors(res, checkForUserInstanceCode(req.body.instanceCode));
  const UUID = respondWithErrors(res, checkForUserUUID(req.body.deviceCookies));
  if (!instanceCode || !UUID) { return; }

  res.json(currentGames.get(instanceCode).getPlayerHand(UUID));
});

// Start the server
const PORT = 3001;
exp.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});