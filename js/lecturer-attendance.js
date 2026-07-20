/* ============================================================
   lecturer-attendance.js  —  Mark class attendance
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("lecturer");
  if (!session) return;

  await CMCSData.init();
  startClock();

  const roster = (await Storage.getItem("roster")) || { students: [] };
  let students = roster.students;
  let searchTerm = "";

  /* -------- Header info -------- */
  document.getElementById("pageTitle").textContent = `${roster.code} Attendance`;
  document.getElementById("courseName").textContent = roster.course;
  document.getElementById("courseRoom").textContent = roster.room;

  const now = new Date();
  document.getElementById("todayDate").textContent = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  document.getElementById("sessionStart").textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  render();

  /* -------- Search -------- */
  document.getElementById("studentSearch").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    render();
  });

  /* -------- Mark all remaining present -------- */
  document.getElementById("markAllBtn").addEventListener("click", async () => {
    students.forEach((s) => {
      if (!s.status) s.status = "present";
    });
    await persist();
    render();
    UI.toast("All remaining students marked present.", "success");
  });

  /* ============================================================ */
  function render() {
    const list = searchTerm
      ? students.filter(
          (s) =>
            s.name.toLowerCase().includes(searchTerm) ||
            String(s.id).toLowerCase().includes(searchTerm)
        )
      : students;

    document.getElementById("rosterLabel").textContent = `Student Roster (${students.length})`;

    const container = document.getElementById("roster");
    container.innerHTML = list
        .map(
          (s) => `
      <div class="student ${s.status}" data-id="${s.id}">
        <div class="avatar">${UI.esc(s.avatar || UI.initials(s.name))}</div>
        <div>
          <div class="s-name">${UI.esc(s.name)}</div>
          <div class="s-id">${UI.esc(String(s.id))}</div>
          ${
            s.status
              ? `<span class="status-mini ${s.status}">${
                  s.status === "present" ? Icons.get("check") : Icons.get("x")
                } ${s.status === "present" ? "Present" : "Absent"}</span>`
              : ""
          }
        </div>
        <div class="pa-btns">
          <button class="pa-btn p ${s.status === "present" ? "active" : ""}" data-mark="present">${Icons.get("check-circle")} P</button>
          <button class="pa-btn a ${s.status === "absent" ? "active" : ""}" data-mark="absent">${Icons.get("x-circle")} A</button>
        </div>
      </div>`
        )
        .join("");

    container.querySelectorAll(".student").forEach((el) => {
      el.querySelectorAll("[data-mark]").forEach((btn) => {
        btn.addEventListener("click", () => mark(el.dataset.id, btn.dataset.mark));
      });
    });

    updateProgress();
  }

  async function mark(id, status) {
    const s = students.find((st) => String(st.id) === String(id));
    if (!s) return;
    s.status = s.status === status ? "" : status; // toggle off if same
    await persist();
    render();
  }

  function updateProgress() {
    const marked = students.filter((s) => s.status).length;
    const total = students.length;
    const left = total - marked;
    const pct = total ? Math.round((marked / total) * 100) : 0;

    document.getElementById("markedCount").textContent = `${marked}/${total}`;
    document.getElementById("progressLabel").textContent = `${marked} of ${total} Marked`;
    document.getElementById("pbarFill").style.width = pct + "%";

    const btn = document.getElementById("markAllBtn");
    if (left === 0) {
      btn.textContent = "All Students Marked ✓";
      btn.disabled = true;
      btn.style.opacity = "0.6";
    } else {
      btn.textContent = `Mark All Students (${left} Left)`;
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }

  async function persist() {
    roster.students = students;
    await Storage.setItem("roster", roster);
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
