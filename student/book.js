import { auth, db } from '../js/firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
  }
});

const dateInput = document.getElementById("appointmentDate");
const slotSelect = document.getElementById("slotSelect");
const form = document.getElementById("bookingForm");

dateInput.addEventListener("change", async () => {
  const selectedDate = dateInput.value;
  slotSelect.innerHTML = `<option value="">Loading...</option>`;

  // 1. Get all availableSlots for this date
  const q = query(collection(db, "availableSlots"), where("date", "==", selectedDate));
  const querySnapshot = await getDocs(q);

  // 2. Get booked appointments for this date
  const bookedSnap = await getDocs(
    query(collection(db, "appointments"), where("appointmentTime", ">=", `${selectedDate} 00:00`), where("appointmentTime", "<=", `${selectedDate} 23:59`))
  );
  const bookedTimes = bookedSnap.docs.map(doc => doc.data().appointmentTime);

  slotSelect.innerHTML = "";

  if (querySnapshot.empty) {
    slotSelect.innerHTML = `<option value="">No slots available for this date</option>`;
    return;
  }

  // 3. Generate slot options, excluding booked
  querySnapshot.forEach((docSnap) => {
    const slot = docSnap.data();
    const slotId = docSnap.id;
    const from = slot.timeFrom;
    const to = slot.timeTo;

    const slots = generateTimeSlots(from, to);
    slots.forEach((timeRange) => {
      const fullTime = `${selectedDate} ${timeRange}`;
      if (!bookedTimes.includes(fullTime)) {
        const option = document.createElement("option");
        option.value = JSON.stringify({
          id: slotId,
          teacherId: slot.teacherId,
          time: timeRange,
          date: selectedDate,
        });
        option.textContent = timeRange;
        slotSelect.appendChild(option);
      }
    });
  });

  // 4. Handle case when all are booked
  if (slotSelect.options.length === 0) {
    slotSelect.innerHTML = `<option value="">All slots are already booked</option>`;
  }
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("studentName").value;
  const email = document.getElementById("studentEmail").value;
  const message = document.getElementById("message").value;
  const selectedSlot = JSON.parse(slotSelect.value);

  if (!selectedSlot) return alert("Please select a valid slot");

  try {
    await addDoc(collection(db, "appointments"), {
      studentId: currentUser.uid,
      teacherId: selectedSlot.teacherId,
      studentName: name,
      studentEmail: email,
      message: message,
      appointmentTime: `${selectedSlot.date} ${selectedSlot.time}`,
      status: "pending",
      createdAt: new Date(),
    });

    alert("Appointment booked!");
    form.reset();
    slotSelect.innerHTML = `<option value="">-- Choose a slot --</option>`;
  } catch (err) {
    console.error("Error booking:", err);
    alert("Booking failed");
  }
});


function generateTimeSlots(start, end) {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);

  const slots = [];
  let current = new Date(0, 0, 0, startHour, startMin);
  const endTime = new Date(0, 0, 0, endHour, endMin);

  while (current < endTime) {
    const fromTime = current.toTimeString().slice(0, 5);
    current.setMinutes(current.getMinutes() + 30);
    const toTime = current.toTimeString().slice(0, 5);
    if (current <= endTime) {
      slots.push(`${fromTime} - ${toTime}`);
    }
  }

  return slots;
}

