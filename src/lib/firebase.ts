// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBkgIYVEj5nB8ygwiRXeyk0cPj9YWjrNR4",
  authDomain: "tubeseekcom.firebaseapp.com",
  projectId: "tubeseekcom",
  storageBucket: "tubeseekcom.firebasestorage.app",
  messagingSenderId: "681212933796",
  appId: "1:681212933796:web:82f6540b2b962d8d40d831",
  measurementId: "G-HCHEJNN1RR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


export { app, auth, googleProvider };
