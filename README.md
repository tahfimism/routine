# Product Requirement Document (PRD) & Project Overview: Class Routine Dashboard

A lightweight, offline-first, mobile-friendly Progressive Web App (PWA) designed to help university students track their daily schedules, manage transitions between classes, and receive timely alerts.

---

## 1. Executive Summary
The **Class Routine Dashboard** serves as an intelligent companion for university students. Rather than relying on static images, PDFs, or spreadsheet printouts, this application parses schedule metadata in real-time to show what class is currently ongoing, what class is next, and how much time remains. 

It is designed to feel like a premium utility app: minimal clutter, highly optimized for touch and lateral swiping on mobile screens, and accessible even in lecture halls with zero internet connectivity.

---

## 2. Core Product Features

### 2.1 Multi-Routine Architecture
- **Central Registry**: Routines are defined as separate objects inside a centralized configuration file (`js/data.js`).
- **Routine Attributes**: Each routine contains its own:
  - Header name and subtitle (e.g. "ECE 2-1" vs. "DSA").
  - Teacher acronym directory (resolving abbreviations to full names inside modals).
  - Weekly schedule datasets.
  - Custom light-mode color theme palette.

### 2.2 Dual-View Modes
- **Daily Feed View**:
  - Displays cards for a single selected day.
  - Cards show course codes, class time, period badges, sessional/theory badges, and instructor names.
  - Implements a dynamic "Routine Intelligence" banner at the top showing current status:
    - *Class Ongoing*: Shows what class is running and a countdown timer of how much time is left.
    - *Class Break*: Shows when the next class starts and a countdown timer.
    - *Weekend / Off-Hours*: Greets the user and displays when the next academic day begins.
  - Automatically highlights the ongoing card in green (light mode) or emerald (dark mode) with a pulsing live indicator.
- **Weekly Grid Track View**:
  - Redesigned to fit mobile screen widths without layout breaking.
  - Displays stacked horizontal rows (Sunday to Thursday).
  - Rows are lateral swiping containers (`overflow-x-auto`) letting users swipe horizontally to browse the weekly timeline.
  - Weekly cards are stripped down to show course codes only to ensure maximum compact layout density.

### 2.3 Dynamic Color Palette System
- **Dynamic Light Mode**: Light mode colors are bound to CSS variables (`--cream-bg`, `--cream-card`, `--cream-border`, `--cream-text`, `--cream-muted`) and loaded dynamically per routine.
  - *ECE Default Routine*: Warm cream background (`#FDFBF7`) with soft neutral borders.
  - *EWU/DSA Routine*: Clear soft lavender background (`#EAE2F8`), crisp white cards (`#FFFFFF`), and deep eggplant text accents (`#311B92`).
- **Standardized Dark Mode**: Dark mode colors remain globally uniform (`#121212`) for all routines, maintaining consistent contrast.

### 2.4 Dynamic Link-Based Selector
- **Query Parameter Loading**: Users can view and set a default routine by visiting a link containing a query parameter (e.g., `tahfimism.github.io/routine?r=ll` or `?r=ece21`).
- **URL Sanitization & Caching**: When a valid routine ID parameter is detected:
  - It is immediately cached in the browser's `localStorage` as the active choice.
  - The URL parameters are silently scrubbed from the address bar using `history.replaceState` to maintain a clean link interface.
  - Falls back to the first routine in the registry if no parameters or cache exist.

### 2.5 Hidden Easter-Egg Settings Modal
- **Trigger**: The settings option is hidden to keep the header uncluttered. Clicking the main routine title header **three times quickly** (within 1.0 second) triggers the hidden settings selection modal.
- **Visual details**: Features `select-none` styling to prevent text selection highlighting during the triple-click.

### 2.6 Interactive Class Details Modal
- **Trigger**: Click any daily feed card or weekly track card to open.
- **Room Numbers**: In line with decluttering constraints, room numbers are hidden on feed cards and **only displayed inside the details modal** to keep the dashboard simple.
- **Acronym Resolution**: Resolves teacher initials (e.g. "AMB") to their full names using the routine's registry mapping.

### 2.7 Progressive Web App (PWA) & Offline Access
- **Service Worker (`sw.js`)**: Registers on page load, caching core assets (`index.html`, `style.css`, `data.js`, `app.js`, `manifest.json`).
- **Network-First Caching Strategy**: Uses a **Network-First falling back to Cache** strategy. When online, the app fetches fresh files from the network and updates the cache. When offline, it falls back to cache instantly. This guarantees students always see dynamic schedule edits immediately when online and retains offline loading.
- **PWA Manifest (`manifest.json`)**: Configures standard display properties, background colors, and start URLs to make the website fully installable as a native app.
- **Platform-Aware Install Prompts**:
  - *Android Chrome / Desktop*: Intercepts default browser prompts and displays a custom slide-up install promotion banner featuring a calendar SVG logo. Clicking "Install" fires the native browser trigger.
  - *iOS Safari*: Safari blocks programmatic prompts. The app displays manual instructions showing users how to tap Safari's Share sheet and select "Add to Home Screen".
  - *Session Dismissal*: Clicking "Dismiss" hides the banner and saves the state to `sessionStorage` to avoid prompting again in the same tab session.

### 2.8 Service Worker Push Notifications
- **Mobile Background Support**: Dispatches alarms using the Service Worker registration context (`registration.showNotification()`) for background compatibility.
- **Timers**:
  - *10-Minute Warning*: Pushes an alert exactly 10 minutes before a class starts, showing class names and classroom locations.
  - *Start Warning*: Pushes an alert exactly when class starts.
- **UI Toggle**: A bell toggle icon button is available in the header. Permitting alerts highlights the icon in emerald green. Saves preferences to `localStorage`.

---

## 3. UI/UX Specifications & Styling Guidelines
- **Responsive Layout**: Designed for a maximum width of `max-w-3xl` (desktop), scaling down with margin-safe gutters for mobile devices.
- **Transitions**: CSS transitions are defined globally on background, colors, and layout shifts (250ms duration) to smooth switching between dark mode, routines, and views.
- **Typographic System**: Utilizes the premium Google Font `Inter` with varying font weights (`font-light` to `font-extrabold`) for clear content hierarchy.
