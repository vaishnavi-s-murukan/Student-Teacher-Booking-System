// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDWvEJNI8ILfW3w_CUar32sho8K9Iw5MA",
  authDomain: "student-teacher-booking-53a47.firebaseapp.com",
  projectId: "student-teacher-booking-53a47",
  storageBucket: "student-teacher-booking-53a47.appspot.com",
  messagingSenderId: "8051809107",
  appId: "1:8051809107:web:7eacf644c329aa76059fa6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
