const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve the static HTML file
app.use(express.static('public'));
const users = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (!users.has(ws) && message.startsWith('System:')) {
            const username = message.split(' ')[1];
            users.set(ws, username);
        }
        const sender = users.get(ws) || 'Unknown';
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`${sender}: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        const username = users.get(ws);
        users.delete(ws);
        console.log(`${username || 'A user'} disconnected`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
