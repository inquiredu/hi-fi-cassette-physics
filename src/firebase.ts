import { initializeApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// Replace with the actual config from mixtapeme-26b71 for production deployment
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "mixtapeme-26b71.firebaseapp.com",
  projectId: "mixtapeme-26b71",
  storageBucket: "mixtapeme-26b71.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Functions
export const functions = getFunctions(app);

// Connect to the local emulator when developing
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
