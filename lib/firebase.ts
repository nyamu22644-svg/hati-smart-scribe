import { initializeApp, getApp, getApps } from "firebase/app";
// Consolidated auth imports to help the environment resolve named exports correctly and fix line-specific member detection errors
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithCustomToken, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

/**
 * HATI Official Registry - Firebase Integration
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || process.env.API_KEY,
  authDomain: "hati-certified.firebaseapp.com",
  projectId: "hati-certified",
  storageBucket: "hati-certified.firebasestorage.app",
  messagingSenderId: "846773721316",
  appId: "1:846773721316:web:92b0ef7603801eee4734f1",
  measurementId: "G-H69HJSTDHV"
};

// Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Set SESSION persistence - users must log in again when browser closes
setPersistence(auth, browserSessionPersistence).catch(err => 
  console.warn('HATI_SECURITY: Session persistence setup:', err)
);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCustomToken
};
