/* ============================================================
   admin-users.js  —  Register users + user directory
   ============================================================ */

(async function () {
  await CMCSData.init();

  const session = await Auth.requireAuth("admin");
  if (!session) return;

  document.getElementById("sideName").textContent = session.name;
  document.getElementById("sideAvatar").textContent =
    session.avatar || UI.initials(session.name);
  document.getElementById("logoutBtn").addEventListener("click", () => Auth.logout());

  let currentFilter = "all";
  let searchTerm = "";

  await renderDirectory();

  /* -------------------- Registration -------------------- */
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const role = document.getElementById("regRole").value;
    const major = document.getElementById("regMajor").value.trim();
    const autoGen = document.getElementById("autoGen").checked;

    if (!name || !email) {
      UI.toast("Full name and email are required.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      UI.toast("Please enter a valid institutional email.", "error");
      return;
    }

    const users = (await Storage.getItem("users")) || [];
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      UI.toast("A user with this email already exists.", "error");
      return;
    }

    const password = autoGen ? generatePassword() : "changeme";
    const prefix = role === "student" ? "STU" : role === "lecturer" ? "LEC" : "ADM";
    const newUser = {
      id: `CMCS-${prefix}-${String(users.length + 1).padStart(3, "0")}`,
      name,
      email,
      password,
      role,
      department: major || (role === "student" ? "Undeclared" : "General"),
      major: role === "student" ? major : "",
      avatar: UI.initials(name),
    };

    users.push(newUser);
    await Storage.setItem("users", users);

    UI.toast(
      autoGen
        ? `Registered ${name}. Temp password: ${password}`
        : `Registered ${name} successfully.`,
      "success"
    );

    e.target.reset();
    document.getElementById("autoGen").checked = true;
    await renderDirectory();
  });

  /* -------------------- Filters -------------------- */
  document.getElementById("roleFilter").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("#roleFilter button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.role;
    renderDirectory();
  });

  document.getElementById("dirSearch").addEventListener("input", (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderDirectory();
  });

  /* -------------------- Render -------------------- */
  async function renderDirectory() {
    const users = (await Storage.getItem("users")) || [];
    let filtered = users.filter((u) => u.role !== "admin" || currentFilter === "all");
    if (currentFilter !== "all") {
      filtered = users.filter((u) => u.role === currentFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          u.id.toLowerCase().includes(searchTerm)
      );
    }

    const roleBadge = { student: "badge-blue", lecturer: "badge-gray", admin: "badge-amber" };
    const list = document.getElementById("userList");

    if (filtered.length === 0) {
      list.innerHTML = `<p class="muted" style="padding:24px 0;text-align:center;">No users match your search.</p>`;
    } else {
      list.innerHTML = filtered
        .map(
          (u) => `
        <div class="user-row" data-id="${u.id}">
          <div class="u-main">
            <div class="avatar">${UI.esc(u.avatar || UI.initials(u.name))}</div>
            <div>
              <div class="u-name">${UI.esc(u.name)}</div>
              <div class="u-email">${UI.esc(u.email)}</div>
            </div>
          </div>
          <div>
            <span class="badge ${roleBadge[u.role]}">${u.role[0].toUpperCase() + u.role.slice(1)}</span>
            <div class="u-id">${UI.esc(u.id)}</div>
          </div>
          <div class="u-dept">${Icons.get("graduation-cap")} ${UI.esc(u.department)}</div>
          <button class="icon-btn" title="Remove user" data-del="${u.id}">${Icons.get("trash")}</button>
        </div>`
        )
        .join("");

      list.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => deleteUser(btn.dataset.del));
      });
    }

    document.getElementById("dirCount").textContent =
      `Showing ${filtered.length} of ${users.length} total users`;
  }

  async function deleteUser(id) {
    if (id === session.id) {
      UI.toast("You cannot remove your own account.", "error");
      return;
    }
    const users = (await Storage.getItem("users")) || [];
    const target = users.find((u) => u.id === id);
    const updated = users.filter((u) => u.id !== id);
    await Storage.setItem("users", updated);
    UI.toast(`Removed ${target ? target.name : "user"}.`, "error");
    await renderDirectory();
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
    let out = "";
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
})();
