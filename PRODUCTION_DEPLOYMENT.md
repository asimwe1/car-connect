# CarHub Production Deployment Guide

## Backend Integration

### Production Backend
- **API Base URL**: `https://carhubconnect.onrender.com/api`
- **WebSocket URL**: `wss://carhubconnect.onrender.com/notifications`

### Environment Configuration

#### For Vercel Deployment
Set these environment variables in your Vercel dashboard:

```bash
# Required - Backend Integration
VITE_API_URL=https://carhubconnect.onrender.com/api
VITE_WS_URL=wss://carhubconnect.onrender.com/notifications

# Optional - Firebase Configuration (if using Firebase features)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## API Endpoints Integration

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Cars Management
- `GET /api/cars` - List cars with pagination and filters
- `GET /api/cars/:id` - Get single car details
- `POST /api/cars` - Create new car listing
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Delete car listing
- `GET /api/cars/me/mine` - Get user's car listings

### Bookings & Orders
- `POST /api/bookings` - Create test drive booking
- `GET /api/bookings/me` - Get user's bookings
- `POST /api/bookings/:id/confirm` - Confirm booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/orders` - Create purchase order
- `GET /api/orders/me` - Get user's orders
- `POST /api/orders/checkout` - Create checkout session
- `POST /api/orders/:id/pay` - Process payment

### Admin Endpoints
- `GET /api/admin/orders` - Get all orders (admin)
- `GET /api/admin/bookings` - Get all bookings (admin)
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)

## WebSocket Notifications

### Connection
- Automatically connects to `wss://carhubconnect.onrender.com/notifications`
- Sends authentication data when user is logged in
- Implements automatic reconnection with exponential backoff
- Falls back to demo notifications in development

### Notification Types
- `info` - General information
- `success` - Success messages
- `warning` - Warning messages
- `error` - Error messages

### Categories
- `system` - System-wide notifications
- `user` - User-specific notifications
- `order` - Order-related notifications
- `booking` - Booking-related notifications
- `chat` - Chat/support notifications
- `admin` - Admin-only notifications

## Production Features

### API Service
- ✅ Automatic HTTPS enforcement in production
- ✅ Request retry logic with exponential backoff
- ✅ 30-second request timeout
- ✅ Proper error handling and user-friendly messages
- ✅ Authentication token management
- ✅ CORS support with credentials

### WebSocket Service
- ✅ Automatic reconnection in production
- ✅ Authentication integration
- ✅ Connection status tracking
- ✅ Graceful fallback to demo notifications in development
- ✅ Proper error handling and logging

### Build Configuration
- ✅ Production-optimized builds
- ✅ Code splitting for better performance
- ✅ Asset optimization
- ✅ Development proxy disabled in production

## Deployment Steps

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Update with production values
VITE_API_URL=https://carhubconnect.onrender.com/api
VITE_WS_URL=wss://carhubconnect.onrender.com/notifications
```

### 2. Build for Production
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Test production build locally
npm run preview
```

### 3. Deploy to Vercel
```bash
# Deploy with Vercel CLI
vercel --prod

# Or connect GitHub repository to Vercel dashboard
# Set environment variables in Vercel dashboard
```

### 4. Verify Deployment
- ✅ Check API connectivity at your deployed URL
- ✅ Test user authentication flows
- ✅ Verify WebSocket notifications work
- ✅ Test car listing and booking features
- ✅ Confirm admin panel functionality

## Monitoring & Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend allows your frontend domain
2. **WebSocket Connection Failed**: Check WebSocket server status
3. **API Timeouts**: Backend server may be cold-starting (normal for Render free tier)
4. **Authentication Issues**: Verify token handling and session management

### Health Checks
- API Health: `GET https://carhubconnect.onrender.com/api/health`
- WebSocket Status: Check browser console for connection logs
- Frontend Status: Monitor Vercel deployment logs

## Security Considerations

### Production Checklist
- ✅ HTTPS enforced for all API calls
- ✅ Secure WebSocket connections (WSS)
- ✅ No sensitive data in frontend code
- ✅ Environment variables properly configured
- ✅ CORS configured for production domains only
- ✅ Request timeout and retry limits implemented

### Best Practices
- Regular security updates
- Monitor API usage and rate limits
- Implement proper error logging
- Use CDN for static assets
- Enable gzip compression
- Monitor performance metrics