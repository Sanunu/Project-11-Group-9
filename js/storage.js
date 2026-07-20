/* ============================================================
   storage.js
   Async storage layer for the CMCS project.
   Wraps localStorage in Promise-based (async/await) methods so the
   whole app talks to storage the same way it would to a real
   asynchronous backend / AsyncStorage.
   ============================================================ */

const Storage = (function () {
  const PREFIX = "cmcs_";

  // Simulate network / disk latency so the async nature is real.
  function delay(ms = 60) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return {
    /* Save any serialisable value under a key. */
    async setItem(key, value) {
      await delay();
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error("Storage.setItem failed:", err);
        return false;
      }
    },

    /* Read a value back (parsed). Returns null when missing. */
    async getItem(key) {
      await delay();
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw === null ? null : JSON.parse(raw);
      } catch (err) {
        console.error("Storage.getItem failed:", err);
        return null;
      }
    },

    /* Remove a single key. */
    async removeItem(key) {
      await delay();
      localStorage.removeItem(PREFIX + key);
      return true;
    },

    /* Wipe every CMCS key (used by "reset data"). */
    async clearAll() {
      await delay();
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
      return true;
    },
  };
})();
