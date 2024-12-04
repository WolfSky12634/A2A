import { v4 as uuidv4 } from 'uuid';

const apiAddress = 'http://192.168.1.133:3001';

function getCookieValue(cookieString, cookieName) {
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

function joinGame() {
    fetch(apiAddress+'/joinGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCookies: document.cookie }) // Replace with the actual payload
    });
}

function initialCommunications() {
    getOrCreateCookieUUID();
    joinGame();
}


export {getCookieValue, initialCommunications};