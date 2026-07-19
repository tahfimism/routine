# Improvement Audit v2

*Note: Previous improvements (Notifications, CSV Export, Custom Alerts, Personal Notes, Vacation Mode, Web Share) have been successfully implemented. This document outlines the next generation of potential frontend-only enhancements.*

## 1. Local Assignment & Deadline Tracker
- **Improvement:** Introduce a localized task manager (To-Do / Kanban) integrated directly into the dashboard, allowing users to bind assignments, quizzes, and project deadlines to specific courses.
- **Reasoning:** Students constantly juggle tasks alongside their routine. A task tracker that inherently understands their registered courses and visually flags upcoming deadlines right on the daily view cards provides immense utility without needing a backend server (`localStorage` only).

## 2. Interactive CGPA / Grade Estimator
- **Improvement:** Add a new module where students can input the credit hours for their courses (auto-populated from the routine if available) and dynamically calculate their expected semester GPA based on target grades.
- **Reasoning:** GPA calculation is a universal student need. A sleek, frontend calculator that saves their targets in `localStorage` keeps them engaged with the dashboard outside of active class hours.

## 3. Temporary Schedule Overrides (Makeup Classes)
- **Improvement:** Build a mechanism for users to inject a "one-off" makeup class or cancel a canceled class for a specific calendar date, seamlessly updating the live tracking and timeline UI for that day only.
- **Reasoning:** University schedules are rarely 100% static. Teachers often reschedule classes. Allowing local overrides ensures the dashboard's "Live Intelligence" banner remains accurate even when the base routine changes temporarily.

## 4. Built-in Pomodoro & Study Timer
- **Improvement:** Embed a minimalist Pomodoro focus timer that utilizes the same visual ring/progress bar aesthetics as the live class tracker.
- **Reasoning:** Since the app already acts as a time-management hub during classes, expanding this to cover self-study hours between classes makes the app useful 24/7. It requires no backend, just `setInterval` and `localStorage` for stats.

## 5. Routine Export to Image (Wallpaper Mode)
- **Improvement:** Utilize an HTML-to-Canvas library (or carefully crafted `@media print` CSS) to allow students to export their Weekly Grid View as a high-resolution, perfectly cropped PNG image.
- **Reasoning:** Many students prefer setting their routine as their phone lock screen wallpaper. Providing a 1-click native export to an aesthetically pleasing image caters directly to this behavioral habit.

## 6. Local Voice Memos (MediaRecorder API)
- **Improvement:** Integrate a small voice recorder inside the Class Details Modal using the native browser `MediaRecorder` API to record short lecture audio snippets.
- **Reasoning:** Pushes the boundaries of what a PWA can do offline. Audio Blobs can be recorded, played back, or downloaded directly from the browser's memory without hitting a server.
