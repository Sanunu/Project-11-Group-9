/* ============================================================
   lecturer-broadcast.js  —  Compose & send a broadcast
   ============================================================ */

(async function () {
  const session = await Auth.requireAuth("lecturer");
  if (!session) return;

  await CMCSData.init();
  startClock();

  const allGroups = (await Storage.getItem("groups")) || [];
  let selected = ["CS101 - A", "CS302 - B", "Staff - CS"];
  let attachments = [
    { name: "Syllabus_Update.pdf", size: "1.2 MB" },
    { name: "Reading_Material.pdf", size: "4.5 MB" },
  ];

  /* -------- Preview identity -------- */
  document.getElementById("prevName").textContent = session.name;
  document.getElementById("prevAvatar").textContent =
    session.avatar || UI.initials(session.name);
  document.getElementById("saveTime").textContent = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  renderChips();
  renderAttachments();
  updatePreview();

  /* -------- Chips: remove + add -------- */
  function renderChips() {
    const box = document.getElementById("chips");
    box.innerHTML =
      selected
        .map(
          (g, i) =>
            `<span class="chip">${UI.esc(g)} <span class="x" data-rm="${i}">${Icons.get("x")}</span></span>`
        )
        .join("") + `<span class="chip chip-add" id="addGroup">${Icons.get("plus")} Add Group</span>`;

    document.getElementById("groupCount").textContent = `${selected.length} groups selected`;

    box.querySelectorAll("[data-rm]").forEach((el) =>
      el.addEventListener("click", () => {
        selected.splice(parseInt(el.dataset.rm, 10), 1);
        renderChips();
      })
    );
    document.getElementById("addGroup").addEventListener("click", () => {
      const next = allGroups.find((g) => !selected.includes(g));
      if (!next) {
        UI.toast("All available groups are already selected.");
        return;
      }
      selected.push(next);
      renderChips();
    });
  }

  /* -------- Attachments -------- */
  function renderAttachments() {
    const list = document.getElementById("attachList");
    list.innerHTML = attachments
      .map(
        (a, i) => `
      <div class="attach-card">
        <button class="a-remove" data-rm="${i}">${Icons.get("x")}</button>
        <div class="a-ic">${Icons.get("file")}</div>
        <div>
          <div class="a-name">${UI.esc(a.name)}</div>
          <div class="a-size">${UI.esc(a.size)}</div>
        </div>
      </div>`
      )
      .join("");
    list.querySelectorAll("[data-rm]").forEach((el) =>
      el.addEventListener("click", () => {
        attachments.splice(parseInt(el.dataset.rm, 10), 1);
        renderAttachments();
        updatePreview();
      })
    );
  }

  /* -------- Editor toolbar (demo actions) -------- */
  document.querySelectorAll(".editor-tools button").forEach((btn) => {
    btn.addEventListener("click", () => UI.toast(`${btn.title} formatting applied.`));
  });

  /* -------- Live preview binding -------- */
  document.getElementById("subject").addEventListener("input", updatePreview);
  document.getElementById("messageBody").addEventListener("input", () => {
    document.getElementById("charCount").textContent =
      document.getElementById("messageBody").value.length;
    updatePreview();
  });

  function updatePreview() {
    const subject = document.getElementById("subject").value.trim();
    const body = document.getElementById("messageBody").value.trim();
    document.getElementById("prevSubject").textContent =
      subject || "Upcoming Midterm Examination Details";
    document.getElementById("prevBody").textContent =
      body ||
      "Please note that the midterm for CS302 has been rescheduled to next Friday. All students...";
    const files = document.getElementById("prevFiles");
    if (attachments.length) {
      files.style.display = "inline-flex";
      document.getElementById("prevFileCount").textContent = attachments.length;
    } else {
      files.style.display = "none";
    }
  }

  /* -------- Advanced options collapse -------- */
  let advOpen = true;
  document.getElementById("advToggle").addEventListener("click", () => {
    advOpen = !advOpen;
    document.getElementById("advOptions").style.display = advOpen ? "block" : "none";
    document.getElementById("advChevron").style.transform = advOpen
      ? "rotate(0deg)"
      : "rotate(-90deg)";
  });

  /* -------- Review toggles -------- */
  document.querySelectorAll(".review-toggle").forEach((el) => {
    el.addEventListener("click", () => el.classList.toggle("checked"));
  });

  /* -------- Send -------- */
  document.getElementById("sendBtn").addEventListener("click", async () => {
    const subject = document.getElementById("subject").value.trim();
    const body = document.getElementById("messageBody").value.trim();

    if (selected.length === 0) {
      UI.toast("Select at least one target audience.", "error");
      return;
    }
    if (!subject) {
      UI.toast("Please add a subject for your broadcast.", "error");
      return;
    }

    const announcements = (await Storage.getItem("announcements")) || [];
    announcements.unshift({
      id: "ANN-" + Date.now(),
      title: subject,
      message: body || "(no additional details)",
      type: "academic",
      author: session.name,
      time: "Just now",
      audience: "students",
      groups: selected.slice(),
    });
    await Storage.setItem("announcements", announcements);

    UI.toast(`Broadcast sent to ${selected.length} group(s).`, "success");
    setTimeout(() => (window.location.href = "lecturer-dashboard.html"), 900);
  });

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
