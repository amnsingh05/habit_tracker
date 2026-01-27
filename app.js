/* =========================
   FIREBASE
========================= */
const auth = firebase.auth();

/* =========================
   GLOBAL STATE
========================= */
const DAYS = 30;
let habits = [];
let table, habitInput, modalOverlay;

/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", () => {
  table = document.getElementById("habitTable");
  habitInput = document.getElementById("habitInput");
  modalOverlay = document.getElementById("modalOverlay");

  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "app.html";
      return;
    }

    loadHabits();
    render();
  });
});

/* =========================
   LOAD DATA
========================= */
function loadHabits() {
  habits =
    JSON.parse(localStorage.getItem("monthlyHabits")) || [
      { name: "Wake up at 06:00", days: Array(DAYS).fill(0) },
      { name: "Gym", days: Array(DAYS).fill(0) }
    ];
}

/* =========================
   HELPERS
========================= */
function percentToStars(p) {
  if (p === 100) return "⭐⭐⭐⭐⭐";
  if (p >= 80) return "⭐⭐⭐⭐☆";
  if (p >= 60) return "⭐⭐⭐☆☆";
  if (p >= 40) return "⭐⭐☆☆☆";
  if (p >= 20) return "⭐☆☆☆☆";
  return "☆☆☆☆☆";
}

function calculateStreak(days) {
  let s = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) s++;
    else break;
  }
  return s;
}

/* =========================
   RENDER
========================= */
function render() {
  table.innerHTML = "";

  habits.forEach((habit, index) => {
    const completed = habit.days.reduce((a, b) => a + b, 0);
    const percent = Math.round((completed / DAYS) * 100);
    const streak = calculateStreak(habit.days);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <strong>${habit.name}</strong><br>
        <span style="cursor:pointer" onclick="renameHabit(${index})">✏️</span>
        <span style="cursor:pointer;color:red;margin-left:6px" onclick="deleteHabit(${index})">🗑️</span>
      </td>
      <td>${percentToStars(percent)}</td>
      <td>
        <span class="${streak >= 7 ? "streak-gold" : "streak"}">
          🔥 ${streak}
        </span>
      </td>
    `;

    habit.days.forEach((day, d) => {
      const td = document.createElement("td");
      td.innerHTML = `
        <input type="checkbox"
          ${day ? "checked" : ""}
          onchange="toggleHabit(${index}, ${d})">
      `;
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
}

/* =========================
   ACTIONS
========================= */
function toggleHabit(h, d) {
  habits[h].days[d] ^= 1;
  render();
}

function confirmAddHabit() {
  const name = habitInput.value.trim();
  if (!name) {
    alert("Please enter a habit name");
    return;
  }

  habits.push({ name, days: Array(DAYS).fill(0) });
  closeModal();
  render();
}

function deleteHabit(i) {
  if (!confirm("Delete habit?")) return;
  habits.splice(i, 1);
  render();
}

function renameHabit(i) {
  const n = prompt("Rename habit:", habits[i].name);
  if (n) {
    habits[i].name = n;
    render();
  }
}

/* =========================
   MODAL
========================= */
function openModal() {
  modalOverlay.classList.remove("hidden");
  habitInput.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  habitInput.value = "";
}

/* =========================
   MONTH RESET (FIXED)
========================= */
function startNewMonth() {
  if (!confirm("Start a new month?")) return;

  habits = habits.map(h => ({
    name: h.name,
    days: Array(DAYS).fill(0)
  }));

  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
  render();
}

/* =========================
   LOGOUT (FIXED)
========================= */
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

/* =========================
   NAVIGATION
========================= */
function openHistory() {
  window.location.href = "history.html";
}

/* =========================
   EXPOSE FOR HTML onclick
========================= */
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmAddHabit = confirmAddHabit;
window.startNewMonth = startNewMonth;
window.logout = logout;
window.openHistory = openHistory;
window.toggleHabit = toggleHabit;
window.renameHabit = renameHabit;
window.deleteHabit = deleteHabit;