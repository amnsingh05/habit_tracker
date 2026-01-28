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
let viewingHistory = false;

/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", () => {
  table = document.getElementById("habitTable");
  habitInput = document.getElementById("habitInput");
  modalOverlay = document.getElementById("modalOverlay");

  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    migrateOldDataIfNeeded(); // ✅ IMPORTANT
    loadCurrentMonth();
    render();
  });
});

/* =========================
   DATA MIGRATION (CRITICAL)
========================= */
function migrateOldDataIfNeeded() {
  // Old versions
  const oldMonthly = localStorage.getItem("monthlyHabits");
  const oldArchive = localStorage.getItem("habitArchive");

  // New keys
  const current = localStorage.getItem("habits-current");

  // Migrate current month
  if (!current && oldMonthly) {
    localStorage.setItem("habits-current", oldMonthly);
    console.log("✅ Migrated old monthlyHabits → habits-current");
  }

  // Ensure archive exists
  if (!localStorage.getItem("habitArchive")) {
    localStorage.setItem("habitArchive", JSON.stringify([]));
  }
}

/* =========================
   LOAD / SAVE CURRENT MONTH
========================= */
function loadCurrentMonth() {
  const data = localStorage.getItem("habits-current");
  habits = data
    ? JSON.parse(data)
    : [
        { name: "Wake up at 06:00", days: Array(DAYS).fill(0) },
        { name: "Gym", days: Array(DAYS).fill(0) }
      ];
}

function saveCurrentMonth() {
  if (!viewingHistory) {
    localStorage.setItem("habits-current", JSON.stringify(habits));
  }
}

/* =========================
   STREAK (DATA-BASED)
========================= */
function calculateStreak(days) {
  let streak = 0;

  // find last completed day
  let i = days.length - 1;
  while (i >= 0 && days[i] === 0) i--;

  for (; i >= 0; i--) {
    if (days[i] === 1) streak++;
    else break;
  }

  return streak;
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

/* =========================
   DAILY PROGRESS
========================= */
function getDayProgressPercent(d) {
  if (!habits.length) return 0;
  const completed = habits.filter(h => h.days[d]).length;
  return Math.round((completed / habits.length) * 100);
}

function renderDailyProgressRow() {
  const row = document.createElement("tr");
  row.innerHTML = `<td><strong>Daily Progress</strong></td><td></td><td></td>`;

  for (let d = 0; d < DAYS; d++) {
    const p = getDayProgressPercent(d);
    const td = document.createElement("td");
    td.innerHTML = `
      <div class="day-progress">
        <div class="day-progress-fill" style="width:${p}%"></div>
      </div>
      <div class="day-progress-text">${p}%</div>
    `;
    row.appendChild(td);
  }
  table.appendChild(row);
}

/* =========================
   RENDER
========================= */
function render() {
  table.innerHTML = "";

  habits.forEach((habit, i) => {
    const completed = habit.days.reduce((a, b) => a + b, 0);
    const percent = Math.round((completed / DAYS) * 100);
    const streak = calculateStreak(habit.days);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <strong>${habit.name}</strong><br>
        ${!viewingHistory ? `
          <span onclick="renameHabit(${i})">✏️</span>
          <span onclick="deleteHabit(${i})" style="color:red">🗑️</span>` : ""}
      </td>
      <td>${percentToStars(percent)}</td>
      <td><span class="${streak >= 7 ? "streak-gold" : "streak"}">🔥 ${streak}</span></td>
    `;

    habit.days.forEach((day, d) => {
      const td = document.createElement("td");
      td.innerHTML = `
        <input type="checkbox"
          ${day ? "checked" : ""}
          ${viewingHistory ? "disabled" : ""}
          onchange="toggleHabit(${i}, ${d})">
      `;
      row.appendChild(td);
    });

    table.appendChild(row);
  });

  renderDailyProgressRow();
  saveCurrentMonth();
}

/* =========================
   ACTIONS
========================= */
function toggleHabit(i, d) {
  if (viewingHistory) return;
  habits[i].days[d] ^= 1;
  render();
}

function confirmAddHabit() {
  const name = habitInput.value.trim();
  if (!name) return alert("Enter habit name");
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
   MONTH CONTROLS + HISTORY
========================= */
function startNewMonth() {
  if (!confirm("Archive current month and start new one?")) return;

  const archive =
    JSON.parse(localStorage.getItem("habitArchive")) || [];

  archive.push({
    date: new Date().toLocaleString("default", {
      month: "long",
      year: "numeric"
    }),
    habits: JSON.parse(JSON.stringify(habits))
  });

  localStorage.setItem("habitArchive", JSON.stringify(archive));

  habits = habits.map(h => ({
    name: h.name,
    days: Array(DAYS).fill(0)
  }));

  viewingHistory = false;
  render();
}

function openHistory() {
  window.location.href = "history.html";
}

/* =========================
   MODAL / LOGOUT
========================= */
function openModal() {
  modalOverlay.classList.remove("hidden");
  habitInput.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  habitInput.value = "";
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

/* =========================
   EXPOSE
========================= */
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmAddHabit = confirmAddHabit;
window.logout = logout;
window.toggleHabit = toggleHabit;
window.renameHabit = renameHabit;
window.deleteHabit = deleteHabit;
window.startNewMonth = startNewMonth;
window.openHistory = openHistory;
