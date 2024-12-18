//Communicates with the server using fetch requests

import { v4 as uuidv4 } from 'uuid';
const apiAddress = '10.47.109.16' + ':3001' //Temporary appointment of communication address

let changeGameScreen; //Function to change the current game screen
let setPlayerNames; //Function to set the player names for the app data

// Gets the value of a specific cookie from a string of cookies
export function getCookieValue(cookieString, cookieName) {
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(part => part.trim());
        if (key) acc[key] = decodeURIComponent(value || '');
        return acc;
    }, {});
    return cookies[cookieName] || null;
}

// Creates a new UUID for the current device to store in cookies
function createCookieUUID() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); //1 year expiration
    const deviceUUID = uuidv4();
    document.cookie = `deviceUUID=${deviceUUID}; expires=${date.toUTCString()}; SameSite=Strict; path=/`;
    return deviceUUID;
}

//Runs communication of the function with the server
function communicateWithServer(type,content){
    if(socket && socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify({type: type, content:content}));
    }
    else { console.error("Not connected to WebSocket"); }
}

//Creates a default data communication request standard so that the server knows which user is communicating with it
function defaultServerFunctionRequest(apiCall, data = null){
    //Detects which function is being requested of the server, to identify if any such function exists
    const lowerCaseApiCall = apiCall.toLowerCase()
    if(!responseHandlers[lowerCaseApiCall]){ console.log(`No API request of ${apiCall} exists`); return;}

    communicateWithServer("function", JSON.stringify({function: lowerCaseApiCall, data:data}));
}

//List of all subscriptions to certain response requests
const responseSubscriptions = new Map();

//Adds functions to call when response has come through
function subscribeToResponse(functionName, responseFunction){
    let currentResponseSubscriptions = responseSubscriptions.get(functionName);
    if(currentResponseSubscriptions) { currentResponseSubscriptions.push(responseFunction); }
    else { currentResponseSubscriptions = [responseFunction]}
    responseSubscriptions.set(functionName, currentResponseSubscriptions);
}

//Runs a response to all of the response waiters
function respondToSubscriptions(functionName, responseData){
    const responseFunctions = responseSubscriptions.get(functionName);
    if(!responseFunctions) { return; }
    responseFunctions.forEach((func) => { if(func != null) { func(responseData); }});
}





//Runs an initial communication connection between the device and the server
export function initialCommunications(changeCurrentScreen, setNames) {    
    changeGameScreen = changeCurrentScreen;
    setPlayerNames = setNames;
    getCookieValue(document.cookie, 'deviceUUID') || createCookieUUID();
    connectWebSocket();
}

//Runs the Join Game function to the server 
export function joinGame(instanceCode, playerName, responseFunction) {
    console.log("Joining " + instanceCode); 

    defaultServerFunctionRequest("joingame", JSON.stringify({instanceCode:instanceCode,playerName:playerName})); 
    subscribeToResponse("joingame", responseFunction);
}

/*function leaveGame(instanceCode){
    
}*/


export function hostGame(instanceCode, playerName, responseFunction){
    defaultServerFunctionRequest("hostgame", JSON.stringify({instanceCode:instanceCode, playerName:playerName}))
    subscribeToResponse("hostgame", responseFunction)
}

//Runs the Get Current Player Hand function to the server
export function getCurrentPlayerHand(responseFunction){
    defaultServerFunctionRequest("getcurrentplayerhand");
    subscribeToResponse("getcurrentplayerhand", responseFunction);
}

//Starts the current game
export function startGame(responseFunction){
    defaultServerFunctionRequest("startGame")
    /////////////subscribeToResponse("startGame", responseFunction);
}







const responseHandlers = {
    joingame: (responseData) => joinGameResponse(responseData),
    getcurrentplayerhand: (responseData) => getCurrentPlayerHandResponse(responseData),
    hostgame: (responseData) => hostGameResponse(responseData)
}

function joinGameResponse(responseData){
    const success = responseData.status === "SUCCESS"?true:false;

    if(success) { 
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + 2);
        document.cookie = `gameInstanceData=${responseData.data}; expires=${date.toUTCString()}; SameSite=Strict; path=/`;
    }
    else { document.cookie = `gameInstanceData=; expires=Sat, 01 Jan 2000 00:00:00` }

    changeGameScreen(success?"WaitingRoom":"MainMenu");
    respondToSubscriptions("joingame", success);
}

function hostGameResponse(responseData){ respondToSubscriptions("hostgame", responseData.status === "SUCCESS"?true:false); }

function getCurrentPlayerHandResponse(responseData){
    if(!Array.isArray(responseData.data)) { 
        console.log("Player Hand appears to be something other than an array"); 
        respondToSubscriptions("getcurrentplayerhand", null)
        return; 
    }

    respondToSubscriptions("getcurrentplayerhand", responseData.data);
}




const functionHandlers ={
    playerNames: (responseData) => getPlayerNames(responseData)
}

function getPlayerNames(responseData){ 
    if(Array.isArray(responseData.data)) { setPlayerNames(responseData.data); } 
}







let socket;

function connectWebSocket(){
    socket = new WebSocket(`ws://${apiAddress}`);

    // Connection established
    socket.onopen = () => {};

    //Receive messages
    socket.onmessage = (event) => {
        //Attempts to unpack the message data
        let parsedMessage;
        try { parsedMessage = JSON.parse(event.data); }
        catch{ parsedMessage = null; }
        if(!parsedMessage) { console.log(`Error: ${event.data}`); return; }

        const parsedContent = JSON.parse(parsedMessage.content) || null;
        if(!parsedContent) { console.log(`Error: ${event.data}`); return; }
        let func;

        switch(parsedMessage.type){
            //Decides if the message is a response
            case "response":
                func = responseHandlers[parsedContent.function];
            break;

            //Decides if the message is a function request
            case "function":
                func = functionHandlers[parsedContent.function];
            break;

            default:
                console.log("Unknown message type")
            break;
        }

        if(func) { func(parsedContent); }
        else { 
            console.log(`Unable to identify function "${parsedMessage.content}"`);
            //LOG ERROR TO SERVER
        }


    };

    //Handle being unable to access the server
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    let pingInterval = setInterval(() => { communicateWithServer("ping", null) }, 3000);

    //Handle disconnection
    socket.onclose = (event) => {
        pingInterval = null;
        changeGameScreen("MainMenu");
        if (event.code !== 1000) { //1000 == normal closure
            console.log('Connection lost, trying to reconnect...');
            setTimeout(() => {
                connectWebSocket(); //Function to reconnect
            }, 3000); //Wait 3 seconds before reconnecting
        }
    };
}
