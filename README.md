# Class Management & Communication System (CMCS)

A role-based web application for managing classes, schedules, attendance, and
communication between **Administrators**, **Lecturers**, and **Students**.

Built for the *Project II* course (second-semester final project) using plain
**HTML, CSS, and JavaScript** — no frameworks and no build step. Data is stored
locally in the browser through a Promise-based (async) storage layer that
mimics a real backend / mobile `AsyncStorage`.

---

## Table of Contents
- [Features](#features)
- [Demo Accounts](#demo-accounts)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Notes](#notes)

---

## Features

### Authentication (`index.html`)
- Institutional email + password login.
- **Role selection is compulsory** — Student, Lecturer, or Admin must be chosen
  before logging in; the login is blocked with a prompt (and a shake animation)
  if no role is selected.
- The selected role is validated against the account (e.g. a student account
  cannot log in through the Admin option).
- Each role is routed to its own dashboard after a successful login.

### Admin
| Page | File | What it does |
|------|------|--------------|
| Admin Console | `admin-dashboard.html` | Live stat cards, an animated activity chart (vanilla `<canvas>`), pending approvals, system health, and recent logs. |
| User Management | `admin-users.html` | Register new students/lecturers (auto-generated passwords) and browse/search/filter/delete the user directory. |
| Schedule Approvals | `admin-approvals.html` | Review lecturer-initiated timetable change requests (current vs. proposed), then Approve/Reject. Filter by status and search. |

### Lecturer
| Page | File | What it does |
|------|------|--------------|
| Lecturer Hub | `lecturer-dashboard.html` | Today's schedule, pending attendance, quick actions, and recent broadcasts. |
| Attendance | `lecturer-attendance.html` | Mark a class roster Present/Absent, with live progress and "Mark All". |
| Set Class | `lecturer-schedule.html` | Create a class: pick a course, room, date (dynamic calendar), and time slot (with conflict detection) and weekly recurrence. |
| Broadcast | `lecturer-broadcast.html` | Compose an announcement to target audiences with a **live student preview**, attachments, and send options. |

### Student
| Page | File | What it does |
|------|------|--------------|
| Student Dashboard | `student-dashboard.html` | Animated attendance ring, next-class highlight, quick actions, and recent announcements. |
| Attendance Records | `student-records.html` | Monthly Present/Absent chart plus filterable detailed logs (All/Present/Absent/Late). |
| Notifications | `student-notifications.html` | Notification feed with category filters and "mark all read". |
| Weekly Timetable | `student-timetable.html` | Day selector + 08:00–18:00 timeline of classes and free periods. |
| System Alerts | `student-alerts.html` | Two-pane inbox (list + reader) with attachments and Take Action / Reply / Archive. |

> The mobile-style pages (lecturer & student) are **responsive** — they render
> as a phone app on small screens and expand into a full dashboard layout on
> tablet/desktop. The admin pages and System Alerts inbox are desktop-first and
> collapse gracefully on smaller screens.

---

## Demo Accounts

Select the matching role on the login screen, then sign in:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@university.edu` | `admin123` |
| Lecturer | `lecturer@university.edu` | `lecturer123` |
| Student | `student@university.edu` | `student123` |

---

## Getting Started

No installation or build tools are required.

### Option 1 — Open directly
Double-click **`index.html`** to open it in your browser.

### Option 2 — Run a local server (recommended)
Some browsers restrict `localStorage`/scripts on `file://`. Serving over HTTP
avoids that:

```bash
# from the project folder
python -m http.server 8765
```

Then visit **http://localhost:8765/index.html**.

> If you have opened the app before and data looks out of date, do a **hard
> reload (Ctrl + F5)** so the browser fetches the latest scripts.

---

## Project Structure

```
CMCS/
├── index.html                  # Login / portal (entry point)
│
├── admin-dashboard.html        # Admin console
├── admin-users.html            # Register users + directory
├── admin-approvals.html        # Schedule change approvals
│
├── lecturer-dashboard.html     # Lecturer hub
├── lecturer-attendance.html    # Mark attendance
├── lecturer-schedule.html      # Set / create a class
├── lecturer-broadcast.html     # Compose a broadcast
│
├── student-dashboard.html      # Student home
├── student-records.html        # Attendance records + chart
├── student-notifications.html  # Notifications feed
├── student-timetable.html      # Weekly timetable
├── student-alerts.html         # System alerts inbox
│
├── css/
│   ├── styles.css              # Shared base (buttons, cards, badges, forms)
│   ├── login.css               # Login page
│   ├── admin.css               # Admin desktop layout
│   ├── approvals.css           # Schedule approvals
│   ├── mobile.css              # Phone-app frame + responsive rules
│   ├── lecturer-pages.css      # Attendance / Set Class / Broadcast
│   ├── student-pages.css       # Records / Notifications / Timetable
│   └── alerts.css              # System Alerts two-pane inbox
│
└── js/
    ├── storage.js              # Async (Promise-based) localStorage wrapper
    ├── seed.js                 # Default data + upgrade-safe seeding/migrations
    ├── auth.js                 # Login, session, role routing
    ├── util.js                 # Toast + small helpers
    ├── icons.js                # Inline SVG icon library
    ├── login.js                # Login page logic
    ├── admin-dashboard.js
    ├── admin-users.js
    ├── admin-approvals.js
    ├── lecturer.js
    ├── lecturer-attendance.js
    ├── lecturer-schedule.js
    ├── lecturer-broadcast.js
    ├── student.js
    ├── student-records.js
    ├── student-notifications.js
    ├── student-timetable.js
    └── student-alerts.js
```

Every page is a separate HTML file, all CSS is external, and each page has its
own JavaScript module.

---

## How It Works

- **Async storage (`storage.js`)** — a small wrapper around `localStorage` whose
  methods (`getItem`, `setItem`, `removeItem`, `clearAll`) return Promises, so
  the whole app talks to storage with `async/await` as if it were a remote API.
- **Seeding (`seed.js`)** — on first run, default users, schedules, approvals,
  notifications, timetable, etc. are written to storage. Seeding is
  **upgrade-safe**: it only backfills missing keys, so existing data is never
  wiped, and small guarded migrations keep demo records up to date.
- **Auth (`auth.js`)** — validates credentials against the stored users, enforces
  the selected role, stores a session, and redirects to the right dashboard.
  `requireAuth()` guards every protected page.
- **Icons (`icons.js`)** — all icons are inline SVGs (no image files / CDNs),
  hydrated from `data-icon` attributes or injected via `Icons.get(name)`.

---

## Tech Stack

- **HTML5** — semantic markup, one file per page.
- **CSS3** — external stylesheets, CSS variables, flexbox/grid, responsive
  media queries, light animations.
- **Vanilla JavaScript (ES6+)** — modules per page, `async/await`, Canvas API
  for charts, no external libraries or frameworks.
- **Browser `localStorage`** — persistence layer (via the async wrapper).

---

## Notes

- This is a **front-end demo**: all data lives in the browser's `localStorage`,
  so it is per-browser and not shared between devices. Clearing browser data
  resets the app to its seeded defaults.
- Passwords are stored in plain text for demonstration only — this is **not**
  production-grade authentication.
- Designed and built as the *Project II* second-semester final project:
  **Class Management & Communication System (CMCS)**.
