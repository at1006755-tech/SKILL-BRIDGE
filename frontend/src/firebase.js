import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAa1mp2ZPVUxE6Gk6DiRB2SkSQd5xrQK1Y",
  authDomain: "skillbridge-ai-542db.firebaseapp.com",
  projectId: "skillbridge-ai-542db",
  storageBucket: "skillbridge-ai-542db.firebasestorage.app",
  messagingSenderId: "514938106968",
  appId: "1:514938106968:web:4434a0a737dc17f223862d"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore & Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };
export default app;
