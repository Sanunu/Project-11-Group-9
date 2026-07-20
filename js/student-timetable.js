/* ============================================================
   student-timetable.js  —  Weekly timetable view
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("student");
  if (!session) return;

  await CMCSData.init();
  startClock();

  document.getElementById("navLogout").addEventListener("click", (e) => {
    e.preventDefault();
    Auth.logout();
  });

  const timetable = (await Storage.getItem("timetable")) || {};
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dowShort = ["MON", "TUE", "WED", "THU", "FRI"];

  /* -------- Build the current week's Mon–Fri dates -------- */
  const today = new Date();
  const monday = new Date(today);
  const offset = (today.getDay() + 6) % 7; // days since Monday
  monday.setDate(today.getDate() - offset);

  const weekDates = dayNames.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  // default selection: today if it's a weekday, else Monday
  let selected = offset < 5 ? offset : 0;

  renderDayStrip();
  renderTimeline();

  /* ============================================================ */
  function renderDayStrip() {
    const strip = document.getElementById("dayStrip");
    strip.innerHTML = dayNames
      .map((day, i) => {
        const hasClass = (timetable[day] || []).length > 0;
        return `
        <div class="day-chip ${i === selected ? "active" : ""}" data-idx="${i}">
          <div class="dc-dow">${dowShort[i]}</div>
          <div class="dc-num">${weekDates[i].getDate()}</div>
          ${hasClass ? `<div class="dc-dot"></div>` : ""}
        </div>`;
      })
      .join("");

    strip.querySelectorAll("[data-idx]").forEach((el) => {
      el.addEventListener("click", () => {
        selected = parseInt(el.dataset.idx, 10);
        renderDayStrip();
        renderTimeline();
      });
    });
  }

  function renderTimeline() {
    const day = dayNames[selected];
    const classes = timetable[day] || [];
    const hours = [];
    for (let h = 8; h <= 18; h++) hours.push(h);

    let html = "";
    hours.forEach((h) => {
      const label = String(h).padStart(2, "0") + ":00";
      const cls = classes.find((c) => parseInt(c.start.split(":")[0], 10) === h);
      html += `
        <div class="tl-row">
          <div class="tl-time">${label}</div>
          <div class="tl-slot">${cls ? classCard(cls) : `<div class="tl-free">Free Period</div>`}</div>
        </div>`;
    });

    const timeline = document.getElementById("timeline");
    timeline.innerHTML = html;
    Icons.render(timeline);

    const remaining = classes.filter(
      (c) => parseInt(c.start.split(":")[0], 10) >= today.getHours()
    ).length;
    document.getElementById("dpSub").textContent =
      classes.length === 0
        ? "No classes scheduled for this day."
        : `You have ${classes.length} class${classes.length === 1 ? "" : "es"} today. ${remaining} session${remaining === 1 ? "" : "s"} remaining.`;
  }

  function classCard(c) {
    const isLab = c.type === "LAB";
    return `
    <div class="class-card ${isLab ? "lab" : ""}">
      <div class="cc-top">
        <span class="cc-code">${UI.esc(c.code)} • ${UI.esc(c.type)}</span>
        <span class="cc-time">${UI.esc(c.start)} - ${UI.esc(c.end)}</span>
      </div>
      <div class="cc-title">${UI.esc(c.title)}</div>
      <div class="cc-foot">
        <span class="avatar">${UI.initials(c.lecturer)}</span>
        <span>${UI.esc(c.lecturer)}</span>
        <span class="cc-room">${Icons.get("map-pin")} ${UI.esc(c.room)}</span>
      </div>
    </div>`;
  }

  function startClock() {
    const el = document.getElementById("clock");
    const tick = () => {
      const n = new Date();
      el.textContent = `${n.getHours() % 12 || 12}:${String(n.getMinutes()).padStart(2, "0")}`;
    };
    tick();
    setInterval(tick, 10000);
  }
})();
