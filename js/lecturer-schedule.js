/* ============================================================
   lecturer-schedule.js  —  Set / create a class schedule
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("lecturer");
  if (!session) return;

  await CMCSData.init();
  startClock();

  const courses = [
    "CS-302: Advanced Algorithms",
    "SE-402: Web Programming",
    "CS-101: Cyber Security",
    "DS-101: Intro to Data Structures",
    "MAT-204: Linear Algebra",
  ];
  let courseIdx = 0;
  let selectedSlot = "01:00 PM - 02:30 PM";

  /* -------- Calendar state -------- */
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = new Date(today);

  renderCalendar();

  /* -------- Course cycle -------- */
  document.getElementById("courseRow").addEventListener("click", () => {
    courseIdx = (courseIdx + 1) % courses.length;
    document.getElementById("courseText").textContent = courses[courseIdx];
  });

  /* -------- Dismiss warning -------- */
  document.getElementById("warnClose").addEventListener("click", () => {
    document.getElementById("warnBanner").style.display = "none";
  });

  /* -------- Time slots -------- */
  document.getElementById("slots").addEventListener("click", (e) => {
    const opt = e.target.closest(".slot-opt");
    if (!opt || opt.classList.contains("conflict")) {
      if (opt && opt.classList.contains("conflict"))
        UI.toast("That slot conflicts with another class.", "error");
      return;
    }
    document.querySelectorAll(".slot-opt").forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");
    selectedSlot = opt.dataset.slot;
  });

  /* -------- Recurrence label -------- */
  document.getElementById("recurToggle").addEventListener("change", (e) => {
    document.getElementById("recurSub").textContent = e.target.checked
      ? "Repeat every week for 12 weeks"
      : "One-time class only";
  });

  /* -------- Calendar nav -------- */
  document.getElementById("calPrev").addEventListener("click", () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  /* -------- Save / Confirm -------- */
  document.getElementById("confirmBtn").addEventListener("click", save);
  document.getElementById("saveTop").addEventListener("click", save);

  async function save() {
    const room = document.getElementById("roomNo").value.trim() || "TBA";
    const course = courses[courseIdx];
    const [code, title] = course.split(":").map((s) => s.trim());
    const [start, end] = selectedSlot.split(" - ");
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });

    const schedules = (await Storage.getItem("schedules")) || [];
    schedules.push({
      id: "SCH-" + Date.now(),
      code: code.replace("-", ""),
      title,
      lecturer: session.name,
      room,
      day: dayName,
      start,
      end,
      students: 42,
      status: "upcoming",
      date: selectedDate.toDateString(),
    });
    await Storage.setItem("schedules", schedules);

    UI.toast(`${code} scheduled for ${dayName}, ${selectedSlot}.`, "success");
    setTimeout(() => (window.location.href = "lecturer-dashboard.html"), 900);
  }

  /* ============================================================ */
  function renderCalendar() {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    document.getElementById("calTitle").textContent = `${monthNames[viewMonth]} ${viewYear}`;

    const dows = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    let html = dows.map((d) => `<div class="cal-dow">${d}</div>`).join("");

    const firstDay = new Date(viewYear, viewMonth, 1);
    // convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) html += `<div class="cal-day empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
      const isSel =
        selectedDate.getFullYear() === viewYear &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getDate() === d;
      // demo "event" marker mid-month
      const hasDot = d === 12;
      html += `<div class="cal-day ${isSel ? "selected" : ""} ${hasDot ? "has-dot" : ""}" data-day="${d}">${d}</div>`;
    }

    const grid = document.getElementById("calGrid");
    grid.innerHTML = html;
    grid.querySelectorAll("[data-day]").forEach((el) => {
      el.addEventListener("click", () => {
        selectedDate = new Date(viewYear, viewMonth, parseInt(el.dataset.day, 10));
        renderCalendar();
      });
    });
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
