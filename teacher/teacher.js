import { auth, db } from '../js/firebase-config.js';
import {
  collection, query, where, getDocs, updateDoc, addDoc, deleteDoc,
  doc, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const profileToggle = document.getElementById('profileToggle');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const logoutBtn = document.getElementById('logoutBtn');

  if (profileToggle && dropdownMenu) {
    profileToggle.addEventListener('click', () => {
      dropdownMenu.classList.toggle('show');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = "../login.html";
    });
  }

  let currentSlotId = null;

  window.editSlot = (id, oldDate, oldFrom, oldTo, oldNote) => {
    currentSlotId = id;
    document.getElementById('editSlotModal').style.display = 'block';
    document.getElementById('editSlotDate').value = oldDate;
    document.getElementById('editSlotFrom').value = oldFrom;
    document.getElementById('editSlotTo').value = oldTo;
    document.getElementById('editSlotNote').value = oldNote || '';
  };

  document.getElementById('saveSlotEdit')?.addEventListener('click', async () => {
    const newDate = document.getElementById('editSlotDate').value;
    const newFrom = document.getElementById('editSlotFrom').value;
    const newTo = document.getElementById('editSlotTo').value;
    const newNote = document.getElementById('editSlotNote').value;

    if (!newDate || !newFrom || !newTo) {
      alert("Date, From & To time are required.");
      return;
    }

    await updateDoc(doc(db, "availableSlots", currentSlotId), {
      date: newDate,
      timeFrom: newFrom,
      timeTo: newTo,
      note: newNote
    });

    alert("Slot updated!");
    document.getElementById('editSlotModal').style.display = 'none';
    currentSlotId = null;
  });

  document.getElementById('cancelSlotEdit')?.addEventListener('click', () => {
    document.getElementById('editSlotModal').style.display = 'none';
    currentSlotId = null;
  });

  window.approveAppointment = async (id) => {
    await updateDoc(doc(db, "appointments", id), { status: "approved" });
    alert('Appointment Approved!');
  };

  window.cancelAppointment = async (id) => {
    await updateDoc(doc(db, "appointments", id), { status: "cancelled" });
    alert('Appointment Cancelled!');
  };

  window.deleteSlot = async (id) => {
    try {
      await deleteDoc(doc(db, "availableSlots", id));
      alert("Slot deleted!");
    } catch (err) {
      console.error("Error deleting slot: ", err);
      alert("Failed to delete slot.");
    }
  };

  async function loadAppointments() {
    const appointmentsDiv = document.getElementById('appointmentsList');
    if (!appointmentsDiv) return;

    appointmentsDiv.innerHTML = '';
    const q = query(collection(db, "appointments"), where("teacherId", "==", auth.currentUser.uid));

    onSnapshot(q, (querySnapshot) => {
      appointmentsDiv.innerHTML = '';
      querySnapshot.forEach((docSnap) => {
        const a = docSnap.data();
        const id = docSnap.id;
        const div = document.createElement('div');
        div.innerHTML = `
          <p>
            <strong>Student ID:</strong> ${a.studentId}<br>
            <strong>Time:</strong> ${a.appointmentTime}<br>
            <strong>Message:</strong> ${a.message}<br>
            <strong>Status:</strong> ${a.status}<br>
            <button onclick="approveAppointment('${id}')">Approve</button>
            <button onclick="cancelAppointment('${id}')">Cancel</button>
          </p>
          <hr>
        `;
        appointmentsDiv.appendChild(div);
      });

      if (appointmentsDiv.innerHTML === '') {
        appointmentsDiv.innerHTML = '<p>No appointments yet.</p>';
      }
    });
  }

  async function loadAvailableSlots() {
    const tableBody = document.getElementById('slotsTableBody');
    if (!tableBody) return;

    const q = query(
      collection(db, "availableSlots"),
      where("teacherId", "==", auth.currentUser.uid)
    );

    onSnapshot(q, (snapshot) => {
      tableBody.innerHTML = '';
      if (snapshot.empty) {
        tableBody.innerHTML = `<tr><td colspan="5">No slots added.</td></tr>`;
      } else {
        snapshot.forEach((docSnap) => {
          const slot = docSnap.data();
          const id = docSnap.id;

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${slot.date}</td>
            <td>${slot.timeFrom}</td>
            <td>${slot.timeTo}</td>
            <td>${slot.note || '-'}</td>
            <td>
              <button class="edit-slot">Edit</button>
              <button class="delete-slot">Delete</button>
            </td>
          `;

          row.querySelector('.edit-slot').addEventListener('click', () => {
            editSlot(id, slot.date, slot.timeFrom, slot.timeTo, slot.note || '');
          });

          row.querySelector('.delete-slot').addEventListener('click', () => {
            deleteSlot(id);
          });

          tableBody.appendChild(row);
        });
      }
    });
  }

  const scheduleForm = document.getElementById('scheduleForm');
if (scheduleForm) {
  scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('date').value;
const timeFrom = document.getElementById('from').value;
const timeTo = document.getElementById('to').value;
const note = document.getElementById('note').value;


    if (!date || !timeFrom || !timeTo) {
      alert("Date, From and To time are required.");
      return;
    }

    if (!currentUser) {
      alert("User not authenticated.");
      return;
    }

    try {
      await addDoc(collection(db, "availableSlots"), {
        teacherId: currentUser.uid,
        date,
        timeFrom,
        timeTo,
        note,
        createdAt: new Date()
      });
      alert("Slot added!");
      scheduleForm.reset();
      loadAvailableSlots();
    } catch (err) {
      console.error("Error adding slot: ", err);
      alert("Failed to add slot.");
    }
  });
}


  // Check auth and load data
  let currentUser = null; // store user globally

// Inside onAuthStateChanged
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user; // store for later use
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().role !== "teacher") {
      alert("Access denied. Only teachers allowed.");
      await signOut(auth);
      window.location.href = 'login.html';
    } else {
      loadAppointments();
      loadAvailableSlots();
      const teacherNameElement = document.getElementById('teacherName');
      if (teacherNameElement) teacherNameElement.textContent = docSnap.data().name || "No Name";

      const teacherEmailElement = document.getElementById('teacherEmail');
      if (teacherEmailElement) teacherEmailElement.textContent = docSnap.data().email || "No Email";
    }
  } else {
    window.location.href = 'login.html';
  }
});
});
