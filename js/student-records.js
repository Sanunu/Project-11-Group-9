/* ============================================================
   student-records.js  —  Attendance Records + monthly chart
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

  const records = (await Storage.getItem("attendanceRecords")) || [];
  let filter = "all";

  /* -------- Monthly chart data (Present / Absent) -------- */
  const months = [
    { m: "Jan", present: 22, absent: 1 },
    { m: "Feb", present: 25, absent: 0 },
    { m: "Mar", present: 18, absent: 4 },
    { m: "Apr", present: 24, absent: 1 },
    { m: "May", present: 21, absent: 3 },
  ];
  drawChart(months);

  renderLogs();

  document.getElementById("statusFilter").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#statusFilter .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.status;
    renderLogs();
  });

  document.getElementById("loadMore").addEventListener("click", () => {
    UI.toast("No earlier records available in this demo.");
  });

  /* ============================================================ */
  function renderLogs() {
    const list = filter === "all" ? records : records.filter((r) => r.status === filter);
    const badge = { present: "badge-gray", absent: "badge-red", late: "badge-blue" };
    const label = { present: "Present", absent: "Absent", late: "Late" };

    const container = document.getElementById("logList");
    if (list.length === 0) {
      container.innerHTML = `<p class="muted" style="text-align:center;padding:20px 0">No ${filter} records.</p>`;
      return;
    }
    container.innerHTML = list
      .map(
        (r) => `
      <div class="log-card ${r.status}">
        <div class="lc-body">
          <div class="lc-code">${UI.esc(r.code)}</div>
          <div class="lc-title">${UI.esc(r.course)}</div>
          <div class="lc-meta">${Icons.get("calendar")} ${UI.esc(r.date)}</div>
          <div class="lc-meta">${Icons.get("clock")} ${UI.esc(r.time)}</div>
        </div>
        <span class="badge ${badge[r.status]}" style="align-self:flex-start">${label[r.status]}</span>
        <span class="chev" data-icon="chevron-right"></span>
      </div>`
      )
      .join("");
    Icons.render(container);
  }

  function drawChart(data) {
    const canvas = document.getElementById("attChart");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const padB = 28, padT = 10, padX = 10;
    const plotH = H - padB - padT;
    const groupW = (W - padX * 2) / data.length;
    const max = Math.max(...data.map((d) => d.present + 2));

    ctx.clearRect(0, 0, W, H);

    // dashed gridlines
    ctx.strokeStyle = "#eef0f3";
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 3; i++) {
      const y = padT + (plotH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const barW = 13;
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "center";

    data.forEach((d, i) => {
      const cx = padX + groupW * i + groupW / 2;
      const pH = (d.present / max) * plotH;
      const aH = (d.absent / max) * plotH;

      // present (blue)
      ctx.fillStyle = "#2f7bf6";
      roundRect(ctx, cx - barW - 2, padT + plotH - pH, barW, pH, 4);
      ctx.fill();
      // absent (red)
      ctx.fillStyle = "#ef4444";
      roundRect(ctx, cx + 2, padT + plotH - aH, barW, Math.max(aH, 3), 4);
      ctx.fill();

      ctx.fillStyle = "#667085";
      ctx.fillText(d.m, cx, H - 8);
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
