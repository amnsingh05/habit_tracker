/* =========================
   AUTH + AUTO LOGIN
   Firebase remembers user automatically
========================= */
let CURRENT_USER = null;

auth.onAuthStateChanged(user => {
  if (!user) {
    // Not logged in → go to login
    window.location.replace("login.html");
    return;
  }

  // Logged in → allow app
  CURRENT_USER = user;
  initApp();
});

/* =========================
   CONSTANTS
========================= */
const DAYS = 30;

/* =========================
   HELPERS
========================= */
function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/* =========================
   STAR SYSTEM ⭐
========================= */
function percentToStars(percent) {
  if (percent === 100) return "⭐⭐⭐⭐⭐";
  if (percent >= 80) return "⭐⭐⭐⭐☆";
  if (percent >= 60) return "⭐⭐⭐☆☆";
  if (percent >= 40) return "⭐⭐☆☆☆";
  if (percent >= 20) return "⭐☆☆☆☆";
  return "☆☆☆☆☆";
}

function getMonthlySuccess(days) {
  const completed = days.reduce((sum, d) => sum + d, 0);
  return Math.round((completed / DAYS) * 100);
}

function getDailySuccess(days) {
  const today = new Date().getDate() - 1;
  return days[today] === 1 ? 100 : 0;
}

/* =========================
   DATA (LOCAL FOR NOW)
========================= */
let habits =
  JSON.parse(localStorage.getItem("monthlyHabits")) || [
    { name: "Wake up at 06:00", days: Array(DAYS).fill(0) },
    { name: "Gym", days: Array(DAYS).fill(0) }
  ];

const table = document.getElementById("habitTable");
const habitInput = document.getElementById("habitInput");

/* =========================
   STREAK
========================= */
function calculateStreak(days) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) streak++;
    else break;
  }
  return streak;
}

/* =========================
   RENDER
========================= */
function render() {
  table.innerHTML = "";

  habits.forEach((habit, index) => {
    const monthlyPercent = getMonthlySuccess(habit.days);
    const dailyPercent = getDailySuccess(habit.days);
    const streak = calculateStreak(habit.days);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <strong>${habit.name}</strong><br>
        <span onclick="renameHabit(${index})" style="cursor:pointer;">✏️</span>
        <span onclick="deleteHabit(${index})" style="cursor:pointer;color:red;margin-left:6px;">🗑️</span>
      </td>

      <td style="font-size:12px;line-height:1.5;">
        <div>📅 ${percentToStars(monthlyPercent)}</div>
        <div style="color:#64748b;">☀️ ${percentToStars(dailyPercent)}</div>
      </td>

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

  renderDailyProgress();
  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
}

/* =========================
   DAILY PROGRESS
========================= */
function renderDailyProgress() {
  const today = new Date().getDate() - 1;
  const row = document.createElement("tr");
  row.style.fontWeight = "bold";
  row.innerHTML = `<td colspan="3">Daily Progress</td>`;

  for (let d = 0; d < DAYS; d++) {
    const completed = habits.filter(h => h.days[d]).length;
    const percent = habits.length
      ? Math.round((completed / habits.length) * 100)
      : 0;

    const cell = document.createElement("td");
    cell.className =
      percent === 100 ? "progress-full" :
      percent >= 50 ? "progress-mid" :
      "progress-0";

    if (d === today) cell.classList.add("today");
    cell.textContent = `${percent}%`;

    row.appendChild(cell);
  }

  table.appendChild(row);
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
  if (!name) return;

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
  document.getElementById("modalOverlay").classList.remove("hidden");
  habitInput.focus();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  habitInput.value = "";
}

/* =========================
   MONTH ARCHIVE
========================= */
function startNewMonth() {
  if (!confirm("Start a new month?")) return;

  const key = getMonthKey();
  const store = JSON.parse(localStorage.getItem("habitData")) || {};

  store[key] = {
    date: new Date().toLocaleDateString(),
    habits: JSON.parse(JSON.stringify(habits))
  };

  localStorage.setItem("habitData", JSON.stringify(store));

  habits = habits.map(h => ({
    name: h.name,
    days: Array(DAYS).fill(0)
  }));

  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
  render();
}

/* =========================
   LOGOUT
========================= */
function logout() {
  auth.signOut().then(() => {
    window.location.replace("login.html");
  });
}

/* =========================
   NAVIGATION
========================= */
function openHistory() {
  window.location.href = "history.html";
}

/* =========================
   INIT (after auth)
========================= */
function initApp() {
  render();
}