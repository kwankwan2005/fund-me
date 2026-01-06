// setup Firebase configuration and services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// modify config here with your Firebase project details
const firebaseConfig = {
    apiKey: "AIzaSyBRi-W6o6PGF6VPsRzjBbyAwCFpNFjPQSU",
    authDomain: "fundme-project.firebaseapp.com",
    databaseURL: "https://fundme-project-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "fundme-project",
    storageBucket: "fundme-project.firebasestorage.app",
    messagingSenderId: "798338399983",
    appId: "1:798338399983:web:4e9675eba2d764cd5ae51a",
    measurementId: "G-98E2NCWXNY"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
