import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANl49UtxIbF4BlPKBPvh4eD68amE-O45g",
  authDomain: "lakepalicapp.firebaseapp.com",
  projectId: "lakepalicapp",
  storageBucket: "lakepalicapp.firebasestorage.app",
  messagingSenderId: "129178792354",
  appId: "1:129178792354:web:226be744cd632a39b282fb"
};

// Inicijalizacija Firebase-a
const app = initializeApp(firebaseConfig);

// Inicijalizacija baze podataka (Firestore)
export const db = getFirestore(app);
