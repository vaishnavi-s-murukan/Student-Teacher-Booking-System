import { db } from '../js/firebase-config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const notifBell = document.getElementById("notifBell");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");

notifBell.addEventListener("click", () => {
  notifDropdown.style.display = notifDropdown.style.display === "block" ? "none" : "block";
});

const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.email),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);

    notifList.innerHTML = "";
    let unreadCount = 0;

    snapshot.forEach(doc => {
      if (!doc.data().read) {
        unreadCount++;
      }
    });

    if (snapshot.empty) {
      notifList.innerHTML = "<li>No notifications</li>";
    } else {
      snapshot.forEach(doc => {
        const data = doc.data();
        const notifItem = document.createElement("li");
        notifItem.textContent = data.message;
        notifItem.style.cursor = "pointer";

        // Mark notification as read on click
        notifItem.addEventListener("click", async () => {
          const notifRef = doc.ref;
          await updateDoc(notifRef, { read: true });
          notifItem.style.fontWeight = "normal"; // Optional: visually mark as read
          updateUnreadCount();
        });

        notifList.appendChild(notifItem);
      });
    }

    updateUnreadCount();

        function updateUnreadCount() {
      const notifBadge = document.getElementById("notifBadge");
      if (unreadCount > 0) {
        notifBadge.textContent = unreadCount;
        notifBadge.style.display = "block"; // Show the badge
      } else {
        notifBadge.style.display = "none"; // Hide the badge
      }
    }
  }
});
