// /admin/admin.js
import { auth, db } from '../js/firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, deleteDoc, doc, setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements (may be null on other pages)
  const addTeacherForm = document.getElementById('addTeacherForm');
  const studentList = document.getElementById('studentList');
  const teachersList = document.getElementById('teachersList');
  const editForm = document.getElementById('editTeacherForm');
  const editName = document.getElementById('editName');
  const editEmail = document.getElementById('editEmail');
  const editDept = document.getElementById('editDept');
  const editSubject = document.getElementById('editSubject');
  const saveEditBtn = document.getElementById('saveEdit');
  const cancelEditBtn = document.getElementById('cancelEdit');
  const logoutBtn = document.getElementById('logoutBtn');
  let editingTeacherId = null;

  // 1. Add Teacher
  if (addTeacherForm) {
    addTeacherForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('tName').value.trim();
      const dept = document.getElementById('tDept').value.trim();
      const subject = document.getElementById('tSubject').value.trim();
      const email = document.getElementById('tEmail').value.trim(); // Add email field in form
      // Generate random password
      const password = Math.random().toString(36).slice(-8); // 8-char random password


      try {
        // Step 1: Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        // Step 1: Add to "teachers" collection for admin listing
        await setDoc(doc(db, "teachers", uid), {
          name,
          email,
          department: dept,
          subject
        });

        // Step 2: Add to "users" collection with role "teacher"
        await setDoc(doc(db, "users", uid), {
          name,
          email,
          role: "teacher",
          approved: true
        });

        addTeacherForm.reset();
        alert(`Teacher added!\nTemporary password: ${password}\nShare this with the teacher.`);
      } catch (err) {
        console.error(err);
        alert("Failed to add teacher. Maybe email already used?");
      }
    });
  }

  // 2. Student Approval
  async function loadStudents() {
    if (!studentList) return;
    studentList.innerHTML = '';
    const q = query(collection(db, "users"), where("approved", "==", false));
    const snap = await getDocs(q);
    if (snap.empty) {
      studentList.innerHTML = '<tr><td colspan="4">No pending registrations.</td></tr>';
      return;
    }
    snap.forEach(snapDoc => {
      const u = snapDoc.data();
      if (u.role !== 'admin') {
        studentList.innerHTML += `
          <tr>
            <td>${u.name}</td>
            <td>${u.role}</td>
            <td>${u.email}</td>
            <td>
              <button class="approve-btn approve" data-id="${snapDoc.id}">Approve</button>
              <button class="reject-btn reject" data-id="${snapDoc.id}">Reject</button>
            </td>
          </tr>
        `;
      }
    });
  }

  // 3. Teacher List
  function loadTeachers() {
    if (!teachersList) return;
    onSnapshot(collection(db, "teachers"), snap => {
      teachersList.innerHTML = '';
      snap.forEach(docSnap => {
        const t = docSnap.data();
        teachersList.innerHTML += `
        <tr>
          <td>${t.name}</td>
          <td>${t.email || '-'}</td>
          <td>${t.department}</td>
          <td>${t.subject}</td>
          <td>
            <button class="update-btn edit-teacher"
              data-id="${docSnap.id}"
              data-name="${t.name}"
              data-email="${t.email || ''}"
              data-department="${t.department}"
              data-subject="${t.subject}">
              Update
            </button>
            <button class="delete-btn delete-teacher" data-id="${docSnap.id}">
              Delete
            </button>
          </td>
        </tr>
      `;
      });
    });
  }

  // Event Delegation
  document.addEventListener('click', async e => {
    const id = e.target.dataset.id;
    // Approve/Reject
    if (e.target.matches('.approve')) {
      await updateDoc(doc(db, "users", id), { approved: true });
      loadStudents();
    }
    if (e.target.matches('.reject')) {
      await updateDoc(doc(db, "users", id), { approved: false });
      loadStudents();
    }
    // Show edit form
    if (e.target.matches('.edit-teacher')) {
      editingTeacherId = id;
      editForm.style.display = 'block';
      editName.value = e.target.dataset.name;
      editEmail.value = e.target.dataset.email;
      editDept.value = e.target.dataset.department;
      editSubject.value = e.target.dataset.subject;
    }
    // Delete teacher
    if (e.target.matches('.delete-teacher')) {
      if (confirm("Really delete?")) {
        await deleteDoc(doc(db, "teachers", id));
        await deleteDoc(doc(db, "users", id));
        alert("Deleted!");
      }
    }
  });

  // Save Edit
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', async () => {
      if (!editingTeacherId) return;
      const tRef = doc(db, "teachers", editingTeacherId);
      const uRef = doc(db, "users", editingTeacherId);
      const newName = editName.value.trim();
      const newDept = editDept.value.trim();
      const newSub = editSubject.value.trim();
      const newEmail = editEmail.value.trim();
      if (newName && newDept && newSub && newEmail) {
        await updateDoc(tRef, {
          name: newName,
          email: newEmail,
          department: newDept,
          subject: newSub
        });

        await updateDoc(uRef, {
          name: newName,
          email: newEmail
        });

        alert("Teacher updated!");
        editForm.style.display = 'none';
        editingTeacherId = null;
      } else {
        alert("Please fill all fields.");
      }
    });
  }

  // Cancel Edit
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      editForm.style.display = 'none';
      editingTeacherId = null;
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = '../login.html';
    });
  }

  // Init
  loadStudents();
  loadTeachers();
});
