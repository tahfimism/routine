# Improvement Audit

## 1. LocalStorage for Sent Notifications
- **Improvement:** Migrate `sentNotifications` state tracking from volatile memory to persistent `localStorage`.
- **Reasoning:** In a PWA, users frequently open/close the app or let it sleep. In-memory variables are wiped on resume, potentially spamming duplicate alerts. Persistence guarantees accurate state. Accompanied by a daily cleanup mechanism to prevent `localStorage` bloat.

## 2. Dynamic Relative Messaging for Alerts
- **Improvement:** Instead of statically saying "Class starts in 10 minutes", calculate the exact remaining time (e.g., "Class starts in 8 minutes").
- **Reasoning:** Since we are moving to a windowed check (`<= 10 && > 0`), background throttling might delay the execution. If it triggers at 8 minutes, the message should accurately reflect that rather than falsely claiming 10.

## 3. Graceful Degradation in Notifications
- **Improvement:** Improve the Promise handling for service worker pushes by adding comprehensive try/catch fallbacks.
- **Reasoning:** Sometimes Service Worker registrations exist but are in a broken state. Proper try/catch around `showNotification` allows falling back gracefully to the standard browser `Notification` API.

## 4. More Resilient String Parsing
- **Improvement:** Adopt Regular Expressions `/[-–—]/` across the board where time strings are parsed.
- **Reasoning:** Datasets in `data.js` may have inconsistent characters (en-dashes vs. normal hyphens). Using regex ensures strings are parsed flawlessly regardless of the formatting.

## 5. Customizable Alert Times
- **Improvement:** Allow users to define when they receive class start alerts (e.g. 5, 10, or 15 minutes before) rather than a hardcoded 10-minute warning.
- **Reasoning:** Students who live farther from campus or need more time to transition between buildings would benefit from a customizable warning period. This value can be easily saved in `localStorage`.

## 6. Attendance Export to CSV
- **Improvement:** Add a button in the Attendance Stats modal to export the user's recorded attendance data to a `.csv` file.
- **Reasoning:** Allows students to keep a personal offline backup of their attendance data which currently lives only in `localStorage`. Simple frontend CSV generation using Blobs is lightweight and offline-friendly.

## 7. Class Specific Notes
- **Improvement:** Implement a feature in the Class Details Modal allowing users to add personal text notes (e.g. "Quiz next week", "Bring lab coat") for specific classes.
- **Reasoning:** Adds personal utility to the dashboard without requiring backend infrastructure. These notes can be bound to the `courseCode` and stored in `localStorage`.

## 8. Holiday/Vacation Mode Toggle
- **Improvement:** Introduce a "Vacation Mode" toggle in the Settings modal that temporarily suspends all PWA push notifications and visual live-ongoing indicators.
- **Reasoning:** During semester breaks or public holidays, students do not need class alerts. Rather than revoking notification permissions entirely, a toggle allows them to easily mute and unmute the dashboard.

## 9. Web Share API Integration
- **Improvement:** Utilize the native `navigator.share()` API to let users easily share the dashboard link or their specific routine link with classmates directly from the UI.
- **Reasoning:** Leverages modern web APIs to improve organic discoverability of the tool with a very small code footprint.
