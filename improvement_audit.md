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