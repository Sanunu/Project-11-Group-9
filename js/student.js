/* ============================================================
   student.js  —  Student dashboard (mobile)
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("student");
  if (!session) return;

  await CMCSData.init();
  startClock();

  /* -------- Header -------- */
  const firstName = session.name.split(" ")[0];
  document.getElementById("hiName").textContent = `Hi, ${firstName}`;
  document.getElementById("hdrAvatar").textContent =
    session.avatar || UI.initials(session.name);

  /* -------- Attendance ring (85–95% demo) -------- */
  const attendance = 87;
  animateRing(attendance);

  /* -------- Next class highlight -------- */
  const schedules = (await Storage.getItem("schedules")) || [];
  const next =
    schedules.find((s) => s.status === "upcoming") || schedules[schedules.length - 1];
  const lecturer = next ? next.lecturer : "TBA";
  document.getElementById("highlightCard").innerHTML = `
    <div class="hl-tags">
      <span class="badge badge-blue">Next Class</span>
      <span class="starts">${Icons.get("timer")} Starts in 12m</span>
    </div>
    <h3>${UI.esc(next ? next.code + ": " + next.title : "No upcoming class")}</h3>
    <div class="hl-loc">${Icons.get("map-pin")} ${UI.esc(next ? next.room : "—")}</div>
    <div class="hl-prof">
      <div class="avatar">${UI.initials(lecturer)}</div>
      <div>
        <div class="p-name">${UI.esc(lecturer)}</div>
        <div class="p-dept">Department of ${UI.esc(session.department)}</div>
      </div>
      <div class="p-time">${next ? next.start + " - " + next.end : "—"}</div>
    </div>`;

  /* -------- Announcements for students -------- */
  const announcements = (await Storage.getItem("announcements")) || [];
  const forStudents = announcements.filter((a) => a.audience === "students");
  document.getElementById("alertCount").textContent = String(
    Math.min(forStudents.length, 99)
  ).padStart(2, "0");

  document.getElementById("announceList").innerHTML = forStudents
    .slice(0, 4)
    .map(
      (a) => `
    <div class="broadcast">
      <div class="bc-ic">${a.type === "schedule" ? Icons.get("calendar") : Icons.get("check-circle")}</div>
      <div style="flex:1">
        <div class="bc-head">
          <span class="bc-title">${UI.esc(a.title)}</span>
        </div>
        <div style="font-size:12px;color:var(--text-soft);margin-top:2px;text-transform:capitalize;">
          ${UI.esc(a.type)} • ${UI.esc(a.time)}
        </div>
      </div>
      <span style="align-self:center;color:var(--text-soft)">›</span>
    </div>`
    )
    .join("");

  /* -------- Actions -------- */
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      handleAction(el.dataset.action);
    });
  });

  document.getElementById("viewInbox").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "student-notifications.html";
  });

  function handleAction(action) {
    switch (action) {
      case "attendance":
        window.location.href = "student-records.html";
        break;
      case "timetable":
        window.location.href = "student-timetable.html";
        break;
      case "alerts":
        window.location.href = "student-notifications.html";
        break;
      case "logout":
        Auth.logout();
        break;
    }
  }

  /* ============================================================
     Helpers
     ============================================================ */
  function animateRing(percent) {
    const circumference = 2 * Math.PI * 50; // r=50
    const ring = document.getElementById("attRing");
    const text = document.getElementById("attText");
    const target = circumference * (1 - percent / 100);
    let cur = 0;
    const start = performance.now();
    const dur = 1100;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.round(p * percent);
      text.textContent = val + "%";
      ring.style.strokeDashoffset = circumference - (circumference - target) * p;
      if (p < 1) requestAnimationFrame(step);
      else {
        text.textContent = percent + "%";
        ring.style.strokeDashoffset = target;
      }
    }
    ring.style.strokeDasharray = circumference;
    requestAnimationFrame(step);
  }

  function startClock() {
    const el = document.getElementById("clock");
    function tick() {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, "0");
      h = h % 12 || 12;
      el.textContent = `${h}:${m}`;
    }
    tick();
    setInterval(tick, 10000);
  }
})();
