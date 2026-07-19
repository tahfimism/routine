# Improvement Audit v4

*Note: Previous improvements (QR Sharing/Sync, Pomodoro Heatmap Analytics, Dashboard Restructuring) have been successfully implemented.*

## 1. AI Schedule Generator (On-Device)
- **Improvement:** Integrate a lightweight, on-device AI model (e.g., using WebNN or ONNX runtime for web) to suggest personalized study schedules based on the user's routine, deadlines, and Pomodoro history.
- **Reasoning:** Taking productivity to the next level without a backend. By analyzing when a student is most active and their upcoming deadlines, the browser can generate a dynamic, suggested daily study plan.

## 2. Geolocation Auto-Mute
- **Improvement:** Utilize the Geolocation API to detect when a student is physically outside the university campus (e.g., at home or traveling) and automatically suppress class push notifications.
- **Reasoning:** If a student skips class and stays home, they likely don't want their phone buzzing every hour telling them a class is starting. A local geofence check before triggering the ServiceWorker notification solves this elegantly.

## 3. Dynamic Ambient Dark Mode
- **Improvement:** Move beyond a simple static `#121212` dark mode. Use the browser's Canvas API to extract the dominant colors from the current routine's branding (e.g., the EWU logo or DSA color palette) and create a highly desaturated, ambient dark mode background specifically tailored to that routine.
- **Reasoning:** Enhances the premium feel of the application. It provides a subtle, customized aesthetic for each routine while still preserving the battery-saving properties of OLED dark themes.

## 4. Offline Course Materials Vault
- **Improvement:** Allow users to upload and store small PDF/text notes directly into the browser's IndexedDB, linked to specific course cards.
- **Reasoning:** Enhances the offline-first capability of the app, turning it into a true all-in-one student hub. Files are stored entirely on the device, eliminating the need for cloud hosting.

## 5. Mobile Swipe Gestures
- **Improvement:** Integrate a lightweight gesture library (like Hammer.js) to allow users to swipe left and right on the daily feed view to switch between days seamlessly.
- **Reasoning:** Tapping small tabs at the top can be unergonomic on large modern smartphones. Native-feeling swipe navigation vastly improves the mobile UX.

## 6. Override Conflict Detection
- **Improvement:** When saving a schedule override, add a local validation step to check if the new time range overlaps with any existing base routine classes or other overrides.
- **Reasoning:** Prevents user error. The app should intelligently warn the user if they accidentally book a makeup class on top of an already running sessional class.

## 7. Context Menu for Quick Actions
- **Improvement:** Implement a long-press (or right-click) custom context menu on routine cards for quick actions like "Mark Attendance", "Add Override", or "View Notes".
- **Reasoning:** Reduces the number of clicks required to access frequent actions, streamlining the interface and appealing to power users.

## 8. Haptic Feedback Integration
- **Improvement:** Use the `navigator.vibrate()` API to provide subtle haptic bumps when toggling views, starting a Pomodoro, or marking attendance.
- **Reasoning:** Micro-interactions build a premium feel. Haptics provide tactile confirmation of actions, enhancing the overall user experience on mobile devices without adding any visual clutter.
