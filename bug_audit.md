# Bug Audit

## 1. Notification Misses due to Background Throttling
- **Bug:** Notifications for "10 minutes before class" and "class starting" are often missed. Dummy notifications (from setup) work, but real ones don't trigger reliably.
- **Root Cause:** The `checkUpcomingClassAlerts` logic relies on strict equality (`minutesDiff === 10` and `minutesDiff === 0`). The `setInterval` polling runs every 30 seconds. However, modern browsers throttle `setInterval` in background tabs (often to once per minute or more). If the interval triggers when `minutesDiff` is 9, the 10-minute check is completely missed.
- **Fix:** Use a range condition (`minutesDiff <= 10 && minutesDiff > 0`) combined with persistent tracking of sent notifications so it only sends once per interval but guarantees it triggers.

## 2. Volatile Notification State
- **Bug:** Restarting or refreshing the app clears the `sentNotifications` record, potentially causing duplicate alerts.
- **Root Cause:** `sentNotifications` is stored as an in-memory object (`let sentNotifications = {};`), which resets on page load.
- **Fix:** Persist `sentNotifications` in `localStorage` and implement a date-based cleanup.

## 3. Missing Notification Asset
- **Bug:** Notification popups may display broken images or fail silently.
- **Root Cause:** The `showNotification` function sets the `icon` and `badge` properties to a hardcoded `favicon.ico` which does not exist in the repository.
- **Fix:** Change the asset reference to an existing file, like `logo_dark_bg.png`.

## 4. Timezone Offset Bug in Cache Keys
- **Bug:** Notifications might trigger at incorrect days for users depending on their timezone.
- **Root Cause:** The notification cache key is generated using `now.toISOString().split('T')[0]`. `toISOString()` converts the time to UTC, which can shift the current date if the local timezone is ahead or behind UTC by several hours.
- **Fix:** Construct the date string using local date methods (`getFullYear()`, `getMonth()`, `getDate()`).

## 5. Brittle String Parsing
- **Bug:** The "Starts at: " display in the daily view timeline can show `undefined` or incorrect values if the time range uses a normal hyphen instead of an en-dash.
- **Root Cause:** In `renderDaySchedule`, it uses a hardcoded split: `cls.time.split(' – ')[0]`.
- **Fix:** Replace with a robust regular expression split `cls.time.split(/[-–—]/)[0].trim()`.