# WebSocket Notifications Setup

## Development WebSocket Server

To test real-time notifications in development, you can run the included WebSocket server.

### Quick Start

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Run development with WebSocket server**:
```bash
# Option 1: Run both frontend and WebSocket server together
npm run dev:with-ws

# Option 2: Run separately
# Terminal 1:
npm run dev:ws

# Terminal 2:
npm run dev
```

3. **View notifications**: 
   - Open the app at `http://localhost:5173`
   - Look for the notification bell icon in the top navigation
   - You'll see demo notifications and periodic updates

### How It Works

- **Development**: WebSocket server runs on `ws://localhost:8080`
- **Production**: Set `VITE_WS_URL` environment variable to your WebSocket server
- **Fallback**: If no WebSocket server is available, demo notifications are shown

### WebSocket Server Features

- **Real-time notifications** sent to connected clients
- **Demo notifications** sent every 30 seconds
- **Connection status** tracking
- **Graceful shutdown** handling

### Environment Variables

```bash
# Optional: Custom WebSocket URL
VITE_WS_URL=ws://your-websocket-server.com/notifications
```

### Notification Types

The system supports these notification types:
- `info` - General information (blue)
- `success` - Success messages (green) 
- `warning` - Warning messages (yellow)
- `error` - Error messages (red)

### Categories

- `system` - System-wide notifications
- `user` - User-specific notifications
- `order` - Order-related notifications
- `booking` - Booking-related notifications
- `chat` - Chat/support notifications
- `admin` - Admin-only notifications

### Production Deployment

For production, you'll need to:
1. Deploy a WebSocket server (Node.js, Socket.io, etc.)
2. Set the `VITE_WS_URL` environment variable
3. Handle authentication and user-specific notifications
4. Implement proper error handling and reconnection logic
