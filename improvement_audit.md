# Improvement Audit v5

*Note: Previous improvements (QR Sharing/Sync, Pomodoro Heatmap, Dashboard Restructuring, Swipe Gestures, Override Validation, Context Menus, Haptics) have been successfully implemented.*

## Core & Next-Level Productivity
1. **AI Schedule Generator (On-Device)**: Use WebNN/ONNX runtime to suggest personalized daily study plans based on Pomodoro history and To-Do deadlines.
2. **Offline Course Materials Vault**: Let users upload PDF/text notes into IndexedDB, linking them to specific course cards for offline viewing.
3. **Routine Analytics & Heatmap v2**: Add deep statistical breakdowns (e.g., "Most productive day", "Average CGPA drift") powered by Chart.js.
4. **Geolocation Auto-Mute**: Use Geolocation API to detect if the student is off-campus and auto-suppress class start notifications.
5. **Dynamic Ambient Dark Mode**: Use Canvas API to extract dominant branding colors from routine datasets and create customized, desaturated OLED dark themes.

## UX & Micro-Interactions
6. **Drag-and-Drop ToDos**: Allow users to reorder their tasks in the Student Dashboard using the native HTML5 drag-and-drop API.
7. **PWA Install Promotion Redesign**: Replace the generic PWA install banner with an animated, full-screen onboarding walkthrough mimicking native iOS apps.
8. **Double-Tap to Like/Save Note**: Add Instagram-style double-tap gestures on Class Cards to instantly pop open the Personal Notes area.
9. **Dynamic Favicon Status**: Change the browser tab Favicon dynamically (e.g., red circle when a class is ongoing, green check when done).
10. **Sound Effects for Pomodoro**: Add very subtle, premium sound effects (via Web Audio API) for starting/stopping the timer and finishing a session.
11. **Pull-to-Refresh Sync**: On mobile, add a pull-to-refresh gesture at the top of the feed to immediately trigger a sync check for updated overrides.
12. **Confetti on Perfect Attendance**: Fire a canvas-based confetti animation when a user achieves 100% attendance in a course over 30 days.

## Accessibility & Utility
13. **Screen Reader (ARIA) Overhaul**: Systematically review all generated HTML elements and enforce strict ARIA labels, live regions, and semantic roles for vision-impaired users.
14. **High-Contrast "Sunny Day" Mode**: Add a third theme option designed specifically for extreme outdoor glare (pure white background, pure black text, thickened borders).
15. **Offline Export to PDF**: Expand the `html2canvas` image export to generate a multipage PDF syllabus using `jsPDF`.
16. **Pomodoro Tagging**: Allow users to tag their Pomodoro sessions with specific course codes so they can see which subjects they spend the most time studying.
17. **Routine Search Bar**: Add a fast, fuzzy-search input field at the top of the feed to instantly filter the daily list by course code or teacher name.
18. **Custom Break Timers**: Allow users to customize not just the class alert times, but the Pomodoro break duration (e.g., 5 min vs 15 min).
19. **Battery-Saver Mode**: Introduce a setting that disables all `setInterval` UI polling, live progress bars, and CSS animations to preserve phone battery.
20. **Teacher Directory Explorer**: Create a standalone view in the dashboard that lists all teacher acronyms and full names with mailto: links (if available).

## New UI/UX Ideas
21. **Focus Outline Accessibility**: Improve keyboard navigation by replacing default browser focus rings with custom, high-contrast, rounded focus rings using existing Tailwind utilities (`focus-visible:ring-emerald-500/50`).
22. **Empty State Illustrations**: Add subtle, minimalist SVG illustrations or icons for empty states (e.g., when no tasks are present in the To-Do list, or when a day has no classes).
23. **Smooth Scroll to Active Class**: Upon loading the daily view, automatically scroll the page to center the currently active class card on the screen.
24. **Skeleton Loading States**: Implement a lightweight CSS skeleton loader animation instead of a blank screen when transitioning between heavy UI views or parsing large routine files.
