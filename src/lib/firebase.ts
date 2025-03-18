
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3kPuTGe3QWEkHQT2UD-OhuJfoIZZXgC4",
  authDomain: "moviestreamhub-7bbc6.firebaseapp.com",
  projectId: "moviestreamhub-7bbc6",
  storageBucket: "moviestreamhub-7bbc6.appspot.com",
  messagingSenderId: "600172034861",
  appId: "1:600172034861:web:b8af0073b25c99b516be67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
