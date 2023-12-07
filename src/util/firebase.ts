import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAV3hML3kQJWGgVvm-Dh0l4IV-MwIvUgIw",
  authDomain: "officeexpenses-8b166.firebaseapp.com",
  projectId: "officeexpenses-8b166",
  storageBucket: "officeexpenses-8b166.appspot.com",
  messagingSenderId: "537135181904",
  appId: "1:537135181904:web:74b4641c01dae415736155",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
