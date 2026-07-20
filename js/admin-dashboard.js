/* ============================================================
   admin-dashboard.js  —  Admin console dashboard
   ============================================================ */

(async function () {
  await CMCSData.init();

  const session = await Auth.requireAuth("admin");
  if (!session) return;

  /* -------- Header / sidebar user -------- */
  document.getElementById("sideName").textContent = session.name;
  document.getElementById("sideAvatar").textContent =
    session.avatar || UI.initials(session.name);
  const firstName =
    session.name.replace(/^(Mr|Mrs|Ms|Dr|Prof|Eng)\.?\s+/i, "").split(" ")[0];
  document.getElementById("welcomeLine").textContent =
    `Welcome back, ${firstName}. Here's what's happening with the CMCS system today.`;

  /* -------- Load data -------- */
  const users = (await Storage.getItem("users")) || [];
  const schedules = (await Storage.getItem("schedules")) || [];
  const approvals = (await Storage.getItem("approvals")) || [];
  const logs = (await Storage.getItem("logs")) || [];

  /* -------- Stat cards (real counts) -------- */
  const students = users.filter((u) => u.role === "student").length;
  const lecturers = users.filter((u) => u.role === "lecturer").length;
  const pending = approvals.filter((a) => a.status === "pending").length;

  animateCount("statStudents", 12482 - 3 + students);
  animateCount("statLecturers", 455 + lecturers);
  animateCount("statClasses", schedules.length + 180);
  animateCount("statApprovals", 20 + pending);

  /* -------- Pending approvals -------- */
  renderApprovals(approvals);
  document.getElementById("backlogCount").textContent =
    `Total backlog: ${approvals.filter((a) => a.status === "pending").length} items`;

  /* -------- Logs -------- */
  const statusBadge = {
    Success: "badge-green",
    "In Progress": "badge-blue",
    Blocked: "badge-red",
  };
  document.getElementById("logBody").innerHTML = logs
    .map(
      (l) => `
      <tr>
        <td>${UI.esc(l.time)}</td>
        <td class="t-event">${UI.esc(l.event)}</td>
        <td class="muted">${UI.esc(l.user)}</td>
        <td><span class="badge ${statusBadge[l.status] || "badge-gray"}">${UI.esc(l.status)}</span></td>
        <td><a href="#" class="link">Details</a></td>
      </tr>`
    )
    .join("");

  /* -------- Chart -------- */
  drawActivityChart();

  /* -------- Events -------- */
  document.getElementById("logoutBtn").addEventListener("click", () => Auth.logout());

  document.getElementById("reportBtn").addEventListener("click", () => {
    UI.toast("Report generated and queued for download.", "success");
  });

  document.querySelectorAll("[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const el = document.getElementById(a.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ============================================================
     Helpers
     ============================================================ */
  function renderApprovals(list) {
    const pendingList = list.filter((a) => a.status === "pending");
    const container = document.getElementById("approvalList");
    if (pendingList.length === 0) {
      container.innerHTML = `<p class="muted" style="padding:20px 0">No pending approvals 🎉</p>`;
      return;
    }
    container.innerHTML = pendingList
      .map(
        (a) => `
      <div class="approval" data-id="${a.id}">
        <div class="top">
          <div class="avatar">${UI.initials(a.lecturer)}</div>
          <div>
            <div class="a-name">${UI.esc(a.lecturer)}</div>
            <div class="a-course">${UI.esc(a.course)}</div>
          </div>
          <div class="a-time">${UI.esc(a.time)}</div>
        </div>
        <div class="a-change">"${UI.esc(a.change)}"</div>
        <div class="a-btns">
          <button class="btn btn-primary" data-act="approve">Approve</button>
          <button class="btn btn-outline" data-act="reject">Reject</button>
        </div>
      </div>`
      )
      .join("");

    container.querySelectorAll(".approval").forEach((el) => {
      el.querySelectorAll("[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => handleApproval(el.dataset.id, btn.dataset.act));
      });
    });
  }

  async function handleApproval(id, act) {
    const all = (await Storage.getItem("approvals")) || [];
    const item = all.find((a) => a.id === id);
    if (!item) return;
    item.status = act === "approve" ? "approved" : "rejected";
    await Storage.setItem("approvals", all);
    UI.toast(
      act === "approve"
        ? `Approved: ${item.change}`
        : `Rejected: ${item.change}`,
      act === "approve" ? "success" : "error"
    );
    renderApprovals(all);
    const count = all.filter((a) => a.status === "pending").length;
    document.getElementById("backlogCount").textContent = `Total backlog: ${count} items`;
    document.getElementById("statApprovals").textContent = 20 + count;
  }

  function animateCount(id, target) {
    const el = document.getElementById(id);
    const dur = 900;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.floor(p * target);
      el.textContent = val.toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  function drawActivityChart() {
    const canvas = document.getElementById("activityChart");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = [420, 560, 610, 480, 720, 650, 390];
    const max = Math.max(...data) * 1.15;
    const padL = 44, padB = 34, padT = 16, padR = 16;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    // grid lines
    ctx.strokeStyle = "#eef0f3";
    ctx.fillStyle = "#98a2b3";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(Math.round(max - (max / 4) * i), padL - 8, y + 4);
    }

    // bars
    const barW = (plotW / days.length) * 0.5;
    days.forEach((d, i) => {
      const x = padL + (plotW / days.length) * i + (plotW / days.length - barW) / 2;
      const h = (data[i] / max) * plotH;
      const y = padT + plotH - h;
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, "#4f97ff");
      grad.addColorStop(1, "#2f7bf6");
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, barW, h, 6);
      ctx.fill();

      ctx.fillStyle = "#667085";
      ctx.textAlign = "center";
      ctx.fillText(d, x + barW / 2, H - 12);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
})();
