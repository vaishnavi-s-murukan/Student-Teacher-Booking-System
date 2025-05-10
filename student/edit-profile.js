import { auth, db } from '../js/firebase-config.js';
import {
  getDoc,
  doc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  updatePassword,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const form            = document.getElementById('editProfileForm');
const nameInput       = document.getElementById('name');
const emailInput      = document.getElementById('email');
const passwordInput   = document.getElementById('newPassword');
const profilePicInput = document.getElementById('profilePic');
const previewPic      = document.getElementById('previewPic');
const loader          = document.getElementById('loader');

// 1) Image preview
profilePicInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewPic.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

function toggleLoader(show) {
  loader.style.display = show ? 'block' : 'none';
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    return window.location.href = '/login.html';
  }
  const userRef = doc(db, 'users', user.uid);
  const snap    = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    nameInput.value    = data.name || '';
    emailInput.value   = data.email || '';
    if (data.photoURL) previewPic.src = data.photoURL;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  toggleLoader(true);

  const newName     = nameInput.value.trim();
  const newPassword = passwordInput.value.trim();
  const user        = auth.currentUser;

  try {
    // Update Firestore name (and optionally photoURL if you have storage logic)
    await updateDoc(doc(db, 'users', user.uid), { name: newName });

    // Update password if provided
    if (newPassword.length >= 6) {
      await updatePassword(user, newPassword);
    }

    // show popup and redirect
    alert('Profile updated successfully!');
    window.location.href = '/student/student.html';

  } catch (err) {
    console.error('Update error:', err);
    alert('Error updating profile: ' + err.message);
  } finally {
    toggleLoader(false);
  }
});
