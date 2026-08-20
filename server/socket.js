import { WebSocketServer } from 'ws';

let wss = null;

/**
 * Initialize WebSockets on a shared HTTP server.
 */
export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket Client Connected');
    
    ws.on('close', () => {
      console.log('WebSocket Client Disconnected');
    });

    ws.on('error', (error) => {
      console.error(`WebSocket Error: ${error.message}`);
    });
  });

  console.log('WebSocket Server initialized.');
  return wss;
}

/**
 * Broadcast a JSON message to all connected clients.
 */
export function broadcast(data) {
  if (!wss) {
    console.warn('WebSocket server not initialized. Skipping broadcast.');
    return;
  }

  const payload = JSON.stringify(data);
  let count = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN in ws library
      client.send(payload);
      count++;
    }
  });

  // Log broadcast counts for debugging
  if (count > 0) {
    console.log(`[WS Broadcast] sent ${data.type} to ${count} client(s).`);
  }
}
