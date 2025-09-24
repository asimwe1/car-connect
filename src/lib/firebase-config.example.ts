// Firebase Configuration Example
// Copy this file to firebase.ts and replace with your actual Firebase project credentials

export const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your Firebase API key
  authDomain: "carhub-rw.firebaseapp.com", // Replace with your Firebase auth domain
  projectId: "carhub-rw", // Replace with your Firebase project ID
  storageBucket: "carhub-rw.appspot.com", // Replace with your Firebase storage bucket
  messagingSenderId: "123456789012", // Replace with your Firebase messaging sender ID
  appId: "1:123456789012:web:abcdef1234567890abcdef" // Replace with your Firebase app ID
};

// Instructions to set up Firebase Phone Authentication:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing project
// 3. Enable Authentication > Sign-in method > Phone
// 4. Add your domain to authorized domains
// 5. Copy the config values to src/lib/firebase.ts
// 6. For testing, add test phone numbers in Firebase Console > Authentication > Sign-in method > Phone > Phone numbers for testing
