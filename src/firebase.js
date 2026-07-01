import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4CY-H0EEsPR6fjnlVdstImM5GZlAYe70",
  authDomain: "brixs-faucet.firebaseapp.com",
  projectId: "brixs-faucet",
  storageBucket: "brixs-faucet.firebasestorage.app",
  messagingSenderId: "144067974865",
  appId: "1:144067974865:web:a25a98728fb46d632257f0",
  measurementId: "G-57RM3BWZ40"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();
