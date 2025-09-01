// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlUcE5A4FXcus2BAESq3fmOeh0osAEAZY",
  authDomain: "driverdemoapp-cbf83.firebaseapp.com",
  projectId: "driverdemoapp-cbf83",
  storageBucket: "driverdemoapp-cbf83.firebasestorage.app",
  messagingSenderId: "82721787190",
  appId: "1:82721787190:web:62ccec882dc06c772fb797"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
