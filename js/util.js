/* ============================================================
   util.js  —  Small shared UI helpers
   ============================================================ */

const UI = (function () {
  let toastEl = null;
  let toastTimer = null;

  function ensureToast() {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    return toastEl;
  }

  return {
    /* Show a transient toast message. type: "" | "success" | "error" */
    toast(message, type = "") {
      const el = ensureToast();
      el.className = "toast " + type;
      el.textContent = message;
      // force reflow so re-triggering the animation works
      void el.offsetWidth;
      el.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
    },

    /* Escape user-supplied text before inserting as HTML. */
    esc(str) {
      return String(str ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]);
    },

    /* Build initials from a full name. */
    initials(name) {
      return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("");
    },
  };
})();
