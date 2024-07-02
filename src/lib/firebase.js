import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "wavechat-d1dad.firebaseapp.com",
  projectId: "wavechat-d1dad",
  storageBucket: "wavechat-d1dad.appspot.com",
  messagingSenderId: "249121349463",
  appId: "1:249121349463:web:f2a12a6a771c70412a6812"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()

export const db = getFirestore()

export const storage = getStorage()