/* ============================================================
   lecturer.js  —  Lecturer Hub (mobile)
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("lecturer");
  if (!session) return;

  await CMCSData.init();
  startClock();

  /* -------- Header / greeting -------- */
  document.getElementById("hdrAvatar").textContent =
    session.avatar || UI.initials(session.name);
  document.getElementById("greetName").textContent = `Hello, ${session.name}`;

  /* -------- Schedules for this lecturer -------- */
  const schedules = (await Storage.getItem("schedules")) || [];
  const mine = schedules.filter(
    (s) => s.lecturer === session.name || s.lecturer === "Eng. Lukeman"
  );
  const remaining = mine.filter((s) => s.status !== "completed").length;
  document.getElementById("greetSub").textContent =
    `You have ${remaining} class${remaining === 1 ? "" : "es"} left for today.`;
  document.getElementById("todayCount").textContent = String(mine.length).padStart(2, "0");

  const statusBadge = { completed: "badge-gray", ongoing: "badge-green", upcoming: "badge-blue" };
  document.getElementById("schedList").innerHTML = mine
    .map(
      (s) => `
    <div class="sched-item">
      <div class="time-col">${s.start}<div class="end">${s.end}</div></div>
      <div class="info">
        <div class="title-line">
          <span class="s-title">${UI.esc(s.code)}: ${UI.esc(s.title)}</span>
          <span class="badge ${statusBadge[s.status] || "badge-gray"}">${s.status}</span>
        </div>
        <div class="meta">${Icons.get("map-pin")} ${UI.esc(s.room)} &nbsp; ${Icons.get("users")} ${s.students} Students</div>
      </div>
    </div>`
    )
    .join("");

  /* -------- Broadcasts (this lecturer's) -------- */
  const announcements = (await Storage.getItem("announcements")) || [];
  const mineBroadcasts = announcements.filter(
    (a) => a.author === session.name || a.author === "Eng. Lukeman"
  );
  renderBroadcasts(mineBroadcasts);

  /* -------- Quick actions -------- */
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      handleAction(el.dataset.action);
    });
  });

  document.getElementById("navLogout").addEventListener("click", (e) => {
    e.preventDefault();
    Auth.logout();
  });

  document.getElementById("manageAll").addEventListener("click", (e) => {
    e.preventDefault();
    UI.toast("Opening broadcast manager…");
  });

  /* ============================================================
     Actions — open the dedicated sub-pages
     ============================================================ */
  function handleAction(action) {
    if (action === "attendance") {
      window.location.href = "lecturer-attendance.html";
    } else if (action === "schedule") {
      window.location.href = "lecturer-schedule.html";
    } else if (action === "announce") {
      window.location.href = "lecturer-broadcast.html";
    }
  }

  function renderBroadcasts(list) {
    const container = document.getElementById("broadcastList");
    if (list.length === 0) {
      container.innerHTML = `<p class="muted" style="font-size:13px">No broadcasts yet.</p>`;
      return;
    }
    container.innerHTML = list
      .slice(0, 5)
      .map(
        (b) => `
      <div class="broadcast">
        <div class="bc-ic">${b.type === "schedule" ? Icons.get("users") : Icons.get("megaphone")}</div>
        <div style="flex:1">
          <div class="bc-head">
            <span class="bc-title">${UI.esc(b.title)}</span>
            <span class="bc-time">${UI.esc(b.time)}</span>
          </div>
          <div class="bc-msg">${UI.esc(b.message)}</div>
        </div>
      </div>`
      )
      .join("");
  }

  function startClock() {
    const el = document.getElementById("clock");
    function tick() {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "" : "";
      h = h % 12 || 12;
      el.textContent = `${h}:${m}`;
    }
    tick();
    setInterval(tick, 10000);
  }
})();
