# CarHub MongoDB/Mongoose Server Setup

## Prerequisites
1. MongoDB installed locally OR MongoDB Atlas account
2. Node.js (version 16+)

## Installation

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# For local MongoDB:
export MONGODB_URI=mongodb://localhost:27017/carhub

# For MongoDB Atlas:
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carhub?retryWrites=true&w=majority

# Set port (optional, defaults to 5000)
export PORT=5000
```

4. Start the server:
```bash
# Development with auto-restart
npm run dev

# Production
npm start
```

## Features

### Mongoose Models
- **Car Model**: Complete schema matching the provided requirements
- **User Model**: User management with authentication

### API Endpoints
- `POST /api/cars` - Create new car
- `GET /api/cars` - List cars with filtering/pagination
- `GET /api/cars/:id` - Get single car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification

### Test Data
The server automatically seeds:
- Admin user: `+250788881400` / `carhub@1050`
- Regular user: `+250793373953` / `carhub@1050`
- 3 demo cars owned by admin

## Car Schema Fields
- `make` (required): Car manufacturer
- `model` (required): Car model
- `year` (required): Manufacturing year
- `price` (required): Car price
- `status`: available/reserved/sold
- `mileage`: Car mileage
- `vin`: Vehicle identification number (unique)
- `description`: Car description
- `images`: Array of image URLs
- `primaryImage`: Main display image
- `location`: Car location
- `fuelType`: petrol/diesel/electric/hybrid/other
- `transmission`: automatic/manual (required)
- `bodyType`: Car body type
- `color`: Car color
- `owner`: Reference to User (auto-set to admin)

## Usage with Frontend
Make sure your frontend API_URL points to this server:
```
VITE_API_URL=http://localhost:5000/api
```
