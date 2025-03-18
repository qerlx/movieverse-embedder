
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQ6xGgRDSiub6-4mESyVf2lIlGb9tlXds",
  authDomain: "moviestreamhub-auth.firebaseapp.com",
  projectId: "moviestreamhub-auth",
  storageBucket: "moviestreamhub-auth.appspot.com",
  messagingSenderId: "729538434932",
  appId: "1:729538434932:web:d21b15b0adbd45e12c2a19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
