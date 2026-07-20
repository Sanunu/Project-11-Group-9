/* ============================================================
   login.js  —  Login page behaviour
   ============================================================ */

(async function () {
  await CMCSData.init();

  // If already logged in, skip straight to the dashboard.
  const existing = await Auth.current();
  if (existing) {
    window.location.href = Auth.dashboardFor(existing.role);
    return;
  }

  let selectedRole = null;

  /* Role selector chips */
  const roleGrid = document.getElementById("roleGrid");
  roleGrid.addEventListener("click", (e) => {
    const chip = e.target.closest(".role-chip");
    if (!chip) return;
    document
      .querySelectorAll(".role-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    selectedRole = chip.dataset.role;
  });

  /* Show / hide password */
  document.getElementById("togglePwd").addEventListener("click", () => {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
  });

  document.getElementById("forgot").addEventListener("click", (e) => {
    e.preventDefault();
    UI.toast("Please contact your system administrator to reset your password.");
  });

  /* Submit */
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!selectedRole) {
      UI.toast("Please select your access role (Student, Lecturer, or Admin) before logging in.", "error");
      document.getElementById("roleGrid").classList.add("shake");
      setTimeout(() => document.getElementById("roleGrid").classList.remove("shake"), 500);
      return;
    }

    if (!email || !password) {
      UI.toast("Please enter both email and password.", "error");
      return;
    }

    const result = await Auth.login(email, password, selectedRole);
    if (!result.ok) {
      UI.toast(result.message, "error");
      return;
    }

    UI.toast(`Welcome back, ${result.user.name.split(" ").slice(-1)[0]}!`, "success");
    setTimeout(() => {
      window.location.href = Auth.dashboardFor(result.user.role);
    }, 700);
  });
})();
