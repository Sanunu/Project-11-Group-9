/* ============================================================
   student-alerts.js  —  System Alerts (two-pane inbox)
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("student");
  if (!session) return;

  await CMCSData.init();

  document.getElementById("navLogout").addEventListener("click", (e) => {
    e.preventDefault();
    Auth.logout();
  });

  let items = (await Storage.getItem("notifications")) || [];
  let tab = "all";
  let searchTerm = "";

  // open a specific alert if ?id= was passed (from the mobile Notifications page)
  const params = new URLSearchParams(location.search);
  let activeId = params.get("id") || (items[0] && items[0].id) || null;

  renderList();
  renderReader();

  /* -------- Tabs -------- */
  document.getElementById("alertTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#alertTabs button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tab = btn.dataset.tab;
    renderList();
  });

  /* -------- Search -------- */
  document.getElementById("alertSearch").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderList();
  });

  /* -------- Mark all read -------- */
  document.getElementById("markAllRead").addEventListener("click", async () => {
    items.forEach((n) => (n.unread = false));
    await Storage.setItem("notifications", items);
    UI.toast("All alerts marked as read.", "success");
    renderList();
    renderReader();
  });

  /* ============================================================ */
  function filtered() {
    let list = items;
    if (tab === "unread") list = list.filter((n) => n.unread);
    else if (tab === "important") list = list.filter((n) => n.important);
    if (searchTerm) {
      list = list.filter(
        (n) =>
          n.sender.toLowerCase().includes(searchTerm) ||
          n.title.toLowerCase().includes(searchTerm)
      );
    }
    return list;
  }

  function renderList() {
    const list = filtered();
    const container = document.getElementById("alertList");
    if (list.length === 0) {
      container.innerHTML = `<p class="muted" style="text-align:center;padding:24px 0">No alerts found.</p>`;
      return;
    }
    container.innerHTML = list
      .map(
        (n) => `
      <div class="alert-item ${n.unread ? "unread" : ""} ${n.id === activeId ? "active" : ""}" data-id="${n.id}">
        <div class="ai-avatar">${UI.esc(n.avatar || UI.initials(n.sender))}</div>
        <div class="ai-body">
          <div class="ai-row">
            <span class="ai-sender">${UI.esc(n.sender)}</span>
            <span class="ai-time">${UI.esc(n.time)}</span>
          </div>
          <div class="ai-subject">${UI.esc(n.title)}</div>
          <div class="ai-preview">${UI.esc(n.message)}</div>
          <div class="ai-foot">
            <span class="ai-tag">${Icons.get("calendar")} ${UI.esc(n.category)}</span>
            <span class="ai-star ${n.important ? "on" : ""}" data-star="${n.id}">${Icons.get("check-circle")}</span>
          </div>
        </div>
      </div>`
      )
      .join("");
    Icons.render(container);

    container.querySelectorAll(".alert-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-star]")) return;
        openAlert(el.dataset.id);
      });
    });
    container.querySelectorAll("[data-star]").forEach((el) => {
      el.addEventListener("click", async (e) => {
        e.stopPropagation();
        const n = items.find((x) => x.id === el.dataset.star);
        n.important = !n.important;
        await Storage.setItem("notifications", items);
        renderList();
        renderReader();
      });
    });
  }

  async function openAlert(id) {
    activeId = id;
    const n = items.find((x) => x.id === id);
    if (n && n.unread) {
      n.unread = false;
      await Storage.setItem("notifications", items);
    }
    renderList();
    renderReader();
  }

  function renderReader() {
    const reader = document.getElementById("reader");
    const n = items.find((x) => x.id === activeId);
    if (!n) {
      reader.innerHTML = `<div class="reader-empty">Select an alert to read it.</div>`;
      return;
    }

    reader.innerHTML = `
      <div class="reader-head">
        <div class="avatar">${UI.esc(n.avatar || UI.initials(n.sender))}</div>
        <div>
          <div class="rh-name">${UI.esc(n.sender)}</div>
          <div class="rh-meta">${UI.esc(n.senderRole || "")} • ${UI.esc(n.time)}</div>
        </div>
        <div class="rh-actions">
          <span class="star ${n.important ? "on" : ""}" id="readerStar" title="Star">${Icons.get("check-circle")}</span>
          <span id="readerDelete" title="Delete">${Icons.get("trash")}</span>
          <span title="More">${Icons.get("more-vertical")}</span>
        </div>
      </div>

      <div class="reader-cat"><span class="badge badge-blue">${Icons.get("calendar")} ${UI.esc(n.category)}</span></div>
      <h1>${UI.esc(n.title)}</h1>
      <div class="reader-body">${UI.esc(n.body || n.message)}</div>

      ${
        n.attachment
          ? `<div class="attachment">
               <div class="at-ic">${Icons.get("file")}</div>
               <div>
                 <div class="at-name">${UI.esc(n.attachment.name)}</div>
                 <div class="at-sub">PDF Document • ${UI.esc(n.attachment.size)}</div>
               </div>
               <button class="btn btn-outline dl-btn" id="dlBtn">Download</button>
             </div>`
          : ""
      }

      <div class="reader-btns">
        <button class="btn btn-primary" id="actionBtn">Take Action</button>
        <button class="btn btn-outline" id="replyBtn">Reply</button>
        <span class="link" style="font-weight:600;cursor:pointer" id="archiveBtn">Archive</span>
      </div>`;
    Icons.render(reader);

    reader.querySelector("#readerStar").addEventListener("click", async () => {
      n.important = !n.important;
      await Storage.setItem("notifications", items);
      renderList();
      renderReader();
    });
    reader.querySelector("#readerDelete").addEventListener("click", () => archive(n.id, "Deleted"));
    reader.querySelector("#archiveBtn").addEventListener("click", () => archive(n.id, "Archived"));
    reader.querySelector("#actionBtn").addEventListener("click", () =>
      UI.toast("Action recorded for this alert.", "success")
    );
    reader.querySelector("#replyBtn").addEventListener("click", () =>
      UI.toast("Reply drafted (demo).")
    );
    const dl = reader.querySelector("#dlBtn");
    if (dl) dl.addEventListener("click", () => UI.toast("Attachment download started (demo)."));
  }

  async function archive(id, verb) {
    items = items.filter((x) => x.id !== id);
    await Storage.setItem("notifications", items);
    activeId = items[0] ? items[0].id : null;
    UI.toast(`${verb} alert.`, "error");
    renderList();
    renderReader();
  }
})();
