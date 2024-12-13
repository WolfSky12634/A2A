//Communicates with the server using fetch requests
import { v4 as uuidv4 } from 'uuid';
const apiAddress = '10.46.196.198:3001' //Temporary appointment of communication address

//Function to change the current game screen
let changeGameScreen;

const waitingForResponse = new Map();

//Gets the value of a specific cookie from a string of cookies
export function getCookieValue(cookieString, cookieName) {
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(part => (typeof part === 'string' ? part.trim() : ''));
        
        //Returns the value if it exist
        if (key) { acc[key] = decodeURIComponent(value || ''); }
        return acc;
    }, {});

    //Returns cookie value, or null if cookie value not found
    const cookieValue = cookies[cookieName];
    if (!cookieValue) { console.warn(`Cookie "${cookieName}" not found.`); return null; }

    return cookieValue;
}
//Creates a new UUID for the current device to store in cookies
function createCookieUUID(){
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const deviceUUID = uuidv4();
    document.cookie = `deviceUUID=${deviceUUID}; expires=${date.toUTCString()}`;
    return deviceUUID;
}
//Checks for the device UUID, or creates a new one if one is not available
function getOrCreateCookieUUID() {
    let deviceUUID = document.cookie?getCookieValue(document.cookie, 'deviceUUID'):null;
    if(!deviceUUID) { deviceUUID = createCookieUUID(); }
    return deviceUUID;//
}
//Creates a default data communication request standard so that the server knows which user is communicating with it
async function defaultApiRequest(apiCall, data = null){
    //Detects which function is being requested of the server, to identify if any such function exists
    const lowerCaseApiCall = apiCall.toLowerCase()
    if(!responseHandlers[lowerCaseApiCall]){ console.log(`No API request of ${apiCall} exists`); return;}

    communicateWithServer("function", JSON.stringify({function: lowerCaseApiCall, data:data}));
}
//Runs communication of the function with the server
function communicateWithServer(type,content){
    if(socket && socket.readyState === WebSocket.OPEN){
        socket.send(JSON.stringify({type: type, content:content}));
    }
    else { console.error("Not connected to WebSocket"); }
}

//Adds functions to call when response has come through
function newResponseWaiters(functionName, responseFunction){
    let responseWaiters = waitingForResponse.get(functionName);
    if(responseWaiters) { responseWaiters.push(responseFunction); }
    else { responseWaiters = [responseFunction]}
    waitingForResponse.set(functionName, responseWaiters);
}

//Runs a response to all of the response waiters
function respondToResponseWaiters(functionName, responseData){
    const responseFunctions = waitingForResponse.get(functionName);
    if(!responseFunctions) { return; }
    responseFunctions.forEach((func) => { if(func != null) { func(responseData); }});
}






//Runs an initial communication connection between the device and the server
export function initialCommunications(changeCurrentScreen) {    
    changeGameScreen = changeCurrentScreen;
    getOrCreateCookieUUID();
    connectWebSocket();
}

//Runs the Join Game function to the server 
export function joinGame(instanceCode, responseFunction) {
    console.log("Joining " + instanceCode); 

    defaultApiRequest("joingame", instanceCode); 

    newResponseWaiters("joingame", responseFunction);
}

function joinGameResponse(responseData){
    const success = responseData.status === "SUCCESS"?true:false;

    if(success) { 
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + 2);
        document.cookie = `instanceCode=${responseData.data}; expires=${date.toUTCString()}`;
    }
    else { document.cookie = `instanceCode=; expires=Sat, 01 Jan 2000 00:00:00` }

    changeGameScreen(success?"WaitingRoom":"MainMenu");
    respondToResponseWaiters("joingame", success);
}


/*function leaveGame(instanceCode){
    
}*/


export function hostGame(instanceCode, responseFunction){
    defaultApiRequest("hostgame", instanceCode)
    newResponseWaiters("hostgame", responseFunction)
}

function hostGameResponse(responseData){
    const success = responseData.status === "SUCCESS"?true:false;
    if(success) { joinGame(responseData.data); }

    respondToResponseWaiters("hostgame", success);
}


//Runs the Get Current Player Hand function to the server
export async function getCurrentPlayerHand(responseFunction){
    defaultApiRequest("getcurrentplayerhand");
    newResponseWaiters("getcurrentplayerhand", responseFunction);
}

function getCurrentPlayerHandResponse(responseData){
    if(!Array.isArray(responseData.data)) { 
        console.log("Player Hand appears to be something other than an array"); 
        respondToResponseWaiters("getcurrentplayerhand", null)
        return; 
    }

    respondToResponseWaiters("getcurrentplayerhand", responseData.data);
}









const responseHandlers = {
    joingame: (responseData) => joinGameResponse(responseData),
    getcurrentplayerhand: (responseData) => getCurrentPlayerHandResponse(responseData),
    hostgame: (responseData) => hostGameResponse(responseData)
}

let socket;

function connectWebSocket(functionsToRunOnOpen){
    socket = new WebSocket(`ws://${apiAddress}`);

    // Connection established
    socket.onopen = () => {
        if(Array.isArray(functionsToRunOnOpen)) { functionsToRunOnOpen.forEach((func) => { func(); }) }
    };

    //Receive messages
    socket.onmessage = (event) => {
        let parsedMessage;
        try { parsedMessage = JSON.parse(event.data); }
        catch{ parsedMessage = null; }
        
        if(!parsedMessage) { console.log(event.data); return; }
        switch(parsedMessage.type){
            case "response":
                const parsedContent = JSON.parse(parsedMessage.content);
                const func = responseHandlers[parsedContent.function];
                if(func) { func(parsedContent); }
                else { 
                    console.log(`Unable to identify function "${parsedMessage.content}"`);
                    //LOG ERROR TO SERVER
                  }
            break;

            default:
                console.log("Unknown message type")
            break;
        }


    };

    //Handle being unable to access the server
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    //Handle disconnection
    socket.onclose = (event) => {
        if (event.code !== 1000) { //1000 == normal closure
            console.log('Connection lost, trying to reconnect...');
            setTimeout(() => {
                connectWebSocket(); //Function to reconnect
            }, 3000); //Wait 3 seconds before reconnecting
        }
    };
}
