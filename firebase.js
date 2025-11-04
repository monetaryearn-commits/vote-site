// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref as dbRef,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// 👇 Paste your config here from Firebase Console
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC57SuWwG_zYznXtJLsvN9EbPMkJUPO3yw",
  authDomain: "tnvotecount-54848.firebaseapp.com",
  databaseURL: "https://tnvotecount-54848-default-rtdb.firebaseio.com",
  projectId: "tnvotecount-54848",
  storageBucket: "tnvotecount-54848.firebasestorage.app",
  messagingSenderId: "314648286297",
  appId: "1:314648286297:web:712a67a5df6a5f39a0cd48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, dbRef, runTransaction };
