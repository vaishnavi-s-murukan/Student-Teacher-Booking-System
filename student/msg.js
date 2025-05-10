// /student/message.js
import { db } from "../js/firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("overlay");
  const messagePopup = document.getElementById("messagePopup");
  const closeMessageBtn = document.getElementById("closeMessageBtn");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  let selectedTeacherEmail = null;

  document.getElementById("teacherResults").addEventListener("click", (e) => {
    if (e.target.classList.contains("send-msg")) {
      selectedTeacherEmail = e.target.dataset.teacher;
      messagePopup.classList.add("active");
      overlay.classList.add("active");
    }
  });

  const closePopup = () => {
    messagePopup.classList.remove("active");
    overlay.classList.remove("active");
  };

  closeMessageBtn.addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);

  sendMessageBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const name = document.getElementById("msgSenderName").value.trim();
    const email = document.getElementById("msgSenderEmail").value.trim();
    const content = document.getElementById("msgContent").value.trim();

    if (!name || !email || !content || !selectedTeacherEmail) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        senderName: name,
        senderEmail: email,
        message: content,
        teacherEmail: selectedTeacherEmail,
        timestamp: serverTimestamp(),
      });

      alert("Message sent!");
      document.getElementById("messageForm").reset();
      closePopup();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message.");
    }
  });
});
