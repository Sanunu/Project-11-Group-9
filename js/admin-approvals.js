/* ============================================================
   admin-approvals.js  —  Schedule Change Approvals (admin)
   ============================================================ */

(async function () {
  await CMCSData.init();

  const session = await Auth.requireAuth("admin");
  if (!session) return;

  document.getElementById("sideName").textContent = session.name;
  document.getElementById("sideAvatar").textContent =
    session.avatar || UI.initials(session.name);
  document.getElementById("logoutBtn").addEventListener("click", () => Auth.logout());

  let currentStatus = "all";
  let searchTerm = "";

  await render();

  /* -------- Filters -------- */
  document.getElementById("statusFilter").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#statusFilter button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatus = btn.dataset.status;
    render();
  });

  document.getElementById("reqSearch").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    render();
  });

  /* -------- Render -------- */
  async function render() {
    const requests = (await Storage.getItem("changeRequests")) || [];

    const pendingTotal = requests.filter((r) => r.status === "pending").length;
    document.getElementById("queueCount").textContent = `${pendingTotal} items`;

    let list = requests.slice();
    if (currentStatus !== "all") list = list.filter((r) => r.status === currentStatus);
    if (searchTerm) {
      list = list.filter(
        (r) =>
          r.lecturer.toLowerCase().includes(searchTerm) ||
          r.course.toLowerCase().includes(searchTerm) ||
          r.code.toLowerCase().includes(searchTerm)
      );
    }

    const statusBadge = {
      pending: "badge-amber",
      approved: "badge-green",
      rejected: "badge-red",
    };

    const container = document.getElementById("requestList");
    if (list.length === 0) {
      container.innerHTML = `<div class="card panel"><p class="muted" style="text-align:center;padding:24px 0">No requests match this view.</p></div>`;
    } else {
      container.innerHTML = list.map((r) => card(r, statusBadge)).join("");
      container.querySelectorAll(".req-card").forEach((el) => {
        el.querySelectorAll("[data-act]").forEach((btn) => {
          btn.addEventListener("click", () => decide(el.dataset.id, btn.dataset.act));
        });
      });
    }

    document.getElementById("reqCount").textContent =
      `Showing ${list.length} of ${requests.length} total requests`;
  }

  function slot(label, data, proposed) {
    return `
      <div class="slot ${proposed ? "proposed" : ""}">
        <div class="slot-label"><span class="dot"></span>${label}</div>
        <div class="slot-row">${Icons.get("calendar")} ${UI.esc(data.day)}</div>
        <div class="slot-row">${Icons.get("clock")} ${UI.esc(data.time)}</div>
        <div class="slot-row">${Icons.get("map-pin")} ${UI.esc(data.room)}</div>
      </div>`;
  }

  function card(r, statusBadge) {
    const decided = r.status !== "pending";
    return `
    <div class="card req-card" data-id="${r.id}">
      <div class="req-top">
        <div class="avatar">${UI.esc(r.avatar || UI.initials(r.lecturer))}</div>
        <div>
          <div class="req-name">${UI.esc(r.lecturer)}</div>
          <div class="req-title">${UI.esc(r.title)}</div>
        </div>
        <div class="req-meta">
          <span class="badge ${statusBadge[r.status]} status-pill">${r.status}</span>
          <div class="req-id">ID: ${UI.esc(r.id)}</div>
        </div>
      </div>

      <div class="req-course">
        <span class="badge badge-blue">${UI.esc(r.code)}</span>
        <h3>${UI.esc(r.course)}</h3>
        <span class="req-date">Requested: ${UI.esc(r.requested)}</span>
      </div>

      <div class="compare">
        ${slot("Current Schedule", r.current, false)}
        <div class="arrow">${Icons.get("chevron-right")}</div>
        ${slot("Proposed Change", r.proposed, true)}
      </div>

      <div class="reason">
        <div class="r-label">${Icons.get("alert-circle")} Reason for Request</div>
        <p>${UI.esc(r.reason)}</p>
      </div>

      <div class="req-foot">
        <span class="avail">${Icons.get("check-circle")} System checked for room availability: <b>${UI.esc(r.availability)}</b></span>
        ${
          decided
            ? `<span class="foot-done">Review Completed</span>`
            : `<div class="foot-btns">
                 <button class="btn btn-outline" data-act="reject">${Icons.get("x")} Reject</button>
                 <button class="btn btn-primary" data-act="approve">${Icons.get("check-circle")} Approve Change</button>
               </div>`
        }
      </div>
    </div>`;
  }

  async function decide(id, act) {
    const requests = (await Storage.getItem("changeRequests")) || [];
    const item = requests.find((r) => r.id === id);
    if (!item) return;
    item.status = act === "approve" ? "approved" : "rejected";
    await Storage.setItem("changeRequests", requests);
    UI.toast(
      act === "approve"
        ? `Approved ${item.code} change for ${item.lecturer.split(" ").slice(-1)[0]}.`
        : `Rejected ${item.code} change request.`,
      act === "approve" ? "success" : "error"
    );
    render();
  }
})();
