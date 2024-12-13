//The communication server code
import WebSocket from 'ws';
import cookie from 'cookie';
import {GameInstance} from './GameInstanceData.js';

//Creates a new map of all the current gameinstances from the currentGameInstances Map
let currentGameInstances = new Map();
let userSocketConnections = new Map();


//Creates a new Game Instance
function createGameInstance(gameInstanceID){
  if(currentGameInstances.get(gameInstanceID)) { return null; }
  const game = new GameInstance(gameInstanceID);
  currentGameInstances.set(gameInstanceID,game);
  return game;
}

//Removes existing Game Instances from the currentGameInstances Map
function removeGameInstance(gameInstanceID){
  if(!currentGameInstances.has(gameInstanceID)) { console.log(`Game instance ${gameInstanceID} does not exist`); return; }
  currentGameInstances.delete(gameInstanceID);
}

const server = new WebSocket.Server({ host: '0.0.0.0', port: 3001 });

server.on('connection', (socket, req) => {
  //Initial device connection
  const deviceUUID = cookie.parse(req.headers.cookie || '').deviceUUID;
  let instanceCode;

  if(!deviceUUID){
    socket.emit('error', {errors:["Missing UUID"]});
    socket.close();
    return; 
  }

  userSocketConnections.set(deviceUUID,socket);

  const instanceID = cookie.parse(req.headers.cookie || '').instanceCode;
  if(instanceID) { joinGame(instanceID); }  



  const functionHandlers = {
    joingame: (instanceID) => joinGame(instanceID),
    getcurrentplayerhand: () => getCurrentPlayerHand(),
    hostgame: (instanceID) => hostGame(instanceID)
  }

  socket.on('message', (message) => {

    const parsedMessage = JSON.parse(message);
    switch(parsedMessage.type){
      case "function":
        const parsedFunction = JSON.parse(parsedMessage.content);
        const func = functionHandlers[parsedFunction.function];
        if(func){ func(parsedFunction.data); }
        else { 
          console.log(`Unable to identify function "${parsedMessage.content}"`);
          sendError(`Unable to identify function "${parsedMessage.content}"`);
        }
      break;
      
      default:
        console.log("Unknown message Type")
      break;
    }
      
      
  });

  function sendData(type, content, client = socket){
    if (client.readyState === WebSocket.OPEN) 
      { client.send(JSON.stringify({type:type,content:content}))}; 
  }

  function broadcastData(data){
    for (const [id, client] of userSocketConnections) 
      { sendData(data, client); }
  }

  function sendError(error)
  { sendData("error",error); }

  function sendResponse(funct, status, data = null)
  { sendData("response", JSON.stringify({function:funct, status:status, data:data})); } 




  function joinGame(instanceID){    
    //Adds player to the game instance player map
    const game = currentGameInstances.get(instanceID);
    if(!game) { 
      sendResponse("joingame", "FAIL")
      return;
    }
    game.addPlayer(deviceUUID);
  
    instanceCode = instanceID;
    sendResponse("joingame", "SUCCESS", instanceCode)
    console.log(`Added Player: ${deviceUUID}`)
  }

  function getCurrentPlayerHand(){
    if(!instanceCode) { sendResponse("getcurrentplayerhand", "FAIL"); return; }
    sendResponse("getcurrentplayerhand", "SUCCESS", currentGameInstances.get(instanceCode).getPlayerHand(deviceUUID));
  }

  function hostGame(instanceID){
    if(currentGameInstances.get(instanceID)) { sendResponse("hostgame","FAIL", instanceID); return;  }
    createGameInstance(instanceID);
    sendResponse("hostgame", "SUCCESS", instanceID)
  }




  socket.on('close', () => {
    userSocketConnections.delete(deviceUUID);
    if(instanceCode) { 
      const game = currentGameInstances.get(instanceCode);
      if(game)
      { 
        if(!game.isGameActive()){
          //Remove player, and if there are no more players in the game, remove the game
          if(game.removePlayer(deviceUUID) <= 0)
          { currentGameInstances.delete(instanceCode); } 
        }
        else{
          //Set player as disconnected and remove game if there are no connected players
          game.setPlayerConnection(false);
          if(game.howManyConnectedPlayers() <= 0){
            currentGameInstances.delete(instanceCode);
          }
        }
      }
     }
  });
});