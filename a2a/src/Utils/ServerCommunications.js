//Communicates with the server using fetch requests
import { v4 as uuidv4 } from 'uuid';

export const ipaddress = 'http://192.168.1.133' //Temporary appointment of communication address
const apiAddress = ipaddress+':3001'; //Temporary appointment of communication address

//Stores a list of all available server requests
const apiRequests = {
    joingame : '/joinGame',
    getcurrentplayerhand : '/getPlayerHand'
}

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
async function defaultApiRequest(apiCall){
    //Detects which function is being requested of the server, to identify if any such function exists
    const apiRequest = apiRequests[apiCall.toLowerCase()]
    if(!apiRequest){ console.log(`No API request of ${apiCall} exists`); return;}

    //Runs FETCH to communicate the function with the server
    try {
        const response = await fetch(apiAddress+apiRequest, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instanceCode: getCookieValue(document.cookie,"instanceCode"), deviceCookies: getCookieValue(document.cookie, "deviceUUID")})
        });
        return response;
    }
    catch (error)
    { console.error(`Fetch error for ${apiRequest}: `, error)}

    return null;
}

//Runs an initial communication connection between the device and the game instance
export function initialCommunications(instanceCode) {
    getOrCreateCookieUUID();
    if(joinGame(instanceCode)){ return true; }
    return false;
}

//Runs the Join Game function to the server 
function joinGame(instanceCode) {
    console.log("Joining " + instanceCode); 

    //Stores the game instance code in the device cookies
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 2);
    document.cookie = `instanceCode=${instanceCode}; expires=${date.toUTCString()}`;

    const response = defaultApiRequest("JoinGame"); 
    if(!response.ok) { document.cookie = "instanceCode=; expires=Sat, 01 Jan 2000 00:00:00 UTC"; return false; }
    return true;
}

//Checks if the user curerntly exists in the propsed game instance
function doesUserExistInGame(instanceCode){

}

//Runs the Get Current Player Hand function to the server
export async function getCurrentPlayerHand(){
    const response = await defaultApiRequest("getCurrentPlayerHand")
    if (!response.ok) { throw new Error(`HTTP error - Status: ${response.status}`); }
    
    const data = await response.json();
    console.log(data);
    return data;
}