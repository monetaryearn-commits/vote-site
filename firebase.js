// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const dbRef = ref;
export { get, update, runTransaction };
