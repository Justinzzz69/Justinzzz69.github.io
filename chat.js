const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const STORAGE_KEY = 'chat_messages';

let peerConnection;
let dataChannel;

// Function to display a message in the chat
function displayMessage(message) {
    const div = document.createElement('div');
    div.textContent = message;
    chatMessages.appendChild(div);
}

// Function to send a message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        displayMessage('You: ' + message);
        dataChannel.send(message);
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
        displayMessage(device + ' (' + time + '): ' + content);
    });
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

// Set up peer connection
function setupPeerConnection() {
    peerConnection = new RTCPeerConnection();

    // Create a data channel
    dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onmessage = (event) => {
        displayMessage('Peer: ' + event.data);
    };

    // Set up event listeners for peer connection
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Send the ICE candidate to the other peer
            sendMessage({ type: 'candidate', candidate: event.candidate });
        }
    };

    // Create offer
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            // Send the offer to the other peer
            sendMessage({ type: 'offer', offer: peerConnection.localDescription });
        })
        .catch(error => console.error('Error creating offer:', error));
}

// Listen for incoming offer
function handleOffer(offer) {
    setupPeerConnection();
    peerConnection.setRemoteDescription(offer)
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            // Send the answer to the other peer
            sendMessage({ type: 'answer', answer: peerConnection.localDescription });
        })
        .catch(error => console.error('Error creating answer:', error));
}

// Listen for incoming answer
function handleAnswer(answer) {
    peerConnection.setRemoteDescription(answer)
        .catch(error => console.error('Error setting remote description:', error));
}

// Function to handle ICE candidate
function handleICECandidate(candidate) {
    peerConnection.addIceCandidate(candidate)
        .catch(error => console.error('Error adding ICE candidate:', error));
}

// Function to handle incoming messages
function handleMessage(message) {
    switch (message.type) {
        case 'offer':
            handleOffer(message.offer);
            break;
        case 'answer':
            handleAnswer(message.answer);
            break;
        case 'candidate':
            handleICECandidate(message.candidate);
            break;
    }
}

// WebSocket setup
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    console.log('WebSocket connected');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleMessage(message);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket closed');
};

// Call setupPeerConnection function when the page loads
setupPeerConnection();
