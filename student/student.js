import { auth, db } from '../js/firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDoc, doc, getDocs,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Toggle dropdown
const profileToggle = document.getElementById('profileToggle');
const dropdown = document.getElementById('dropdownMenu');

if (profileToggle && dropdown) {
  profileToggle.addEventListener('click', () => {
    dropdown.classList.toggle('show');
  });
}

// Load student name/email
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const nameEl = document.getElementById('studentName');
      const emailEl = document.getElementById('studentEmail');
      if (nameEl) nameEl.textContent = data.name;
      if (emailEl) emailEl.textContent = data.email;
    }
  } else {
    window.location.href = "/login.html";
  }
});
// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '/login.html';
  });
}
const searchInput = document.getElementById('searchInput');
const resultsBox = document.getElementById('teacherResults');

export async function searchTeacher() {
  const keyword = searchInput.value.trim().toLowerCase();
  resultsBox.innerHTML = '';

  if (!keyword) {
    resultsBox.innerHTML = '<p>Please enter a name or subject.</p>';
    return;
  }

  const teacherRef = collection(db, 'teachers');

  try {
    const snapshot = await getDocs(teacherRef);
    let found = false;

    snapshot.forEach(docSnap => {
      const teacher = docSnap.data();
      const teacherId = docSnap.id;

      const name = teacher.name?.toLowerCase() || '';
      const subject = teacher.subject?.toLowerCase() || '';

      if (name.includes(keyword) || subject.includes(keyword)) {
        found = true;

        const div = document.createElement('div');
        teacherResults.innerHTML += `
  <div class="teacher-card">
    <h3>${teacher.name}</h3>
    <p><strong>Subject:</strong> ${teacher.subject}</p>
    <p><strong>Department:</strong> ${teacher.department}</p>
    <p><strong>Email:</strong> ${teacher.email}</p>
    <button class="book-btn open-form">Book Appointment</button>
   <button class="send-msg" data-teacher="${teacher.email}">Send Message</button>
  </div>
`;
        resultsBox.appendChild(div);
      }
    });

    if (!found) {
      resultsBox.innerHTML = '<p>No matching teachers found.</p>';
    }

  } catch (error) {
    console.error('Error fetching teachers:', error);
    resultsBox.innerHTML = '<p>Error loading data.</p>';
  }
}

// Optional: define bookAppointment and messageTeacher globally
window.bookAppointment = function (teacherId) {
  // Redirect to book.html with teacherId
  window.location.href = `book.html?teacherId=${teacherId}`;
};

window.messageTeacher = function (email) {
  window.location.href = `mailto:${email}`;
};

const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', searchTeacher);
}
