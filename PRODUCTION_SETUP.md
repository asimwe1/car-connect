# CarHub Rwanda - Production Setup Guide

## 🚀 Production Configuration

### Environment Variables
Create a `.env.local` file in your project root with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://carhubconnect.onrender.com/api

# Firebase Configuration (Replace with your actual Firebase config)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=carhub-rw.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carhub-rw
VITE_FIREBASE_STORAGE_BUCKET=carhub-rw.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Admin Configuration
VITE_ADMIN_PHONE_1=+250788881400
VITE_ADMIN_PHONE_2=+250793373953
VITE_ADMIN_PASSWORD_1=carhub@1050
VITE_ADMIN_PASSWORD_2=admin

# App Configuration
VITE_APP_NAME=CarHub Rwanda
VITE_APP_URL=https://carhub-rw.vercel.app
VITE_APP_DESCRIPTION=Find, buy, sell, or rent premium cars in Rwanda
```

### Admin Access Credentials

#### Admin Account 1
- **Phone**: `+250788881400`
- **Password**: `carhub@1050`
- **Role**: Admin
- **Access**: Full admin dashboard

#### Admin Account 2
- **Phone**: `+250793373953`
- **Password**: `admin`
- **Role**: Admin
- **Access**: Full admin dashboard

### Firebase Setup Instructions

1. **Create Firebase Project**:
   - Go to https://console.firebase.google.com/
   - Create project: `carhub-rw`
   - Enable Authentication > Phone provider

2. **Configure Phone Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Phone provider
   - Add authorized domains:
     - `carhub-rw.vercel.app`
     - `localhost` (for development)

3. **Add Test Phone Numbers** (for development):
   - Go to Authentication > Sign-in method > Phone > Phone numbers for testing
   - Add these test numbers:
     - `+250788881400` with code `123456`
     - `+250793373953` with code `123456`
     - `+16505551234` with code `123456`
     - `+16505551235` with code `123456`

4. **Update Firebase Config**:
   - Copy `src/lib/firebase-config.example.ts` to `src/lib/firebase.ts`
   - Replace placeholder values with your actual Firebase credentials

### Production Features

✅ **Firebase Phone Authentication**
- Real SMS for production users
- Test numbers for development (no SMS charges)
- Admin bypass for testing

✅ **Admin Dashboard Access**
- Two admin accounts configured
- Bypass OTP verification for admin numbers
- Full dashboard access

✅ **Security Features**
- HTTPS API calls
- Secure authentication flow
- Error boundaries for production

✅ **SEO Optimization**
- Meta tags and descriptions
- Canonical URLs
- Page-specific SEO

### Deployment URLs

- **Production**: https://carhub-rw.vercel.app
- **Latest Deploy**: https://carhub-nquarpzc6-leandre000s-projects.vercel.app

### Testing Instructions

#### For Development (No SMS charges):
- Use test numbers: `+16505551234`, `+16505551235`
- Verification code: `123456`

#### For Admin Testing:
- **Admin 1**: `+250788881400` / `carhub@1050`
- **Admin 2**: `+250793373953` / `admin`
- These bypass OTP verification

#### For Production Testing:
- Real phone numbers will receive actual SMS
- Admin numbers still bypass OTP

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel build --prod
vercel deploy --prebuilt --prod
```

### Support

For any issues or questions, contact the development team.
