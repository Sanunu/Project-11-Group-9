/* ============================================================
   auth.js
   Authentication + session helpers shared by every page.
   Session is kept in async storage under "session".
   ============================================================ */

const Auth = (function () {
  return {
    /* Validate credentials against stored users. */
    async login(email, password, expectedRole) {
      await CMCSData.init();
      const users = (await Storage.getItem("users")) || [];
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          u.password === password
      );

      if (!user) {
        return { ok: false, message: "Invalid email or password." };
      }
      if (expectedRole && user.role !== expectedRole) {
        return {
          ok: false,
          message: `This account is not registered as a ${expectedRole}.`,
        };
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        loginAt: new Date().toISOString(),
      };
      await Storage.setItem("session", session);
      return { ok: true, user: session };
    },

    /* Current logged-in user or null. */
    async current() {
      return await Storage.getItem("session");
    },

    /* Redirect to login if not authenticated (optionally enforce role). */
    async requireAuth(role) {
      const session = await this.current();
      if (!session) {
        window.location.href = "index.html";
        return null;
      }
      if (role && session.role !== role) {
        window.location.href = "index.html";
        return null;
      }
      return session;
    },

    /* Landing page for each role. */
    dashboardFor(role) {
      switch (role) {
        case "admin":
          return "admin-dashboard.html";
        case "lecturer":
          return "lecturer-dashboard.html";
        case "student":
          return "student-dashboard.html";
        default:
          return "index.html";
      }
    },

    async logout() {
      await Storage.removeItem("session");
      window.location.href = "index.html";
    },
  };
})();
