
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRby8WJ2qNefsXbA77waNSfyqkRoDWBQY",
  authDomain: "mshp-000.firebaseapp.com",
  projectId: "mshp-000",
  storageBucket: "mshp-000.firebasestorage.app",
  messagingSenderId: "468750164638",
  appId: "1:468750164638:web:dd44bbc9770b7bdf4d518f",
  measurementId: "G-H7EEJXWKG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Add this line when in development environment to use local emulator
// Uncomment if using Firebase emulators
// if (window.location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://localhost:9099");
// }

export default app;
