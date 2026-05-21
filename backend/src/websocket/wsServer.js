const WebSocket = require('ws');

let wss;
const clients = new Set();

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    clients.add(ws);
    console.log(`🔌 WS клиент подключён. Всего: ${clients.size}`);

    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Подключено к ЖКХ системе' }));

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        console.log('WS сообщение:', msg);
        // Echo ping
        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Неверный формат сообщения' }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`🔌 WS клиент отключён. Всего: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('WS ошибка:', err);
      clients.delete(ws);
    });
  });

  return wss;
};

const broadcast = (data) => {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = { initWebSocket, broadcast };
