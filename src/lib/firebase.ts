import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  // Prefer env, but provide sane defaults from the provided Firebase project
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpqXlGrQ3XsuypvMdicDNrRFSVe3VuTME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carconnect-91697.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carconnect-91697",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carconnect-91697.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "858129574431",
  // App ID is not visible in the screenshot; keep env-first with a safe placeholder
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:858129574431:web:placeholderappid"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
