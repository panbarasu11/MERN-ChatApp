// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-chatapp-b802a.firebaseapp.com",
  projectId: "mern-chatapp-b802a",
  storageBucket: "mern-chatapp-b802a.firebasestorage.app",
  messagingSenderId: "600047441222",
  appId: "1:600047441222:web:e4da9c82288df4a8840147",
  measurementId: "G-280G6JB5BQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);