// firebase.js

// Importing necessary Firebase functions
import { initializeApp } from 'firebase/app'; // Initializes the Firebase app
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // Imports authentication functions and the Google provider
import { getStorage } from 'firebase/storage'; // Imports Firebase storage functions
import { getFirestore } from 'firebase/firestore'; // Imports Firestore (database) functions

// Firebase configuration object containing the project's credentials
const firebaseConfig = {
  apiKey: "AIzaSyD052JSYJs-fuHVXoTaoWzQHVnQkwed3EY", // API key for accessing Firebase services
  authDomain: "assignment-2-60b48.firebaseapp.com", // Domain for Firebase Authentication
  projectId: "assignment-2-60b48", // The ID of the Firebase project
  storageBucket: "assignment-2-60b48.firebasestorage.app", // Bucket for storing files like images
  messagingSenderId: "1081580521432", // ID for sending messages via Firebase
  appId: "1:1081580521432:web:7d45c522807532b96514ad" // The unique app ID for identifying the app
};

// Initializing the Firebase app with the above configuration
const app = initializeApp(firebaseConfig);

// Setting up and exporting the necessary Firebase services for use in other parts of the app
export const auth = getAuth(app); // Initializes and exports Firebase Authentication service
export const googleProvider = new GoogleAuthProvider(); // Creates and exports the Google authentication provider
export const storage = getStorage(app); // Initializes and exports Firebase Storage service
export const db = getFirestore(app); // Initializes and exports Firestore (database) service
