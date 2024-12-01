const WebSocket = require('ws');
const express = require('express');
const http = require('http');

// Create the app and the server
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Serve static files from the 'public' directory (ensure your HTML, CSS, JS are in this folder)
app.use(express.static('public'));

// A Map to store users and their WebSocket connections
const users = new Map();

// When a new WebSocket connection is established
wss.on('connection', (ws) => {
    console.log('A user connected');
    
    // Handle incoming messages
    ws.on('message', (message) => {
        if (!users.has(ws) && message.startsWith('System:')) {
            // Set the username when a user joins (based on the System message)
            const username = message.split(' ')[1];
            users.set(ws, username);
        }

        const sender = users.get(ws) || 'Unknown';
        
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`${sender}: ${message}`);
            }
        });
    });

    // Handle disconnection
    ws.on('close', () => {
        const username = users.get(ws);
        users.delete(ws);
        console.log(`${username || 'A user'} disconnected`);
    });
});

// Set the port dynamically for Heroku or fallback to 3000
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
