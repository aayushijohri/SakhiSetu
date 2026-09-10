import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "sakhisetu-demo.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "sakhisetu-demo",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "sakhisetu-demo.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_API_KEY !== "demo-api-key") {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);

    signInAnonymously(auth)
      .then(() => console.log("✅ Anonymous Auth Success"))
      .catch((err) => console.warn("Anonymous Auth notice:", err));
  } else {
    // Offline-first fallback initialization
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (e) {
  console.warn("Firebase offline mode active:", e);
}

export { app, db, auth };