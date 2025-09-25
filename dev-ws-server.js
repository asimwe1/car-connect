// Simple WebSocket server for development notifications
const WebSocket = require('ws');

const port = 8080;
const wss = new WebSocket.Server({ port });

console.log(`WebSocket server running on ws://localhost:${port}`);

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    id: Date.now().toString(),
    type: 'info',
    title: 'WebSocket Connected',
    message: 'Real-time notifications are now active!',
    category: 'system',
    timestamp: new Date().toISOString()
  }));

  // Send periodic demo notifications
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const notifications = [
        {
          type: 'success',
          title: 'New Car Inquiry',
          message: 'Someone is interested in your Toyota Camry',
          category: 'user'
        },
        {
          type: 'info',
          title: 'Price Alert',
          message: 'A similar car was listed for $23,000',
          category: 'system'
        },
        {
          type: 'warning',
          title: 'Document Expiring',
          message: 'Your car insurance expires in 30 days',
          category: 'user'
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      ws.send(JSON.stringify({
        id: Date.now().toString(),
        ...randomNotification,
        timestamp: new Date().toISOString()
      }));
    }
  }, 30000); // Send every 30 seconds

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    process.exit(0);
  });
});
