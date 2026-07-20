# UI/UX Improvement Audit
This document catalogs tiny, non-intrusive UI and UX improvements that enhance user experience, accessibility, and visual aesthetics. These align with the minimalist "Cream/Charcoal" 60-30-10 palette.

## Visual Polish
1. **Empty State Illustrations**: Add minimalist SVG icons for empty lists (e.g., "No classes today" or empty To-Do lists) to make the UI feel less stark.
2. **Skeleton Loaders**: Implement CSS-based skeleton loaders when switching views or parsing data to reduce perceived latency.
3. **Subtle Shadows on Hover**: Enhance interactivity by slightly increasing shadow depth (`shadow-md`) or borders when hovering over clickable cards.
4. **Transition Durations**: Ensure all interactive elements (buttons, toggles, cards) have consistent `transition-all duration-200` to prevent abrupt state changes.

## User Experience (UX)
5. **Auto-Scroll to Active Class**: When opening the Daily View, auto-scroll the window slightly so the currently ongoing class is centered on the screen.
6. **Toast Notifications**: Replace standard `alert()` or `confirm()` browser dialogs with a lightweight, non-blocking toast notification system (e.g., "Overrides saved!").
7. **Input Validation Feedback**: Provide immediate red/green subtle borders on input fields (like the Add Override time field) as the user types to prevent invalid format errors on submission.
8. **Dismissible Banners**: Allow the user to dismiss the "Weekend/No Classes" top banner so they can reclaim screen real estate if desired.

## Accessibility (a11y)
9. **Focus Visibility**: Standardize the focus ring across all interactive elements (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50`).
10. **ARIA Labels for Icons**: Ensure every standalone SVG icon (like the edit/delete buttons) has a corresponding `aria-label` or `.sr-only` text for screen readers.
11. **Color Contrast Verification**: Ensure text on the primary accent color (Emerald) meets WCAG 2.1 AA contrast ratios in both light and dark modes.
12. **Escape Key Handling**: Guarantee that pressing the `Escape` key closes *all* active modals, custom dropdowns, and context menus.
