import firebase from "firebase/app";
import "firebase/firestore";

// Get a Firestore instance
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "stock-crawler-1975d.firebaseapp.com",
  databaseURL: "https://stock-crawler-1975d.firebaseio.com",
  projectId: "stock-crawler-1975d",
  // storageBucket: "stock-crawler-1975d.appspot.com",
  // messagingSenderId: "617027456671",
  appId: "1:617027456671:web:ca352d7365e2aee407dcaa"
};

export const db = firebase.initializeApp(firebaseConfig).firestore();