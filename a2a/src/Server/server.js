//The communication server code
import express from 'express';
import cors from 'cors';
import {GameInstance} from './GameInstanceData.js';
import { ipaddress } from '../Utils/ServerCommunications.js';

//Initialises communications
const frontendAddress = ipaddress+':3000'; //Temporary appointment of communication address
const exp = express();
exp.use(cors({
  origin: frontendAddress,
  credentials: true
}));
exp.use(express.text()); exp.use(express.json());
exp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', frontendAddress);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

//Creates a new map of all the current gameinstances from the currentGameInstances Map
let currentGameInstances = new Map();

//Creates new Game Instances
function createGameInstance(instanceCode){
  let game = currentGameInstances.get(instanceCode);
  if(!game) { game = new GameInstance(instanceCode); currentGameInstances.set(instanceCode, game);}
  return game;
}

//Removes existing Gmae Instances from the currentGameInstances Map
function removeGameInstance(instanceCode){
  if(!currentGameInstances.has(instanceCode)) { console.log(`Game instance ${instanceCode} does not exist`); return; }
  currentGameInstances.delete(instanceCode);
}

//Creates a default data communication response standard so that the server knows which user is communicating with it
function defaultAPIResponder(req,res){
  let errors = [];

  //Gets the game instance code
  const instanceCode = req.body.instanceCode;
  if(!instanceCode) { errors.push("Missing Game Instance Code");}
  
  //Gets the device UUID
  const deviceUUID = req.body.deviceCookies;
  if(!deviceUUID) { errors.push("Missing UUID");}

  //Returns errors if necessary
  if(!errors) { res.send({errors:errors}); return null; } 

  return {deviceUUID: deviceUUID, instanceCode:instanceCode}
}

//Define any join game requests
exp.post('/joinGame', (req, res) => {
  const requestData = defaultAPIResponder(req,res);
  if(!requestData) { return null; }
  
  //Adds player to the game instance player map
  let game = currentGameInstances.get(requestData.instanceCode);
  if(!game) { game = createGameInstance(requestData.instanceCode); }
  game.addPlayer(requestData.deviceUUID);

  res.send('Recieved deviceUUID');
  console.log(`Added Player: ${requestData.deviceUUID}`)
});

//Defines requests to get the cards in the player's hand
exp.post('/getPlayerHand', (req, res) => {
  const requestData = defaultAPIResponder(req,res);
  if(!requestData) { return null; }

  //Sends a response with a list of references to the cards which the player has
  res.json(currentGameInstances.get(requestData.instanceCode).getPlayerHand(requestData.deviceUUID));
});

//Start the server
const PORT = 3001;
exp.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on ${frontendAddress}`);
});
