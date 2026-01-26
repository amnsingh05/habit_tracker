const DAYS = 30;

/* =========================
   HELPERS
========================= */
function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/* =========================
   LOAD CURRENT MONTH
========================= */
let habits = JSON.parse(localStorage.getItem("monthlyHabits")) || [
  { name: "Wake up at 06:00", days: Array(DAYS).fill(0) },
  { name: "Gym", days: Array(DAYS).fill(0) }
];

const table = document.getElementById("habitTable");

/* =========================
   STREAK CALCULATION
========================= */
function calculateStreak(days) {
  let streak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] === 1) streak++;
    else if (streak > 0) break;
  }

  return streak;
}

/* =========================
   RENDER TABLE
========================= */
function render() {
  table.innerHTML = "";

  habits.forEach((habit, index) => {
    const streak = calculateStreak(habit.days);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        ${habit.name}
        <span class="${streak >= 7 ? "streak-gold" : "streak"}">
          ${streak >= 7 ? "🏆" : "🔥"} ${streak}
        </span>
        <span onclick="renameHabit(${index})" style="cursor:pointer;margin-left:8px;">✏️</span>
        <span onclick="deleteHabit(${index})" style="cursor:pointer;margin-left:6px;color:red;">🗑️</span>
      </td>
    `;

    habit.days.forEach((day, dIndex) => {
      const cell = document.createElement("td");
      cell.innerHTML = `
        <input type="checkbox"
          ${day ? "checked" : ""}
          onchange="toggleHabit(${index}, ${dIndex})">
      `;
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  renderDailyProgress();
  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
}

/* =========================
   DAILY PROGRESS ROW
========================= */
function renderDailyProgress() {
  const todayIndex = new Date().getDate() - 1;
  const row = document.createElement("tr");
  row.style.fontWeight = "bold";

  row.innerHTML = `<td>Daily Progress</td>`;

  for (let day = 0; day < DAYS; day++) {
    let completed = 0;

    habits.forEach(habit => {
      if (habit.days[day]) completed++;
    });

    const percent =
      habits.length === 0 ? 0 : Math.round((completed / habits.length) * 100);

    let cls = "progress-0";
    if (percent >= 100) cls = "progress-full";
    else if (percent >= 50) cls = "progress-mid";

    const cell = document.createElement("td");
    cell.className = `${cls} ${day === todayIndex ? "today" : ""}`;
    cell.textContent = `${percent}%`;

    row.appendChild(cell);
  }

  table.appendChild(row);
}

/* =========================
   ACTIONS
========================= */
function toggleHabit(habitIndex, dayIndex) {
  habits[habitIndex].days[dayIndex] ^= 1;
  render();
}

/* ---------- MODAL ---------- */
function openModal() {
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("habitInput").focus();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("habitInput").value = "";
}

function confirmAddHabit() {
  const name = document.getElementById("habitInput").value.trim();
  if (!name) return;

  habits.push({ name, days: Array(DAYS).fill(0) });
  closeModal();
  render();
}

/* ---------- DELETE ---------- */
function deleteHabit(index) {
  if (!confirm("Delete this habit?")) return;

  const row = table.children[index];
  row.classList.add("fade-out");

  setTimeout(() => {
    habits.splice(index, 1);
    render();
  }, 300);
}

function renameHabit(index) {
  const newName = prompt("Rename habit:", habits[index].name);
  if (!newName) return;

  habits[index].name = newName;
  render();
}

/* =========================
   START NEW MONTH (LONG-TERM)
========================= */
function startNewMonth() {
  if (!confirm("Start a new month? Current progress will be archived.")) return;

  const monthKey = getMonthKey();
  let habitData = JSON.parse(localStorage.getItem("habitData")) || {};

  habitData[monthKey] = {
    date: new Date().toLocaleDateString(),
    habits: JSON.parse(JSON.stringify(habits))
  };

  localStorage.setItem("habitData", JSON.stringify(habitData));

  habits = habits.map(h => ({
    name: h.name,
    days: Array(DAYS).fill(0)
  }));

  localStorage.setItem("monthlyHabits", JSON.stringify(habits));
  render();
}

/* =========================
   NAVIGATION
========================= */
function openHistory() {
  window.location.href = "history.html";
}

/* =========================
   INITIAL RENDER
========================= */
render();
