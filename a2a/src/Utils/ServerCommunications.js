import { v4 as uuidv4 } from 'uuid';

export const ipaddress = 'http://192.168.1.133'

const apiAddress = ipaddress+':3001';
let currentInstance = 1234;

const apiRequests = {
    join : '/joinGame',
    getcurrentplayerhand : '/getPlayerHand'
}

export function getCookieValue(cookieString, cookieName) {
    // Split the cookie string into individual cookies and create an object
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(part => part && part.trim()); // Trim spaces from keys and values
        if (key) {
        acc[key] = decodeURIComponent(value || ''); // Decode URL-encoded value and handle undefined values
        }
        return acc;
    }, {});

    return cookies[cookieName];
}

function createCookieUUID(){
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 1);

    const deviceUUID = uuidv4();
    document.cookie = `deviceUUID=${deviceUUID}; expires=${currentDate.toUTCString()}`;
    return deviceUUID;
}

function getOrCreateCookieUUID() {
    let deviceUUID = document.cookie?getCookieValue(document.cookie, 'deviceUUID'):null;
    if(!deviceUUID) { deviceUUID = createCookieUUID(); }
    return deviceUUID;//
}

async function defaultApiRequest(apiCall){
    const apiRequest = apiRequests[apiCall.toLowerCase()]
    if(!apiRequest){ console.log(`No API request of ${apiCall} exists`); return;}

    try {
        const response = await fetch(apiAddress+apiRequest, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instanceCode: currentInstance, deviceCookies: document.cookie })
        });
        return response;
    }
    catch (error)
    { console.error(`Fetch error for ${apiRequest}: `, error)}

    return null;
}

export function initialCommunications(instanceCode) {
    getOrCreateCookieUUID();
    joinGame(instanceCode);
}

function joinGame(instanceCode) {console.log("Joining" + currentInstance); currentInstance = instanceCode; defaultApiRequest("Join"); }

export async function getCurrentPlayerHand(){
    const response = await defaultApiRequest("getCurrentPlayerHand")
    if (!response.ok) 
    { throw new Error(`HTTP error - Status: ${response.status}`); }
    
    const data = await response.json();
    console.log(data);
    return data;
}