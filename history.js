const container = document.getElementById("historyContainer");

let archive = JSON.parse(localStorage.getItem("habitArchive")) || [];

/* =========================
   CALCULATE MONTH STATS
========================= */
function calculateMonthStats(habits) {
  let totalTasks = 0;
  let completedTasks = 0;
  let bestStreak = 0;

  habits.forEach(habit => {
    totalTasks += habit.days.length;

    let currentStreak = 0;
    habit.days.forEach(day => {
      if (day === 1) {
        completedTasks++;
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
  });

  return { totalTasks, completedTasks, bestStreak };
}

/* =========================
   DAILY TREND (% PER DAY)
========================= */
function calculateDailyTrend(habits) {
  const days = habits[0].days.length;
  let trend = [];

  for (let d = 0; d < days; d++) {
    let completed = 0;

    habits.forEach(habit => {
      if (habit.days[d]) completed++;
    });

    let percent =
      habits.length === 0
        ? 0
        : Math.round((completed / habits.length) * 100);

    trend.push(percent);
  }

  return trend;
}

/* =========================
   RENDER HISTORY
========================= */
function renderHistory() {
  if (archive.length === 0) {
    container.innerHTML = "<p>No previous months found.</p>";
    return;
  }

  // Show latest month first
  archive = archive.slice().reverse();

  archive.forEach(month => {
    const { totalTasks, completedTasks, bestStreak } =
      calculateMonthStats(month.habits);

    const dailyTrend = calculateDailyTrend(month.habits);

    /* ---------- TREND BARS ---------- */
    const trendBars = dailyTrend
      .map(p => {
        let cls = "low";
        if (p >= 80) cls = "high";
        else if (p >= 40) cls = "mid";

        return `
          <div 
            class="trend-bar ${cls}" 
            style="height:${p}%" 
            title="${p}%"
          ></div>`;
      })
      .join("");

    /* ---------- DAY LABELS ---------- */
    const dayLabels = dailyTrend
      .map((_, i) => `<span>D${i + 1}</span>`)
      .join("");

    /* ---------- HTML ---------- */
    const html = `
      <div class="history-card">
        <h2>📅 Month ended: ${month.date}</h2>

        <div class="history-stats">
          <div class="history-stat">
            📈 Monthly Trend
            <div class="trend-wrapper">
              <div class="trend-graph">
                ${trendBars}
              </div>
              <div class="trend-labels">
                ${dayLabels}
              </div>
            </div>
          </div>

          <div class="history-stat">
            ✅ Tasks
            <span>${completedTasks} / ${totalTasks}</span>
          </div>

          <div class="history-stat">
            🏆 Best Streak
            <span>${bestStreak}</span>
          </div>
        </div>

        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Habit</th>
                ${month.habits[0].days
                  .map((_, i) => `<th>D${i + 1}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${month.habits
                .map(
                  habit => `
                  <tr>
                    <td>${habit.name}</td>
                    ${habit.days
                      .map(d => `<td>${d ? "✔️" : ""}</td>`)
                      .join("")}
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML += html;
  });
}

/* =========================
   NAVIGATION
========================= */
function goBack() {
  window.location.href = "index.html";
}

/* =========================
   INIT
========================= */
renderHistory();
