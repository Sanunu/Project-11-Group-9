/* ============================================================
   student-notifications.js  —  Notifications list
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

  let filter = "all";

  renderList();

  /* -------- Category filter -------- */
  document.getElementById("catFilter").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#catFilter .pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.cat;
    renderList();
  });

  /* -------- Mark all read -------- */
  document.getElementById("markAllRead").addEventListener("click", async () => {
    const items = (await Storage.getItem("notifications")) || [];
    items.forEach((n) => (n.unread = false));
    await Storage.setItem("notifications", items);
    UI.toast("All notifications marked as read.", "success");
    renderList();
  });

  document.getElementById("searchToggle").addEventListener("click", () => {
    UI.toast("Search coming soon.");
  });

  /* ============================================================ */
  async function renderList() {
    const items = (await Storage.getItem("notifications")) || [];
    let list = items;
    if (filter === "unread") list = items.filter((n) => n.unread);
    else if (filter !== "all") list = items.filter((n) => n.category === filter);

    const container = document.getElementById("notifList");
    if (list.length === 0) {
      container.innerHTML = `<p class="muted" style="text-align:center;padding:24px 0">No notifications here.</p>`;
      return;
    }

    container.innerHTML = list
      .map(
        (n) => `
      <div class="notif-item ${n.unread ? "unread" : ""}" data-id="${n.id}">
        <div class="ni-avatar">${UI.esc(n.avatar || UI.initials(n.sender))}</div>
        <div class="ni-body">
          <div class="ni-top">
            <span class="ni-title">${UI.esc(n.title)}</span>
            ${n.unread ? `<span class="ni-unread-dot"></span>` : ""}
          </div>
          <div class="ni-msg">${UI.esc(n.message)}</div>
          <div class="ni-foot">
            <span class="ni-cat">${UI.esc(n.category)}</span>
            <span class="ni-time">${Icons.get("clock")} ${UI.esc(n.time)}</span>
          </div>
        </div>
        <span class="ni-chev" data-icon="chevron-right"></span>
      </div>`
      )
      .join("");
    Icons.render(container);

    container.querySelectorAll(".notif-item").forEach((el) => {
      el.addEventListener("click", () => {
        window.location.href = "student-alerts.html?id=" + encodeURIComponent(el.dataset.id);
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
