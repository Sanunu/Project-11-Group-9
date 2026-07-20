/* ============================================================
   seed.js
   Seeds default data into async storage the first time the app
   runs. Every other script calls `await CMCSData.init()` before
   reading, so the data is guaranteed to exist.
   ============================================================ */

const CMCSData = (function () {
  /* -------------------- Default users -------------------- */
  const defaultUsers = [
    {
      id: "CMCS-ADM-001",
      name: "Mr. Andrew Sesay",
      email: "admin@university.edu",
      password: "admin123",
      role: "admin",
      department: "System Administration",
      major: "",
      avatar: "AS",
    },
    {
      id: "CMCS-LEC-001",
      name: "Eng. Lukeman",
      email: "lecturer@university.edu",
      password: "lecturer123",
      role: "lecturer",
      department: "Project II & Web-Programing II",
      major: "",
      avatar: "EL",
    },
    {
      id: "CMCS-STU-001",
      name: "Chernor Saidu Barrie",
      email: "student@university.edu",
      password: "student123",
      role: "student",
      department: "Computer Science",
      major: "Computer Science",
      avatar: "CB",
    },
    {
      id: "CMCS-001",
      name: "Engineer Brato",
      email: "brato@cmcs.edu",
      password: "changeme",
      role: "lecturer",
      department: "Mobile Application",
      major: "",
      avatar: "BR",
    },
    {
      id: "CMCS-002",
      name: "Hawa Koroma",
      email: "h.koroma@cmcs.edu",
      password: "changeme",
      role: "student",
      department: "Computer Science",
      major: "Computer Science",
      avatar: "HK",
    },
    {
      id: "CMCS-003",
      name: "Alhaji Mohamed Barrie",
      email: "a.barrie@cmcs.edu",
      password: "changeme",
      role: "student",
      department: "Computer Science",
      major: "Computer Science",
      avatar: "AB",
    },
    {
      id: "CMCS-004",
      name: "Engineer Amadu Bah",
      email: "a.bah@cmcs.edu",
      password: "changeme",
      role: "lecturer",
      department: "Database II",
      major: "",
      avatar: "AB",
    },
    {
      id: "CMCS-005",
      name: "Mohamed Sanunu Barrie",
      email: "m.barrie@cmcs.edu",
      password: "changeme",
      role: "student",
      department: "Computer Science",
      major: "Computer Science",
      avatar: "MB",
    },
  ];

  /* -------------------- Schedules / classes -------------------- */
  const defaultSchedules = [
    {
      id: "SCH-001",
      code: "CS301",
      title: "Project 1s",
      lecturer: "Eng. Lukeman",
      room: "Lab 402",
      day: "Monday",
      start: "09:00",
      end: "10:30",
      students: 42,
      status: "completed",
    },
    {
      id: "SCH-002",
      code: "SE402",
      title: "Web Programming",
      lecturer: "Eng. Lukeman",
      room: "Hall B",
      day: "Monday",
      start: "11:00",
      end: "12:30",
      students: 42,
      status: "ongoing",
    },
    {
      id: "SCH-003",
      code: "CS101",
      title: "Cyber Security",
      lecturer: "Eng. Lukeman",
      room: "Room 105",
      day: "Monday",
      start: "14:00",
      end: "15:30",
      students: 42,
      status: "upcoming",
    },
    {
      id: "SCH-004",
      code: "CS402",
      title: "Software Engineering Architecture",
      lecturer: "Prof. Sarah Jenkins",
      room: "Block C - Room 304",
      day: "Monday",
      start: "09:30",
      end: "11:00",
      students: 38,
      status: "upcoming",
    },
  ];

  /* -------------------- Pending approvals -------------------- */
  const defaultApprovals = [
    {
      id: "APR-001",
      lecturer: "Eng. Abdul Brato",
      course: "Advanced Physics II",
      change: "Room Move (B102 → C04)",
      time: "2h ago",
      priority: "high",
      status: "pending",
    },
    {
      id: "APR-002",
      lecturer: "Eng. Amadu Wurie",
      course: "Data Structures",
      change: "Time Shift (+1 hour)",
      time: "4h ago",
      priority: "normal",
      status: "pending",
    },
    {
      id: "APR-003",
      lecturer: "Eng. Samura",
      course: "Microeconomics",
      change: "Date Swap (Mon → Tue)",
      time: "Yesterday",
      priority: "normal",
      status: "pending",
    },
  ];

  /* -------------------- Announcements / broadcasts -------------------- */
  const defaultAnnouncements = [
    {
      id: "ANN-001",
      title: "Quiz Reminder",
      message:
        "Please be reminded that the mid-term quiz for CS301 will be held this Friday in Lab 402.",
      type: "academic",
      author: "Eng. Lukeman",
      time: "2h ago",
      audience: "students",
    },
    {
      id: "ANN-002",
      title: "Class Rescheduled",
      message:
        "The SE402 lecture has been moved from Monday to Tuesday due to the faculty meeting.",
      type: "schedule",
      author: "Eng. Lukeman",
      time: "Yesterday",
      audience: "students",
    },
    {
      id: "ANN-003",
      title: "Final Project Submission Date",
      message:
        "All final project submissions are due by the end of this month. Late submissions will not be accepted.",
      type: "academic",
      author: "Prof. Sarah Jenkins",
      time: "2h ago",
      audience: "students",
    },
  ];

  /* -------------------- System logs -------------------- */
  const defaultLogs = [
    { time: "14:23:45", event: "Bulk User Import", user: "System Auto", status: "Success" },
    { time: "13:55:12", event: "Credential Reset", user: "A. Sesay", status: "Success" },
    { time: "12:10:04", event: "Database Backup", user: "Cron-Job", status: "In Progress" },
    { time: "11:45:30", event: "Security Alert", user: "Firewall", status: "Blocked" },
    { time: "10:30:11", event: "Schedule Published", user: "Dr. Jenkins", status: "Success" },
  ];

  /* -------------------- Schedule change requests (detailed) -------------------- */
  const defaultChangeRequests = [
    {
      id: "REQ-001",
      lecturer: "Mr. Alicious Bangura",
      title: "Senior Lecturer, Computer Science",
      avatar: "AB",
      code: "CS302",
      course: "Calculus",
      requested: "2024-05-15 10:30 AM",
      current: { day: "Monday", time: "09:00 AM - 11:00 AM", room: "Lab 4B" },
      proposed: { day: "Tuesday", time: "14:00 PM - 16:00 PM", room: "Seminar Room 2" },
      reason: "Conflict with departmental research seminar scheduled for Monday mornings.",
      availability: "Available",
      status: "pending",
    },
    {
      id: "REQ-002",
      lecturer: "Eng. Salifu Samura",
      title: "Head of Data Science",
      avatar: "SS",
      code: "DS101",
      course: "Software Engineering",
      requested: "2024-05-14 02:15 PM",
      current: { day: "Wednesday", time: "13:00 PM - 15:00 PM", room: "Lecture Hall A" },
      proposed: { day: "Wednesday", time: "15:00 PM - 17:00 PM", room: "Lecture Hall A" },
      reason: "Personal medical appointment; requesting 2-hour delay on the same day.",
      availability: "Available",
      status: "pending",
    },
    {
      id: "REQ-003",
      lecturer: "Mr. Iron Sky",
      title: "Assistant Professor",
      avatar: "IS",
      code: "MAT204",
      course: "Linear Statistics",
      requested: "2024-05-15 08:45 AM",
      current: { day: "Thursday", time: "10:00 AM - 12:00 PM", room: "Room 301" },
      proposed: { day: "Friday", time: "10:00 AM - 12:00 PM", room: "Room 305" },
      reason: "Room 301 maintenance issue reported for upcoming Thursday.",
      availability: "Available",
      status: "pending",
    },
    {
      id: "REQ-004",
      lecturer: "Eng. Amadu Wurie Barrie",
      title: "Visiting Faculty",
      avatar: "AW",
      code: "ENG102",
      course: "System Design and Analyses",
      requested: "2024-05-13 11:00 AM",
      current: { day: "Friday", time: "09:00 AM - 11:00 AM", room: "Online - Zoom" },
      proposed: { day: "Monday", time: "09:00 AM - 11:00 AM", room: "Online - Zoom" },
      reason: "Public holiday overlap in hometown during Friday slot.",
      availability: "Available",
      status: "approved",
    },
  ];

  /* -------------------- Class roster (for attendance) -------------------- */
  const defaultRoster = {
    course: "Computer Science 300",
    code: "CS101",
    room: "Lecture Hall B-12",
    students: [
      { id: "ID92881", name: "Chernor Saidu", avatar: "CS", status: "" },
      { id: "ID106912", name: "Sanunu Barrie", avatar: "SB", status: "" },
      { id: "ID10652", name: "Alhaji M Barrie", avatar: "AB", status: "" },
      { id: "10653", name: "Amadu Jalloh", avatar: "AJ", status: "present" },
      { id: "ID10730", name: "Teresa Cole", avatar: "TC", status: "absent" },
      { id: "ID10734", name: "Hawa Koroma", avatar: "HK", status: "" },
      { id: "STU007", name: "Robert Wilson", avatar: "RW", status: "" },
    ],
  };

  /* -------------------- Broadcast audience groups -------------------- */
  const defaultGroups = ["CS101 - A", "CS302 - B", "Staff - CS", "DS101 - A", "All Students"];

  /* -------------------- Notifications / system alerts -------------------- */
  const defaultNotifications = [
    {
      id: "N1",
      sender: "Examinations Office",
      senderRole: "Academic Services",
      avatar: "EO",
      title: "Mid-term Exam Schedule Released",
      message:
        "The schedule for the upcoming Spring 2024 Mid-term examinations has been published...",
      body:
        "The schedule for the upcoming Spring 2024 Mid-term examinations has been published. Please review your exam dates and venues in the timetable section, and contact the examinations office immediately if you notice any clashes.",
      category: "exam",
      time: "10 mins ago",
      unread: true,
      important: true,
    },
    {
      id: "N2",
      sender: "Registrar",
      senderRole: "Administration",
      avatar: "RG",
      title: "Public Holiday: Independence Day",
      message:
        "Please be informed that the university will remain closed on Monday, July 4th...",
      body:
        "Please be informed that the university will remain closed on Monday, July 4th in observance of Independence Day. All classes are suspended and will resume the following working day.",
      category: "holiday",
      time: "2 hours ago",
      unread: true,
      important: false,
    },
    {
      id: "N3",
      sender: "Dr. Sarah Smith",
      senderRole: "Lecturer",
      avatar: "SS",
      title: "New Course Material: Advanced Calculus",
      message:
        "Dr. Sarah Smith has uploaded new lecture notes for Chapter 4: Integration Techniques.",
      body:
        "New lecture notes for Chapter 4: Integration Techniques are now available in the course portal. Please review the material before the next session.",
      category: "general",
      time: "5 hours ago",
      unread: false,
      important: false,
    },
    {
      id: "N4",
      sender: "Academic Office",
      senderRole: "Administration",
      avatar: "AO",
      title: "Attendance Warning: PHY102",
      message:
        "Your attendance for Physics 102 has fallen below the required 75% threshold.",
      body:
        "Your attendance for Physics 102 has fallen below the required 75% threshold. Please ensure you attend upcoming sessions to remain eligible for the end-semester examination.",
      category: "attendance",
      time: "Yesterday",
      unread: false,
      important: true,
    },
    {
      id: "N5",
      sender: "Dr. Sarah Jenkins",
      senderRole: "Senior Lecturer",
      avatar: "SJ",
      title: "Advanced Mathematics: Schedule Change",
      message:
        "Please be advised that the 'Advanced Mathematics' lecture scheduled for tomorrow, October 24th, has bee...",
      body:
        "Please be advised that the 'Advanced Mathematics' lecture scheduled for tomorrow, October 24th, has been moved from Room 302 to the Main Auditorium (Room 101). The time remains unchanged at 09:00 AM. Please update your calendars accordingly.\n\nIf you have any questions regarding this notification, please feel free to reach out to the department directly or reply to this system message.\n\nBest regards,\nDr. Sarah Jenkins",
      category: "academic",
      time: "10:45 AM",
      unread: true,
      important: true,
      attachment: { name: "Updated_Schedule_Oct24.pdf", size: "2.4 MB" },
    },
    {
      id: "N6",
      sender: "Student Union",
      senderRole: "Student Body",
      avatar: "SU",
      title: "Annual Tech Symposium 2024",
      message:
        "We are excited to announce the registrations for the Annual Tech Symposium are now open! Join us for a...",
      body:
        "We are excited to announce that registrations for the Annual Tech Symposium 2024 are now open! Join us for a week of talks, workshops, and networking with industry leaders.",
      category: "announcement",
      time: "Oct 21",
      unread: false,
      important: false,
    },
    {
      id: "N7",
      sender: "IT Department",
      senderRole: "Support",
      avatar: "IT",
      title: "System Maintenance Notice",
      message:
        "The CMCS portal will be undergoing scheduled maintenance on Saturday, October 26th, from 02:00...",
      body:
        "The CMCS portal will be undergoing scheduled maintenance on Saturday, October 26th, from 02:00 AM to 05:00 AM. The system may be intermittently unavailable during this window.",
      category: "system",
      time: "Oct 20",
      unread: false,
      important: false,
    },
    {
      id: "N8",
      sender: "Prof. Robert Miller",
      senderRole: "Lecturer",
      avatar: "RM",
      title: "New Grade Published: Physics II",
      message:
        "The final grades for 'Physics II - Midterm Examination' have been published. You can now view your detailed...",
      body:
        "The final grades for 'Physics II - Midterm Examination' have been published. You can now view your detailed breakdown in the grades portal.",
      category: "academic",
      time: "Oct 19",
      unread: false,
      important: false,
    },
  ];

  /* -------------------- Student attendance records -------------------- */
  const defaultAttendanceRecords = [
    { id: "AR1", code: "CS301", course: "Advanced Algorithms", status: "present", date: "Oct 24, 2024", time: "09:00 AM - 11:00 AM" },
    { id: "AR2", code: "MAT202", course: "Linear Algebra", status: "absent", date: "Oct 23, 2024", time: "02:00 PM - 04:00 PM" },
    { id: "AR3", code: "ENG101", course: "Technical Writing", status: "present", date: "Oct 22, 2024", time: "11:30 AM - 01:00 PM" },
    { id: "AR4", code: "CS305", course: "Database Systems", status: "late", date: "Oct 21, 2024", time: "08:30 AM - 10:30 AM" },
    { id: "AR5", code: "CS301", course: "Advanced Algorithms", status: "present", date: "Oct 17, 2024", time: "09:00 AM - 11:00 AM" },
  ];

  /* -------------------- Weekly timetable (per day) -------------------- */
  const defaultTimetable = {
    Monday: [
      { code: "CS302", type: "LECTURE", title: "Advanced Database", start: "09:00", end: "11:00", lecturer: "Dr. Sarah Johnson", room: "Hall B-12" },
      { code: "MA101", type: "LECTURE", title: "Discrete Mathematics", start: "13:00", end: "14:30", lecturer: "Prof. Robert Chen", room: "Room 405" },
    ],
    Tuesday: [
      { code: "ENG101", type: "LECTURE", title: "Technical Writing", start: "11:30", end: "13:00", lecturer: "Dr. Emily Stone", room: "Room 210" },
    ],
    Wednesday: [
      { code: "CS305", type: "LAB", title: "Database Systems Lab", start: "08:30", end: "10:30", lecturer: "Eng. Lukeman", room: "Lab 402" },
      { code: "PHY102", type: "LECTURE", title: "Physics II", start: "14:00", end: "15:30", lecturer: "Prof. Robert Miller", room: "Hall A" },
    ],
    Thursday: [
      { code: "CS301", type: "LECTURE", title: "Advanced Algorithms", start: "09:00", end: "11:00", lecturer: "Prof. Sarah Jenkins", room: "Block C - 304" },
    ],
    Friday: [
      { code: "MAT204", type: "LECTURE", title: "Linear Algebra", start: "10:00", end: "12:00", lecturer: "Dr. Elena Rodriguez", room: "Room 305" },
    ],
  };

  return {
    /* Seed any missing keys. Safe on every load and upgrade-friendly:
       new datasets are added for existing users without wiping their data. */
    async init() {
      const defaults = {
        users: defaultUsers,
        schedules: defaultSchedules,
        approvals: defaultApprovals,
        announcements: defaultAnnouncements,
        logs: defaultLogs,
        changeRequests: defaultChangeRequests,
        roster: defaultRoster,
        groups: defaultGroups,
        notifications: defaultNotifications,
        attendanceRecords: defaultAttendanceRecords,
        timetable: defaultTimetable,
      };
      for (const [key, value] of Object.entries(defaults)) {
        if ((await Storage.getItem(key)) === null) {
          await Storage.setItem(key, value);
        }
      }

      // Migration: bring legacy seeded records up to date for installs that
      // were seeded before these renames. Each change is guarded by the old
      // value so it never clobbers a later admin edit.
      const users = (await Storage.getItem("users")) || [];
      let usersChanged = false;

      const admin = users.find((u) => u.email === "admin@university.edu");
      if (admin && admin.name === "Arthur Vance") {
        admin.name = "Mr. Andrew Sesay";
        admin.avatar = "AS";
        usersChanged = true;
      }

      const brato = users.find((u) => u.id === "CMCS-001");
      if (brato && brato.name === "Dr. Michael Chen") {
        brato.name = "Engineer Brato";
        brato.email = "brato@cmcs.edu";
        brato.department = "Mobile Application";
        brato.avatar = "BR";
        usersChanged = true;
      }

      const amadu = users.find((u) => u.id === "CMCS-004");
      if (amadu && amadu.name === "Prof. Elena Rodriguez") {
        amadu.name = "Engineer Amadu Bah";
        amadu.email = "a.bah@cmcs.edu";
        amadu.department = "Database II";
        amadu.avatar = "AB";
        usersChanged = true;
      }

      const lukeman = users.find((u) => u.id === "CMCS-LEC-001");
      if (
        lukeman &&
        lukeman.department !== "Project II & Web-Programing II" &&
        /^(Computer Science|Project II & Web Programing)?$/.test(lukeman.department || "")
      ) {
        lukeman.department = "Project II & Web-Programing II";
        usersChanged = true;
      }

      // Students: rename the legacy demo roster and set department -> Computer Science.
      const studentFixes = [
        { id: "CMCS-STU-001", olds: ["Alex Johnson", "Chernor Saidu Barrie"], name: "Chernor Saidu Barrie", avatar: "CB" },
        { id: "CMCS-002", olds: ["Alina Petrova"], name: "Hawa Koroma", email: "h.koroma@cmcs.edu", avatar: "HK" },
        { id: "CMCS-003", olds: ["James Wilson"], name: "Alhaji Mohamed Barrie", email: "a.barrie@cmcs.edu", avatar: "AB" },
        { id: "CMCS-005", olds: ["David Kim"], name: "Mohamed Sanunu Barrie", email: "m.barrie@cmcs.edu", avatar: "MB" },
      ];
      studentFixes.forEach((f) => {
        const u = users.find((x) => x.id === f.id);
        if (u && f.olds.includes(u.name)) {
          u.name = f.name;
          u.avatar = f.avatar;
          u.department = "Computer Science";
          if (f.email) u.email = f.email;
          usersChanged = true;
        }
      });

      if (usersChanged) await Storage.setItem("users", users);

      // Schedule change requests: rename lecturers + modules on legacy installs
      // (status is preserved so any approvals/rejections stay intact).
      const requests = (await Storage.getItem("changeRequests")) || [];
      const requestFixes = [
        { id: "REQ-001", was: "Dr. Sarah Jenkins", lecturer: "Mr. Alicious Bangura", course: "Calculus", avatar: "AB" },
        { id: "REQ-002", was: "Prof. Michael Chen", lecturer: "Eng. Salifu Samura", course: "Software Engineering", avatar: "SS" },
        { id: "REQ-003", was: "Dr. Elena Rodriguez", lecturer: "Mr. Iron Sky", course: "Linear Statistics", avatar: "IS" },
        { id: "REQ-004", was: "James Wilson", lecturer: "Eng. Amadu Wurie Barrie", course: "System Design and Analyses", avatar: "AW" },
      ];
      let requestsChanged = false;
      requestFixes.forEach((f) => {
        const r = requests.find((x) => x.id === f.id);
        if (r && r.lecturer === f.was) {
          r.lecturer = f.lecturer;
          r.course = f.course;
          r.avatar = f.avatar;
          requestsChanged = true;
        }
      });
      if (requestsChanged) await Storage.setItem("changeRequests", requests);

      // keep the active session in sync with the (possibly renamed) user record
      const session = await Storage.getItem("session");
      if (session) {
        const u = users.find((x) => x.id === session.id || x.email === session.email);
        if (u && (session.name !== u.name || session.avatar !== u.avatar || session.department !== u.department)) {
          session.name = u.name;
          session.avatar = u.avatar;
          session.department = u.department;
          await Storage.setItem("session", session);
        }
      }

      await Storage.setItem("seeded", true);
    },

    /* Force a fresh reseed (used by a "reset demo data" action). */
    async reset() {
      await Storage.clearAll();
      await this.init();
    },
  };
})();
