const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const STORAGE_KEY = 'chat_messages';

// Function to display a message in the chat
function displayMessage(message) {
    const div = document.createElement('div');
    const device = getDeviceName();
    const time = getTime();
    div.textContent = device + ' (' + time + '): ' + message;
    chatMessages.appendChild(div);
}

// Function to get the device name
function getDeviceName() {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/Android/i)) {
        return 'Android';
    } else if (userAgent.match(/iPhone|iPad|iPod/i)) {
        return 'iOS';
    } else if (userAgent.match(/Windows Phone/i)) {
        return 'Windows Phone';
    } else if (userAgent.match(/Macintosh/i)) {
        return 'Mac';
    } else if (userAgent.match(/Windows/i)) {
        return 'Windows PC';
    } else if (userAgent.match(/Linux/i)) {
        return 'Linux PC';
    } else {
        return 'Unknown Device';
    }
}

// Function to get the current time
function getTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return hours + ':' + minutes + ':' + seconds;
}

// Function to send a message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        displayMessage(message);
        saveMessage(message);
        messageInput.value = '';
    }
}

// Function to save a message to local storage
function saveMessage(message) {
    let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    messages.push({ device: getDeviceName(), time: getTime(), content: message });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Function to load messages from local storage
function loadMessages() {
    let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    messages.forEach(message => {
        const device = message.device;
        const time = message.time;
        const content = message.content;
        displayMessage(content);
    });
}

// Load messages when the page loads
loadMessages();
