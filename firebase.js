import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArucx2pHioYdKk3Vli-MTXcPLEcWLDyS8",
  authDomain: "ai-chatbot-project-63de8.firebaseapp.com",
  projectId: "ai-chatbot-project-63de8",
  storageBucket: "ai-chatbot-project-63de8.firebasestorage.app",
  messagingSenderId: "176739914504",
  appId: "1:176739914504:web:7cf8729bf84a2a147692bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };