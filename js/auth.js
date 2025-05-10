import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Handle Registration (student only)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Save student info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "student",
        approved: false  // Student needs admin approval
      });

      alert('Registration successful! Please login.');
      window.location.href = 'login.html';

    } catch (error) {
      console.error('Registration Error:', error);
      alert(error.message);
    }
  });
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        alert("No user data found.");
        return;
      }

      const userData = userDoc.data();

      if (userData.role === "student" && !userData.approved) {
        alert("Admin has not approved your account yet.");
        return;
      }

      switch (userData.role) {
        case "admin":
          window.location.href = "/admin/admin.html";
          break;
        case "teacher":
          window.location.href = "/teacher/teacher.html";
          break;
        case "student":
          window.location.href = "/student/student.html";
          break;
        default:
          alert("Unknown role!");
      }

    } catch (error) {
      console.error('Login Error:', error);
      alert(error.message);
    }
  });
}
