# Improvement Audit v3

*Note: Previous improvements (Student Dashboard, CGPA Estimator, ToDo Tracker, Pomodoro Timer, Schedule Overrides, Export to Image) have been successfully implemented.*

## 1. AI Schedule Generator (On-Device)
- **Improvement:** Integrate a lightweight, on-device AI model (e.g., using WebNN or ONNX runtime for web) to suggest personalized study schedules based on the user's routine, deadlines, and Pomodoro history.
- **Reasoning:** Taking productivity to the next level without a backend. By analyzing when a student is most active and their upcoming deadlines, the browser can generate a dynamic, suggested daily study plan.

## 2. WebRTC Peer-to-Peer Routine Sync
- **Improvement:** Implement WebRTC to allow students to "bump" phones or share a local QR code to sync their schedule overrides (makeup classes) directly with classmates without a server.
- **Reasoning:** Since makeup classes are stored locally in `localStorage`, sharing them manually is tedious. WebRTC allows instant, offline-first sharing of overrides between peers in the same classroom.

## 3. Geolocation Auto-Mute
- **Improvement:** Utilize the Geolocation API to detect when a student is physically outside the university campus (e.g., at home or traveling) and automatically suppress class push notifications.
- **Reasoning:** If a student skips class and stays home, they likely don't want their phone buzzing every hour telling them a class is starting. A local geofence check before triggering the ServiceWorker notification solves this elegantly.

## 4. Dynamic Ambient Dark Mode
- **Improvement:** Move beyond a simple static `#121212` dark mode. Use the browser's Canvas API to extract the dominant colors from the current routine's branding (e.g., the EWU logo or DSA color palette) and create a highly desaturated, ambient dark mode background specifically tailored to that routine.
- **Reasoning:** Enhances the premium feel of the application. It provides a subtle, customized aesthetic for each routine while still preserving the battery-saving properties of OLED dark themes.

## 5. Routine Analytics & Heatmap
- **Improvement:** Build a GitHub-style contribution heatmap in the Student Dashboard that visualizes the user's Pomodoro focus time and Attendance records over the entire semester.
- **Reasoning:** Visualizing consistency is highly motivating for students. A calendar heatmap rendering locally via D3.js or a simple CSS grid provides immediate visual feedback on their academic dedication.