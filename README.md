# Product Requirement Document (PRD) & Project Specs: Class Routine Dashboard

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
- **Service Worker (`sw.js`)**: Registers on page load, caching core assets (`index.html`, `style.css`, `data.js`, `app.js`, `manifest.json`, and logo files).
- **Network-First Caching Strategy**: Uses a **Network-First falling back to Cache** strategy. When online, the app fetches fresh files from the network and updates the cache. When offline, it falls back to cache instantly. This guarantees students always see dynamic schedule edits immediately when online and retains offline loading.
- **PWA Manifest (`manifest.json`)**: Configures standard display properties, background colors, and start URLs to make the website fully installable as a native app.
- **Platform-Aware Install Prompts**:
  - *Android Chrome / Desktop*: Intercepts default browser prompts and displays a custom slide-up install promotion banner. Clicking "Install" fires the native browser trigger.
  - *iOS Safari*: Safari blocks programmatic prompts. The app displays manual instructions showing users how to tap Safari's Share sheet and select "Add to Home Screen".
  - *Session Dismissal*: Clicking "Dismiss" hides the banner and saves the state to `sessionStorage` to avoid prompting again in the same tab session.
- **Footer Installation Button**: In addition to the popups, a subtle "Install App" button is visible in the footer. Clicking it triggers the native install popup on Android, and launches the Safari help banner on iOS. It automatically hides when opened inside the installed standalone PWA.

### 2.8 Service Worker Push Notifications
- **Trigger Times**:
  - **10 Minutes Before Start**: Alerts the student with course code, name, start time, and room number so they have enough time to walk to the classroom.
  - **Exactly at Start Time**: Alerts the student that class is beginning now.
- **Mobile Background Support**: Dispatches alarms using the Service Worker registration context (`registration.showNotification()`) so that alerts trigger even when Safari/Chrome is closed or the phone screen is locked.
- **Duplicate Prevention**: Every alert creates a unique tracking key (e.g. `[Date]_[CourseCode]_10m` or `[Date]_[CourseCode]_start`) stored in a runtime registry, ensuring each warning triggers exactly once per day.
- **UI Toggle Control**: A notification toggle bell button is located in the header. Activating alerts requests permissions and highlights the bell in emerald green.

### 2.9 Tiny Features & Micro-UX Details
- **Next-Day Auto-Focus (After 5:00 PM)**:
  - If a student opens the routine after **5:00 PM (17:00)**, the dashboard automatically shifts the default active tab highlight to **tomorrow's schedule**. 
  - If tomorrow is a weekend (Friday or Saturday), the dashboard defaults to Sunday's routine. 
  - This ensures that in the evening, students immediately see what classes they have the next morning.
- **Fade-In Tab Animations**:
  - Toggling daily tabs or view modes triggers a smooth CSS fade-in animation, utilizing a browser reflow trick to restart the transition dynamically on every click.
- **Escape Key Dismissal**:
  - Pressing the `Escape` key on a keyboard instantly dismisses any active detail or settings modals.

---

## 3. Brand Logo Assets
The dashboard supports dynamic contrast icons:
- **Favicon**: Uses `logo_no_bg.svg` (transparent background icon) to sit cleanly inside browser tabs.
- **PWA Sizing Launchers**: Employs `logo_dark_bg.png` (high-quality PNG format, required by iOS Safari for home screen icons) and standard vector versions.
- **UI Branding**:
  - *Light Mode*: Displays `logo_dark_bg.svg` next to the header title and inside the install banner.
  - *Dark Mode*: Displays `logo_light_bg.svg` next to the header title and banner.

---

## 4. UI/UX Specifications & Styling Guidelines
- **Responsive Layout**: Designed for a maximum width of `max-w-3xl` (desktop), scaling down with margin-safe gutters for mobile devices.
- **Header Structure (Mobile-First)**:
  - *On Mobile (Phone)*: The App Logo and control toggles align horizontally on Row 1, and the active routine title block sits directly below it on Row 2 to ensure single-hand ergonomics.
  - *On Desktop*: Automatically shifts back to a single row (Title and Logo on the left, controls on the right).
- **Transitions**: CSS transitions are defined globally on background, colors, and layout shifts (250ms duration) to smooth switching between dark mode, routines, and views.
- **Typographic System**: Utilizes the premium Google Font `Inter` with varying font weights (`font-light` to `font-extrabold`) for clear content hierarchy.
