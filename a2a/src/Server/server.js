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

  const gameInstanceData = cookie.parse(req.headers.cookie || '').gameInstanceData;
  if(gameInstanceData) { joinGame(JSON.parse(gameInstanceData)); }   ////////////////////CHANGE THIS TO MAKE IT WORK PROPERLY WITH DATA OF PLAYER ALREADY EXISTING IN GAME AND MAKE SURE TO CHECK IT DOES EXIST

  



  const functionHandlers = {
    joingame: (data) => joinGame(data),
    getcurrentplayerhand: () => getCurrentPlayerHand(),
    hostgame: (data) => hostGame(data)
  }

  socket.on('message', (message) => {

    const parsedMessage = JSON.parse(message);
    if(!parsedMessage){ console.log(`ERROR: ${message}`); return; }
    let parsedContent;
    try{ parsedContent = JSON.parse(parsedMessage.content); }
    catch{ parsedContent = null; }
    let func;

    switch(parsedMessage.type){
      case "function":
        func = functionHandlers[parsedContent.function];
      break;

      case "ping":
        onPing();
      return;
      
      default:
        console.log("Unknown message Type")
      break;
    }

    const parsedData = JSON.parse(parsedContent.data) || null;

    if(func){ func(parsedData); }
    else { 
      console.log(`Unable to identify function "${parsedMessage.content}"`);
      sendError(`Unable to identify function "${parsedMessage.content}"`);
    }
      
      
  });





  
  function sendData(type, content, client = socket){
    if (client.readyState === WebSocket.OPEN) 
      { client.send(JSON.stringify({type:type,content:content}))}; 
  }

  function broadcastData(type, data){
    for (const [id, client] of userSocketConnections) 
      { sendData(type, data, client); }
  }

  function sendError(error)
  { sendData("error",error); }

  function sendResponse(funct, status, data = null)
  { sendData("response", JSON.stringify({function:funct, status:status, data:data})); } 




  function hostGame(data){
    if(currentGameInstances.get(data.instanceCode)) { sendResponse("hostgame","FAIL", data.instanceCode); return;  }
    createGameInstance(data.instanceCode);
    sendResponse("hostgame", "SUCCESS", JSON.stringify(data))
    joinGame(data)
  }

  function joinGame(data){   
    //Adds player to the game instance player map
    const game = currentGameInstances.get(data.instanceCode);
    if(!game || game.isGameActive()) { 
      sendResponse("joingame", "FAIL", (!game)?"Game Instance does not exist":"Game is currently active")
      return;
    }

    instanceCode = data.instanceCode
    game.addPlayer(deviceUUID, data.playerName);  
    sendResponse("joingame", "SUCCESS", JSON.stringify(data));
    broadcastData("function", JSON.stringify({function:"playerNames", data:game.getPlayerNames() }));
  }

  function leaveGame(){


    broadcastData("function", JSON.stringify({function:"playerNames", data:game.getPlayerNames() }));
  }

  function getCurrentPlayerHand(){
    if(!instanceCode) { sendResponse("getcurrentplayerhand", "FAIL"); return; }
    sendResponse("getcurrentplayerhand", "SUCCESS", currentGameInstances.get(instanceCode).getPlayerHand(deviceUUID));
  }






  // Listen for ping
  function onPing() {
    // Reset disconnect timeout when ping is received
    clearTimeout(socket.disconnectTimeout);
    // Disconnect client if no pong after 10 seconds
    socket.disconnectTimeout = setTimeout(() => { console.log(`lost ${deviceUUID}`); socket.close(); }, 5000);
    console.log(`ping from ${deviceUUID}`)
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
          { removeGameInstance(instanceCode); return; } 
          broadcastData("response", JSON.stringify({function:"playerNames", data:game.getPlayerNames() }));
        }
        else{
          //Set player as disconnected and remove game if there are no connected players
          game.setPlayerConnection(false);
          if(game.howManyConnectedPlayers() <= 0)
          { removeGameInstance(instanceCode); return; }
        }
      }
     }
  });
});