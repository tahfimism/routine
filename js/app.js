let currentDayTab = "Sun";
let currentViewMode = "daily"; // "daily" or "weekly"
let realTimeInterval = null;

// Registry reference variables
let activeRoutineId = 'ece_2_1';
let currentRoutine = null;

// Notification Alert States
let notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
let alertTimeOffset = parseInt(localStorage.getItem('alert_time_offset') || '10', 10);
let vacationMode = localStorage.getItem('vacation_mode') === 'true';
let sentNotifications = {};
try {
    const saved = localStorage.getItem('sent_notifications');
    if (saved) {
        sentNotifications = JSON.parse(saved);

        // Clean up old notifications from previous days
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        let cleaned = false;
        for (const key in sentNotifications) {
            if (!key.startsWith(dateStr)) {
                delete sentNotifications[key];
                cleaned = true;
            }
        }
        if (cleaned) {
            localStorage.setItem('sent_notifications', JSON.stringify(sentNotifications));
        }
    }
} catch (e) {
    console.error("Error parsing sentNotifications", e);
}

// PWA Install Prompt State
let deferredPrompt = null;

// Attendance Data State
// Format: { "routineId": { "courseCode": { "YYYY-MM-DD": "present" | "absent" } } }
let attendanceData = {};
try {
    const savedAttendance = localStorage.getItem('attendance_data_v1');
    if (savedAttendance) {
        attendanceData = JSON.parse(savedAttendance);
    }
} catch (e) {
    console.error("Error parsing attendanceData", e);
}

function saveAttendanceData() {
    localStorage.setItem('attendance_data_v1', JSON.stringify(attendanceData));
}

// Personal Notes State
let personalNotesData = {};
try {
    const savedNotes = localStorage.getItem('personal_notes_v1');
    if (savedNotes) {
        personalNotesData = JSON.parse(savedNotes);
    }
} catch (e) {
    console.error("Error parsing personalNotesData", e);
}

function savePersonalNotesData() {
    localStorage.setItem('personal_notes_v1', JSON.stringify(personalNotesData));
}

// Haptic Feedback Helper
window.triggerHaptic = function(type = 'light') {
    if (navigator.vibrate) {
        if (type === 'heavy') navigator.vibrate([40, 30, 40]);
        else navigator.vibrate(20);
    }
};

// Context Menu Logic
let contextMenuTarget = null;
window.openContextMenu = function(e, dayKey, index) {
    e.preventDefault();
    contextMenuTarget = { dayKey, index };
    const menu = document.getElementById('custom-context-menu');
    if (!menu) return;
    
    // Position menu near cursor
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    
    // Show menu
    menu.classList.remove('hidden');
    menu.offsetHeight; // force reflow
    menu.classList.remove('opacity-0', 'scale-95');
    menu.classList.add('opacity-100', 'scale-100');
};

window.contextAction = function(action) {
    if (!contextMenuTarget) return;
    const { dayKey, index } = contextMenuTarget;
    
    // Hide menu
    const menu = document.getElementById('custom-context-menu');
    if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('opacity-100', 'scale-100');
    }

    if (action === 'attendance' || action === 'notes') {
        openClassModal(dayKey, index);
    } else if (action === 'override') {
        openStudentDashboard();
    }
    
    contextMenuTarget = null;
};

// Toast Notification System
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isError = type === 'error';
    const bg = isError ? 'bg-rose-500' : 'bg-neutral-800 dark:bg-neutral-100';
    const text = isError ? 'text-white' : 'text-white dark:text-neutral-900';
    
    toast.className = `${bg} ${text} px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 toast-enter pointer-events-auto`;
    toast.innerHTML = `
        ${isError ? 
            `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` 
            : `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`
        }
        <span>${message}</span>
    `;

    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Override default alert
window.alert = function(msg) {
    const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('blocked');
    showToast(msg, isError ? 'error' : 'info');
};

// Time Validation Handler
window.validateOverrideTime = function(input) {
    const val = input.value.trim();
    if (!val) {
        input.classList.remove('border-red-500', 'border-emerald-500');
        input.classList.add('border-cream-border', 'dark:border-charcoal-border');
        return;
    }
    const regex = /^([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM))\s*[-–—]\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM))$/i;
    if (regex.test(val)) {
        input.classList.remove('border-red-500', 'border-cream-border', 'dark:border-charcoal-border');
        input.classList.add('border-emerald-500');
    } else {
        input.classList.remove('border-emerald-500', 'border-cream-border', 'dark:border-charcoal-border');
        input.classList.add('border-red-500');
    }
};

// Dismissible Banner Logic
window.dismissCountdownBanner = function() {
    sessionStorage.setItem('countdown_banner_dismissed', new Date().toDateString());
    const banner = document.getElementById('countdown-banner');
    if (banner) banner.classList.add('hidden');
};

// Global Escape Key Handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (typeof closeSettingsModal === 'function') closeSettingsModal();
        if (typeof closeModal === 'function') closeModal();
        if (typeof closeStudentDashboard === 'function') closeStudentDashboard();
        if (typeof dismissPwaBanner === 'function') dismissPwaBanner();
        const menu = document.getElementById('custom-context-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            menu.classList.remove('opacity-100', 'scale-100');
            contextMenuTarget = null;
        }
    }
});

// Helper to get a date string for a given day in the current week (Sun-Thu)
function getDateForDayTab(dayKey) {
    const today = new Date();
    const currentDayIdx = today.getDay(); // 0 is Sunday, 1 is Monday...
    const baseSunday = new Date(today);
    baseSunday.setDate(today.getDate() - currentDayIdx);

    const dayOffsets = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    const targetDate = new Date(baseSunday);
    targetDate.setDate(baseSunday.getDate() + (dayOffsets[dayKey] || 0));

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Calculate attendance stats for a specific course in the current routine
function getCourseAttendanceStats(courseCode) {
    if (!activeRoutineId) return { present: 0, absent: 0, total: 0, percentage: 0 };

    const routineAttendance = attendanceData[activeRoutineId] || {};
    const courseAttendance = routineAttendance[courseCode] || {};

    let present = 0;
    let absent = 0;

    Object.values(courseAttendance).forEach(status => {
        if (status === 'present') present++;
        if (status === 'absent') absent++;
    });

    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percentage };
}

// Mark attendance for a course on a specific date
function markAttendance(courseCode, dateStr, status) {
    if (!activeRoutineId) return;

    if (!attendanceData[activeRoutineId]) {
        attendanceData[activeRoutineId] = {};
    }
    if (!attendanceData[activeRoutineId][courseCode]) {
        attendanceData[activeRoutineId][courseCode] = {};
    }

    if (status === null || status === undefined) {
        delete attendanceData[activeRoutineId][courseCode][dateStr];
    } else {
        attendanceData[activeRoutineId][courseCode][dateStr] = status;
    }

    saveAttendanceData();
}

// DOM Loaded Init
window.addEventListener('DOMContentLoaded', () => {
    // Check if query parameter 'r' is present and matches a valid routine id
    const urlParams = new URLSearchParams(window.location.search);

    // Check for incoming overrides sync data
    const syncParam = urlParams.get('import_overrides');
    if (syncParam) {
        try {
            const importedData = JSON.parse(decodeURIComponent(atob(syncParam)));
            const confirmImport = confirm(`Import ${Object.keys(importedData).length} days of schedule overrides?`);
            if (confirmImport) {
                // Merge into current routine's overrides
                const currentRoutineId = localStorage.getItem('active_routine_id') || 'ece21';
                if (!overridesData[currentRoutineId]) overridesData[currentRoutineId] = {};

                for (const date in importedData) {
                    overridesData[currentRoutineId][date] = importedData[date];
                }
                saveOverrides();
                alert('Overrides successfully imported!');
            }

            // Clean URL
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + (urlParams.get('r') ? `?r=${urlParams.get('r')}` : '');
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        } catch (e) {
            console.error("Failed to parse imported overrides", e);
            alert("Invalid sync link.");
        }
    }

    const rParam = urlParams.get('r');
    
    const routinesList = Object.values(routines);
    const defaultRoutine = routinesList[0] || { id: 'ece21', data: {} };
    
    let targetRoutine = null;
    if (rParam) {
        targetRoutine = routinesList.find(r => r.id === rParam);
    }
    
    if (targetRoutine) {
        // Save to localStorage
        localStorage.setItem('active_routine_id', targetRoutine.id);
        activeRoutineId = targetRoutine.id;
        currentRoutine = targetRoutine;
        
        // Clean URL to look professional
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else {
        // Fallback to localStorage or default
        const savedId = localStorage.getItem('active_routine_id');
        targetRoutine = routinesList.find(r => r.id === savedId) || defaultRoutine;
        activeRoutineId = targetRoutine.id;
        currentRoutine = targetRoutine;
    }
    
    // Inject dynamic header titles & color palette
    updateHeaderTitles();
    applyRoutinePalette(currentRoutine);
    
    setupInitialDay();
    setupTheme();
    renderDaySchedule(currentDayTab);
    updateNotificationUI();
    updateViewModeUI();
    
    // Start the Routine Intelligence real-time updater
    startRealTimeTracker();
    
    // Handle tab visibility change to instantly update states
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateRealTimeStatus();
        }
    });

    // Add global escape key listener to close modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeSettingsModal();
            closeUserSettingsModal();
            closeShareOverridesModal();
        }
    });

    // Setup secret settings modal access (triple click routine title)
    let titleClickCount = 0;
    let titleClickTimeout = null;
    const titleEl = document.getElementById('routine-title');
    if (titleEl) {
        titleEl.classList.add('select-none', 'cursor-default');
        titleEl.addEventListener('click', () => {
            titleClickCount++;
            if (titleClickTimeout) clearTimeout(titleClickTimeout);
            titleClickTimeout = setTimeout(() => {
                titleClickCount = 0;
            }, 1000);
            if (titleClickCount === 3) {
                titleClickCount = 0;
                clearTimeout(titleClickTimeout);
                openSettingsModal();
            }
        });
    }

    // Register Service Worker for PWA installation and background notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('Service Worker registered successfully:', reg.scope);
        }).catch((err) => {
            console.warn('Service Worker registration failed:', err);
        });
    }

    // Setup footer PWA install action triggers
    const footerInstallBtn = document.getElementById('pwa-footer-install-btn');
    if (footerInstallBtn) {
        footerInstallBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    dismissPwaBanner();
                    footerInstallBtn.classList.add('hidden');
                });
            } else {
                // For iOS or browsers without a direct prompt event, open our custom guidance dialog
                sessionStorage.removeItem('pwa_banner_dismissed'); // Force show banner again
                const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                showPwaBanner(isiOS ? 'ios' : 'android');
            }
        });
    }

    // Capture standard PWA install prompts (Android Chrome / Desktop Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); // Prevent standard mini-infobar prompt
        deferredPrompt = e;
        showPwaBanner('android');
        if (footerInstallBtn) footerInstallBtn.classList.remove('hidden');
    });

    // Check if device is iOS and not already running in installed standalone app
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    if (isiOS && !isStandalone) {
        showPwaBanner('ios');
        if (footerInstallBtn) footerInstallBtn.classList.remove('hidden');
    }

    // Initialize Swipe Gestures on Daily View
    const dailyView = document.getElementById('daily-view-section');
    if (dailyView && typeof Hammer !== 'undefined') {
        const mc = new Hammer(dailyView);
        mc.on("swipeleft swiperight", (ev) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
            let currentIndex = days.indexOf(currentDayTab);
            if (currentIndex === -1) return;

            if (ev.type === "swipeleft" && currentIndex < days.length - 1) {
                switchTab(days[currentIndex + 1]);
            } else if (ev.type === "swiperight" && currentIndex > 0) {
                switchTab(days[currentIndex - 1]);
            }
        });
    }

    // Global click listener to hide context menu
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('custom-context-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            menu.classList.remove('opacity-100', 'scale-100');
        }
    });

    // Pull to Refresh Logic
    let touchStartY = 0;
    let ptrIndicator = document.getElementById('ptr-indicator');
    let ptrIcon = document.getElementById('ptr-icon');
    let isRefreshing = false;

    document.addEventListener('touchstart', e => {
        if (window.scrollY === 0 && !isRefreshing) {
            touchStartY = e.touches[0].clientY;
        }
    }, {passive: true});

    document.addEventListener('touchmove', e => {
        if (window.scrollY === 0 && !isRefreshing && touchStartY > 0) {
            const touchY = e.touches[0].clientY;
            const pullDistance = touchY - touchStartY;

            if (pullDistance > 0 && ptrIndicator) {
                const translateY = Math.min(pullDistance - 64, 20); // max pull visual limit
                ptrIndicator.style.transform = `translateY(${translateY}px)`;

                if (pullDistance > 80) {
                    ptrIcon.classList.add('rotate-180');
                } else {
                    ptrIcon.classList.remove('rotate-180');
                }
            }
        }
    }, {passive: true});

    document.addEventListener('touchend', e => {
        if (window.scrollY === 0 && !isRefreshing && touchStartY > 0) {
            const touchY = e.changedTouches[0].clientY;
            const pullDistance = touchY - touchStartY;

            if (pullDistance > 80 && ptrIndicator) {
                isRefreshing = true;
                triggerHaptic('heavy');
                document.getElementById('ptr-text').innerText = "Syncing...";
                ptrIcon.classList.add('animate-spin');

                // Simulate sync
                setTimeout(() => {
                    updateRealTimeStatus();
                    if (currentViewMode === 'daily') renderDaySchedule(currentDayTab);
                    else renderWeeklyGrid();

                    document.getElementById('ptr-text').innerText = "Synced!";
                    ptrIcon.classList.remove('animate-spin');
                    triggerHaptic('light');

                    setTimeout(() => {
                        ptrIndicator.style.transform = `translateY(-100%)`;
                        isRefreshing = false;
                        setTimeout(() => {
                            document.getElementById('ptr-text').innerText = "Pull to refresh";
                        }, 300);
                    }, 500);
                }, 800);
            } else if (ptrIndicator) {
                ptrIndicator.style.transform = `translateY(-100%)`;
            }
            touchStartY = 0;
        }
    });
});

// Update the main header title and subtitle dynamically
function updateHeaderTitles() {
    const titleEl = document.getElementById('routine-title');
    const subtitleEl = document.getElementById('routine-subtitle');
    if (titleEl && currentRoutine) {
        titleEl.innerText = currentRoutine.name;
    }
    if (subtitleEl && currentRoutine) {
        subtitleEl.innerText = currentRoutine.subtitle;
    }
}

// Apply custom CSS variable overrides for light-mode if specified
function applyRoutinePalette(routine) {
    const root = document.documentElement;
    if (routine && routine.palette) {
        root.style.setProperty('--cream-bg', routine.palette.bg);
        root.style.setProperty('--cream-card', routine.palette.card);
        root.style.setProperty('--cream-border', routine.palette.border);
        root.style.setProperty('--cream-text', routine.palette.text);
        root.style.setProperty('--cream-muted', routine.palette.muted);
    } else {
        // Clear style overrides to revert to standard cream colors
        root.style.removeProperty('--cream-bg');
        root.style.removeProperty('--cream-card');
        root.style.removeProperty('--cream-border');
        root.style.removeProperty('--cream-text');
        root.style.removeProperty('--cream-muted');
    }
}

// Determine current system day to auto-select
function setupInitialDay() {
    const now = new Date();
    let todayIndex = now.getDay();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // If it is after 5 PM (17:00), shift default view to the next day
    if (now.getHours() >= 17) {
        todayIndex = (todayIndex + 1) % 7;
    }
    
    let targetDay = dayMap[todayIndex];
    
    // Only auto-focus on academic days. Friday & Saturday fallback to Sunday.
    const academicDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    if (academicDays.includes(targetDay)) {
        currentDayTab = targetDay;
    } else {
        currentDayTab = "Sun";
    }
}

// Handle Active Tabs rendering
function switchTab(dayKey) {
    currentDayTab = dayKey;
    triggerHaptic('light');
    
    // Restart fade-in animation
    const timelineWrapper = document.getElementById('daily-timeline-wrapper');
    if (timelineWrapper) {
        timelineWrapper.classList.remove('animate-fade-in');
        timelineWrapper.offsetWidth; // Force browser layout reflow
        timelineWrapper.classList.add('animate-fade-in');
    }
    
    renderDaySchedule(dayKey);
}

// Time Parsing Helper Utilities
function parseTime(timeStr) {
    const trimmed = timeStr.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return { hours: 0, minutes: 0 };
    const timeVal = parts[0];
    const modifier = parts[1].toUpperCase();
    
    let [hours, minutes] = timeVal.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    return { hours, minutes };
}

function parseRange(rangeStr) {
    // Replace en-dashes/em-dashes with standard hyphens
    const parts = rangeStr.replace(/–|—/g, '-').split('-').map(s => s.trim());
    if (parts.length < 2) return null;
    const start = parseTime(parts[0]);
    const end = parseTime(parts[1]);
    return {
        startMin: start.hours * 60 + start.minutes,
        endMin: end.hours * 60 + end.minutes,
        startStr: parts[0],
        endStr: parts[1]
    };
}

// Routine Intelligence - Ongoing Class and Countdown Banner Tracker
function startRealTimeTracker() {
    updateRealTimeStatus();
    // Poll updates every 30 seconds
    if (realTimeInterval) clearInterval(realTimeInterval);
    realTimeInterval = setInterval(updateRealTimeStatus, 30000);
}

function updateRealTimeStatus() {
    if (!currentRoutine) return;
    
    const banner = document.getElementById('countdown-banner');
    const content = document.getElementById('countdown-content');
    if (!banner || !content) return;

    const isDismissed = sessionStorage.getItem('countdown_banner_dismissed') === new Date().toDateString();

    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
    const academicDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const isAcademic = academicDays.includes(currentDay);
    
    // Check class alert triggers
    checkUpcomingClassAlerts();

    // If we're on the Daily view, update the card styles live
    if (currentViewMode === 'daily') {
        renderDaySchedule(currentDayTab);
    }
    
    if (isDismissed) {
        banner.classList.add('hidden');
        return;
    }

    if (vacationMode) {
        content.innerHTML = `
            <svg class="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
            </svg>
            <span class="text-emerald-700 dark:text-emerald-400">Vacation Mode Active - Notifications & Live Tracking Paused</span>
        `;
        banner.classList.remove('hidden');
        return;
    }

    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
    const academicDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const isAcademic = academicDays.includes(currentDay);
    
    // Check class alert triggers
    checkUpcomingClassAlerts();

    // If we're on the Daily view, update the card styles live
    if (currentViewMode === 'daily') {
        renderDaySchedule(currentDayTab);
    }

    // 1. Weekend / Off-Hours Greeting Banner State
    if (!isAcademic) {
        let firstSunTime = '08:50 AM';
        if (currentRoutine.data["Sun"]?.[0]) {
            firstSunTime = currentRoutine.data["Sun"][0].time.split(/[-–—]/)[0].trim();
        }
        content.innerHTML = `
            <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Enjoy your weekend! Sunday classes start at ${firstSunTime}.</span>
        `;
        banner.classList.remove('hidden');
        return;
    }

    const dayClasses = getEffectiveClassesForDay(currentDay);
    if (dayClasses.length === 0) {
        content.innerHTML = `
            <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>No classes scheduled for today. Enjoy your day!</span>
        `;
        banner.classList.remove('hidden');
        return;
    }

    let activeClass = null;
    let nextClass = null;
    let nextClassMinDiff = Infinity;

    dayClasses.forEach(cls => {
        const range = parseRange(cls.time);
        if (!range) return;

        if (currentMin >= range.startMin && currentMin < range.endMin) {
            activeClass = {
                data: cls,
                remaining: range.endMin - currentMin
            };
        } else if (range.startMin > currentMin) {
            const diff = range.startMin - currentMin;
            if (diff < nextClassMinDiff) {
                nextClassMinDiff = diff;
                nextClass = {
                    data: cls,
                    minUntil: diff
                };
            }
        }
    });

    // 2. Active Class Banner State
    if (activeClass) {
        content.innerHTML = `
            <span class="flex h-2 w-2 relative flex-shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-400">
                Live Now: <span class="font-bold">${activeClass.data.code}</span> (${activeClass.remaining} mins remaining)
            </span>
        `;
        banner.classList.remove('hidden');
        return;
    }

    // 3. Upcoming Class Countdown Banner State
    if (nextClass) {
        const firstTimeStr = nextClass.data.time.split(/[-–—]/)[0].trim();
        if (nextClass.minUntil <= 60) {
            content.innerHTML = `
                <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Next class (<span class="font-bold">${nextClass.data.code}</span>) starts in ${nextClass.minUntil} minutes.</span>
            `;
        } else {
            content.innerHTML = `
                <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Class schedule starts today at ${firstTimeStr}. First class: <span class="font-bold">${nextClass.data.code}</span>.</span>
            `;
        }
        banner.classList.remove('hidden');
        return;
    }

    // 4. Evening/All Classes Completed State
    content.innerHTML = `
        <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>All classes completed for today. Enjoy your evening!</span>
    `;
    banner.classList.remove('hidden');
}

// Render schedule items elegantly
function renderDaySchedule(dayKey) {
    if (!currentRoutine) return;
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.id === `tab-${dayKey}`) {
            btn.className = "tab-btn py-3 text-sm font-bold tracking-wide transition-all relative border-b-2 border-cream-text dark:border-charcoal-text text-cream-text dark:text-charcoal-text shrink-0";
        } else {
            btn.className = "tab-btn py-3 text-sm font-semibold tracking-wide transition-all relative border-b-2 border-transparent text-cream-muted dark:text-charcoal-muted hover:text-cream-text dark:hover:text-charcoal-text shrink-0";
        }
    });

    const timeline = document.getElementById('classes-timeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    const dayClasses = getEffectiveClassesForDay(dayKey);
    
    // Empty state
    if (dayClasses.length === 0) {
        timeline.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <svg class="w-16 h-16 text-cream-muted dark:text-charcoal-muted mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <p class="text-sm font-semibold text-cream-text dark:text-charcoal-text">No classes today!</p>
                <p class="text-xs text-cream-muted dark:text-charcoal-muted mt-1">Take a break or add a task to your To-Do list.</p>
            </div>
        `;
        const dayInfo = document.getElementById('day-info');
        if (dayInfo) dayInfo.classList.add('hidden');
        
        // Still render today's tasks even if classes are empty
        renderTodaysTasksWidget(dayKey);
        return;
    }

    // Dynamic starts-at time calculation
    const dayInfo = document.getElementById('day-info');
    if (dayInfo) {
        if (dayClasses.length > 0) {
            const firstTime = dayClasses[0].time.split(/[-–—]/)[0].trim();
            dayInfo.innerHTML = `
                <svg class="w-3.5 h-3.5 text-cream-muted dark:text-charcoal-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Starts at: ${firstTime}</span>
            `;
            dayInfo.classList.remove('hidden');
        } else {
            dayInfo.classList.add('hidden');
        }
    }

    if (dayClasses.length === 0) {
        timeline.innerHTML = `
            <div class="py-12 text-center text-sm text-cream-muted dark:text-charcoal-muted font-medium">
                No classes scheduled for today.
            </div>
        `;
        return;
    }

    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentSystemDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();

    let lastEndMin = null;

    dayClasses.forEach((cls, index) => {
        const range = parseRange(cls.time);

        // Render break if there is a gap between this class and the previous one
        if (lastEndMin !== null && range) {
            const gapMin = range.startMin - lastEndMin;
            if (gapMin > 0) {
                let breakText = '';
                if (gapMin >= 60) {
                    const hrs = Math.floor(gapMin / 60);
                    const mins = gapMin % 60;
                    breakText = `${hrs}h ${mins > 0 ? mins + 'm' : ''} Break`;
                } else {
                    breakText = `${gapMin}m Break`;
                }

                timeline.innerHTML += `
                    <div class="flex items-center my-3 select-none py-1 animate-fade-in">
                        <div class="flex-grow border-t border-dashed border-cream-border/60 dark:border-charcoal-border/50"></div>
                        <span class="px-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-cream-bg dark:bg-charcoal-bg transition-all">
                            ☕ ${breakText}
                        </span>
                        <div class="flex-grow border-t border-dashed border-cream-border/60 dark:border-charcoal-border/50"></div>
                    </div>
                `;
            }
        }

        if (range) {
            lastEndMin = range.endMin;
        }

        const isSessional = cls.type === 'Sessional';
        let pillTheme = isSessional 
            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
            : 'text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/40';

        // Check if class is live *right now*
        let isLive = false;
        let elapsedMins = 0;
        let remainingMins = 0;
        let progressPercent = 0;

        if (!vacationMode && dayKey === currentSystemDay) {
            if (range && currentMin >= range.startMin && currentMin < range.endMin) {
                isLive = true;
                elapsedMins = currentMin - range.startMin;
                const totalMins = range.endMin - range.startMin;
                progressPercent = Math.min(100, Math.max(0, (elapsedMins / totalMins) * 100));
                remainingMins = range.endMin - currentMin;
            }
        }

        // Apply dynamic highlighting classes for live ongoing card
        const cardBorderTheme = isLive 
            ? 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/5 ring-1 ring-emerald-500/10 shadow-md'
            : 'border-cream-border dark:border-charcoal-border hover:border-neutral-300 dark:hover:border-neutral-700';

        // Render card layout (displays code + title)
        timeline.innerHTML += `
            <div role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openClassModal('${dayKey}', ${index}); }" onclick="openClassModal('${dayKey}', ${index})" oncontextmenu="openContextMenu(event, '${dayKey}', ${index})" class="schedule-card bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-5 cursor-pointer transition duration-250 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <span class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${pillTheme}">
                                ${cls.type}
                            </span>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-cream-text dark:text-charcoal-text leading-tight flex items-center gap-1.5">
                                ${cls.code} &bull; ${cls.name}
                                ${isLive ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" title="Live ongoing class"></span>` : ''}
                            </h3>
                            <p class="text-xs text-cream-muted dark:text-charcoal-muted mt-1 font-medium">
                                ${cls.instructors && cls.instructors.length > 0 ? `Instructors: ${cls.instructors.join(' &bull; ')}` : 'Instructors: N/A'}
                                ${cls.group ? `<span class="text-neutral-400 dark:text-neutral-600 font-normal"> | </span><span class="text-amber-600 dark:text-amber-400 font-semibold">${cls.group}</span>` : ''}
                            </p>
                        </div>
                    </div>
                    <div class="text-left sm:text-right shrink-0">
                        <span class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-tight font-sans">
                            ${cls.time}
                        </span>
                    </div>
                </div>
                ${isLive ? `
                    <div class="mt-3.5 w-full bg-neutral-200/50 dark:bg-neutral-800/80 rounded-full h-1 overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="flex justify-between items-center mt-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span class="flex items-center gap-1">
                            <span class="w-1 h-1 rounded-full bg-emerald-500 pulse-live"></span>
                            Ongoing (${elapsedMins}m elapsed)
                        </span>
                        <span>${remainingMins}m remaining</span>
                    </div>
                ` : ''}
            </div>
        `;
    });

    // Auto-scroll to active class if available
    setTimeout(() => {
        const liveCard = timeline.querySelector('.border-emerald-500\\/50');
        if (liveCard) {
            liveCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);

    // Populate Today's Tasks widget
    const dateStr = getDateForDayTab(dayKey);
    const dayTasks = todosData.filter(t => t.deadline === dateStr && !t.done);
    const tasksWidget = document.getElementById('daily-tasks-widget');
    const tasksList = document.getElementById('daily-tasks-list');
    
    if (tasksWidget && tasksList) {
        if (dayTasks.length > 0) {
            tasksList.innerHTML = '';
            dayTasks.forEach(todo => {
                const badgeHtml = todo.course ? `<span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">${todo.course}</span>` : '';
                tasksList.innerHTML += `
                    <li class="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-lg border border-cream-border/50 dark:border-charcoal-border/50">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span class="text-xs text-cream-text dark:text-charcoal-text font-medium truncate flex-grow">${todo.text}</span>
                        ${badgeHtml ? `<div>${badgeHtml}</div>` : ''}
                    </li>
                `;
            });
            tasksWidget.classList.remove('hidden');
        } else {
            tasksWidget.classList.add('hidden');
        }
    }
}

// Render the 5-Day Weekly Grid Layout
function renderWeeklyGrid() {
    if (!currentRoutine) return;
    
    const container = document.getElementById('weekly-grid-container');
    if (!container) return;
    container.innerHTML = '';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const dayFullNames = {
        'Sun': 'Sunday',
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday'
    };

    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentSystemDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();

    days.forEach(dayKey => {
        const dayClasses = getEffectiveClassesForDay(dayKey);
        let startsAtText = "No classes";
        if (dayClasses.length > 0) {
            startsAtText = `Starts at: ${dayClasses[0].time.split(/[-–—]/)[0].trim()}`;
        }

        const isToday = dayKey === currentSystemDay;

        let cardsHtml = '';
        if (dayClasses.length === 0) {
            cardsHtml = `
                <div class="py-4 px-6 text-center text-[10px] text-cream-muted dark:text-charcoal-muted font-medium border border-dashed border-cream-border dark:border-charcoal-border rounded-lg select-none whitespace-nowrap">
                    No classes
                </div>
            `;
        } else {
            dayClasses.forEach((cls, index) => {
                const isSessional = cls.type === 'Sessional';
                const dotColor = isSessional ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500';

                // Check live class in weekly view
                let isLive = false;
                if (!vacationMode && isToday) {
                    const range = parseRange(cls.time);
                    if (range && currentMin >= range.startMin && currentMin < range.endMin) {
                        isLive = true;
                    }
                }

                const cardBorderTheme = isLive
                    ? 'border-emerald-500/50 dark:border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/5 ring-1 ring-emerald-500/10 shadow-sm'
                    : 'border-cream-border dark:border-charcoal-border hover:border-neutral-300 dark:hover:border-neutral-700';

                // Render card format: Only displays course code, NO titles, NO room number
                cardsHtml += `
                    <div role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openClassModal('${dayKey}', ${index}); }" onclick="openClassModal('${dayKey}', ${index})" oncontextmenu="openContextMenu(event, '${dayKey}', ${index})" class="schedule-card shrink-0 w-[130px] md:w-[145px] bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-3 cursor-pointer select-none text-left transition duration-150 flex flex-col justify-between min-h-[85px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                        <div>
                            <div class="flex items-center justify-between gap-1 mb-1">
                                <div class="flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                                    <span class="text-[8px] font-extrabold uppercase tracking-wider text-cream-muted dark:text-charcoal-muted">${isSessional ? 'Sess' : 'Theo'}</span>
                                </div>
                                ${isLive ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live"></span>` : ''}
                            </div>
                            <h4 class="text-xs font-extrabold text-cream-text dark:text-charcoal-text tracking-tight leading-tight">
                                ${cls.code}
                            </h4>
                        </div>
                        <div class="mt-2.5 pt-1.5 border-t border-cream-border/60 dark:border-charcoal-border/50 flex flex-col gap-0.5 text-[9px] font-semibold text-cream-muted dark:text-charcoal-muted">
                            <span class="font-medium">${cls.time.split(/[-–—]/)[0].trim()}</span>
                            <span class="text-neutral-400 dark:text-neutral-500 font-bold truncate">${cls.instructors && cls.instructors.length > 0 ? cls.instructors.join(' &bull; ') : 'N/A'}</span>
                        </div>
                    </div>
                `;
            });
        }

        // Row highlighting and padding
        const rowClass = isToday 
            ? 'bg-neutral-100/30 dark:bg-neutral-900/10 border-neutral-300/80 dark:border-neutral-850 py-4 px-4 rounded-2xl'
            : 'py-4';

        container.innerHTML += `
            <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 ${rowClass} border-b border-cream-border/40 dark:border-charcoal-border/30 last:border-0">
                <!-- Day Label Column -->
                <div class="w-full md:w-32 shrink-0 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start select-none">
                    <span class="font-extrabold text-sm text-cream-text dark:text-charcoal-text flex items-center gap-1.5">
                        ${dayFullNames[dayKey]}
                        ${isToday ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" title="Today"></span>` : ''}
                    </span>
                    <span class="text-[10px] font-bold text-cream-muted dark:text-charcoal-muted mt-0.5">${startsAtText}</span>
                </div>
                
                <!-- Cards Horizontal Scroller -->
                <div class="flex gap-3 overflow-x-auto scrollbar-none pb-2 flex-nowrap -mx-6 px-6 md:mx-0 md:px-0">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });
}

// Switch between Daily view list and Weekly calendar grid
function toggleViewMode() {
    currentViewMode = (currentViewMode === 'daily') ? 'weekly' : 'daily';
    triggerHaptic('light');
    
    // Update live banner immediately when toggling views
    updateRealTimeStatus();
    updateViewModeUI();
}

function updateViewModeUI() {
    const dailySec = document.getElementById('daily-view-section');
    const weeklySec = document.getElementById('weekly-view-section');
    const toggleBtn = document.getElementById('btn-view-toggle');
    if (!dailySec || !weeklySec || !toggleBtn) return;
    
    if (currentViewMode === 'weekly') {
        dailySec.classList.add('hidden');
        weeklySec.classList.remove('hidden');
        
        toggleBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 10h16 M10 4v16" />
            </svg>
            <span id="view-toggle-text">Weekly</span>
        `;
        
        // Render the calendar grid
        renderWeeklyGrid();
    } else {
        weeklySec.classList.add('hidden');
        dailySec.classList.remove('hidden');
        
        toggleBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span id="view-toggle-text">Daily</span>
        `;
        
        // Redraw list to calculate ongoing class stats
        renderDaySchedule(currentDayTab);
    }
}

// Settings modal options handlers
// Student Dashboard Navigation
function openStudentDashboard() {
    const mainView = document.getElementById('app-main-view');
    const dashboard = document.getElementById('student-dashboard-section');

    if (mainView && dashboard) {
        mainView.classList.add('hidden');
        dashboard.classList.remove('hidden');
        dashboard.classList.remove('animate-fade-in');
        dashboard.offsetWidth; // Reflow
        dashboard.classList.add('animate-fade-in');

        // Initial renders for dashboard components
        renderTodos();
        renderOverrides();
        renderDashboardAttendance();
    }
}

function closeStudentDashboard() {
    const mainView = document.getElementById('app-main-view');
    const dashboard = document.getElementById('student-dashboard-section');

    if (mainView && dashboard) {
        dashboard.classList.add('hidden');
        mainView.classList.remove('hidden');
        mainView.classList.remove('animate-fade-in');
        mainView.offsetWidth; // Reflow
        mainView.classList.add('animate-fade-in');
        if (currentDayTab) {
            renderDaySchedule(currentDayTab);
        }
    }
}

// Image Export logic using html2canvas
async function exportRoutineToImage() {
    const container = document.getElementById('weekly-grid-container');
    if (!container) return;

    // Briefly force light mode for clean export if desired, or keep current theme
    try {
        const canvas = await html2canvas(container, {
            scale: 2, // High resolution
            backgroundColor: document.documentElement.classList.contains('dark') ? '#121212' : '#FDFBF7',
            logging: false,
            useCORS: true
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Routine_${activeRoutineId}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error("Failed to export routine to image:", error);
        alert("Failed to generate image.");
    }
}

// PDF Export logic using html2canvas + jsPDF
async function exportRoutineToPDF() {
    const container = document.getElementById('weekly-grid-container');
    if (!container) return;
    if (typeof window.jspdf === 'undefined') {
        alert("PDF export library not loaded yet. Try again in a moment.");
        return;
    }

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#121212' : '#FDFBF7',
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Routine_${activeRoutineId}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Failed to export routine to PDF:", error);
        alert("Failed to generate PDF.");
    }
}

function openUserSettingsModal() {
    // Update alert buttons UI
    const alerts = [5, 10, 15];
    alerts.forEach(min => {
        const btn = document.getElementById(`btn-alert-${min}m`);
        if (btn) {
            if (min === alertTimeOffset) {
                btn.classList.remove('bg-cream-card', 'dark:bg-charcoal-card', 'text-cream-text', 'dark:text-charcoal-text', 'border-neutral-200', 'dark:border-neutral-700');
                btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
            } else {
                btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                btn.classList.add('bg-cream-card', 'dark:bg-charcoal-card', 'text-cream-text', 'dark:text-charcoal-text', 'border-neutral-200', 'dark:border-neutral-700');
            }
        }
    });

    // Update vacation mode toggle UI
    const vacToggle = document.getElementById('vacation-mode-toggle');
    if (vacToggle) {
        vacToggle.checked = vacationMode;
    }

    const modal = document.getElementById('user-settings-modal');
    modal.classList.remove('hidden');
    modal.offsetHeight; // force reflow
    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
}

function closeUserSettingsModal() {
    const modal = document.getElementById('user-settings-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }, 250);
}

function saveAlertTime(min) {
    alertTimeOffset = min;
    localStorage.setItem('alert_time_offset', min.toString());

    // Re-render UI
    const alerts = [5, 10, 15];
    alerts.forEach(m => {
        const btn = document.getElementById(`btn-alert-${m}m`);
        if (btn) {
            if (m === alertTimeOffset) {
                btn.classList.remove('bg-cream-card', 'dark:bg-charcoal-card', 'text-cream-text', 'dark:text-charcoal-text', 'border-neutral-200', 'dark:border-neutral-700');
                btn.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
            } else {
                btn.classList.remove('bg-emerald-500', 'text-white', 'border-emerald-500');
                btn.classList.add('bg-cream-card', 'dark:bg-charcoal-card', 'text-cream-text', 'dark:text-charcoal-text', 'border-neutral-200', 'dark:border-neutral-700');
            }
        }
    });
}

function toggleVacationMode() {
    vacationMode = !vacationMode;
    localStorage.setItem('vacation_mode', vacationMode ? 'true' : 'false');

    const vacToggle = document.getElementById('vacation-mode-toggle');
    if (vacToggle) {
        vacToggle.checked = vacationMode;
    }

    // Force UI refresh for live tracking
    updateRealTimeStatus();
    if (currentViewMode === 'daily') renderDaySchedule(currentDayTab);
    else renderWeeklyGrid();
}

async function shareDashboard() {
    const shareData = {
        title: 'Class Routine Dashboard',
        text: 'Check out this offline-first class schedule tracker.',
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        // Fallback to copy to clipboard
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (err) {
            alert('Failed to copy link.');
        }
    }
}

function openSettingsModal() {
    const listContainer = document.getElementById('routine-options-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    Object.values(routines).forEach(r => {
        const isSelected = r.id === activeRoutineId;
        const borderTheme = isSelected
            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50/50 dark:bg-neutral-900/40 ring-1 ring-neutral-900 dark:ring-neutral-100'
            : 'border-cream-border dark:border-charcoal-border hover:border-neutral-300 dark:hover:border-neutral-700 bg-transparent';
        
        listContainer.innerHTML += `
            <div role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRoutine('${r.id}'); }" onclick="selectRoutine('${r.id}')" class="border ${borderTheme} rounded-xl p-3.5 cursor-pointer transition select-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                <div>
                    <p class="text-sm font-bold text-cream-text dark:text-charcoal-text">${r.name}</p>
                    <p class="text-xs text-cream-muted dark:text-charcoal-muted mt-0.5 font-medium">${r.subtitle}</p>
                </div>
                ${isSelected ? `
                    <svg class="w-4 h-4 text-cream-text dark:text-charcoal-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                ` : ''}
            </div>
        `;
    });

    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.offsetHeight; // force reflow
    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }, 250);
}

// Student Dashboard Feature Logic

// 1. Dashboard Attendance Rendering
function renderDashboardAttendance() {
    if (!currentRoutine) return;
    const listContainer = document.getElementById('dashboard-stats-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const uniqueCourses = new Set();
    Object.values(currentRoutine.data).forEach(dayClasses => {
        dayClasses.forEach(cls => uniqueCourses.add(cls.code));
    });

    if (uniqueCourses.size === 0) {
        listContainer.innerHTML = `<p class="text-xs text-cream-muted dark:text-charcoal-muted col-span-full">No courses available.</p>`;
        return;
    }

    Array.from(uniqueCourses).sort().forEach(code => {
        const stats = getCourseAttendanceStats(code);
        let percentageColor = "text-rose-600 dark:text-rose-400";
        let barColor = "bg-rose-500";

        if (stats.percentage >= 75) {
            percentageColor = "text-emerald-600 dark:text-emerald-400";
            barColor = "bg-emerald-500";
        } else if (stats.percentage >= 60) {
            percentageColor = "text-amber-600 dark:text-amber-400";
            barColor = "bg-amber-500";
        }
        if (stats.total === 0) {
            percentageColor = "text-neutral-500 dark:text-neutral-400";
            barColor = "bg-neutral-300 dark:bg-neutral-600";
        }

        listContainer.innerHTML += `
            <div class="border border-cream-border dark:border-charcoal-border bg-cream-bg dark:bg-charcoal-bg rounded-xl p-3 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-cream-text dark:text-charcoal-text">${code}</span>
                    <span class="text-[10px] font-bold ${percentageColor}">${stats.percentage}%</span>
                </div>
                <div class="w-full bg-neutral-200/50 dark:bg-neutral-800/80 rounded-full h-1.5 overflow-hidden">
                    <div class="${barColor} h-full rounded-full" style="width: ${stats.percentage}%"></div>
                </div>
                <div class="flex justify-between text-[9px] font-medium text-cream-muted dark:text-charcoal-muted">
                    <span>P: ${stats.present}</span>
                    <span>A: ${stats.absent}</span>
                </div>
            </div>
        `;
    });
}

// 2. To-Do / Deadline Tracker
let todosData = JSON.parse(localStorage.getItem('todos_v1') || '[]');

// ToDo Drag and Drop state
let dragStartIndex = null;

function saveTodos() {
    localStorage.setItem('todos_v1', JSON.stringify(todosData));
}

function populateTodoCourseDropdown() {
    const select = document.getElementById('todo-course');
    if (!select || !currentRoutine) return;
    select.innerHTML = '<option value="">No Course</option>';

    const uniqueCourses = new Set();
    Object.values(currentRoutine.data).forEach(dayClasses => {
        dayClasses.forEach(cls => uniqueCourses.add(cls.code));
    });

    Array.from(uniqueCourses).sort().forEach(code => {
        select.innerHTML += `<option value="${code}">${code}</option>`;
    });
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';

    populateTodoCourseDropdown();

    if (todosData.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-center opacity-60">
                <svg class="w-10 h-10 text-cream-muted dark:text-charcoal-muted mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <p class="text-xs font-semibold text-cream-text dark:text-charcoal-text">No pending tasks</p>
            </div>
        `;
        return;
    }

    todosData.forEach((todo, index) => {
        const badgeHtml = todo.course ? `<span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">${todo.course}</span>` : '';
        const deadlineHtml = todo.deadline ? `<span class="text-[9px] text-amber-600 dark:text-amber-400 font-bold ml-1">${todo.deadline}</span>` : '';

        list.innerHTML += `
            <li draggable="true" ondragstart="todoDragStart(event, ${index})" ondragover="todoDragOver(event)" ondrop="todoDrop(event, ${index})" class="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/40 p-2 rounded-lg border border-cream-border/50 dark:border-charcoal-border/50 transition cursor-grab active:cursor-grabbing">
                <input type="checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo(${index})" class="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0">
                <div class="flex-1 flex flex-col justify-center min-w-0">
                    <span class="text-xs text-cream-text dark:text-charcoal-text font-medium truncate ${todo.done ? 'line-through text-cream-muted dark:text-charcoal-muted' : ''}">${todo.text}</span>
                    ${(todo.course || todo.deadline) ? `<div class="flex items-center gap-1 mt-0.5">${badgeHtml}${deadlineHtml}</div>` : ''}
                </div>
                <button onclick="deleteTodo(${index})" class="text-neutral-400 hover:text-rose-500 transition shrink-0 p-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </li>
        `;
    });
}

// Drag and Drop Handlers for ToDos
window.todoDragStart = function(event, index) {
    dragStartIndex = index;
    event.dataTransfer.effectAllowed = 'move';
};

window.todoDragOver = function(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};

window.todoDrop = function(event, dropIndex) {
    event.preventDefault();
    if (dragStartIndex === null || dragStartIndex === dropIndex) return;

    // Swap array items
    const draggedItem = todosData[dragStartIndex];
    todosData.splice(dragStartIndex, 1);
    todosData.splice(dropIndex, 0, draggedItem);

    saveTodos();
    renderTodos();
    dragStartIndex = null;
    triggerHaptic('light');
};

function addTodo() {
    const input = document.getElementById('todo-input');
    const courseInput = document.getElementById('todo-course');
    const deadlineInput = document.getElementById('todo-deadline');

    const text = input.value.trim();
    if (text) {
        todosData.push({
            text,
            course: courseInput.value,
            deadline: deadlineInput.value,
            done: false
        });
        saveTodos();
        renderTodos();
        input.value = '';
        courseInput.value = '';
        deadlineInput.value = '';
        triggerHaptic('light');
    }
}

function toggleTodo(index) {
    if (todosData[index]) {
        todosData[index].done = !todosData[index].done;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(index) {
    todosData.splice(index, 1);
    saveTodos();
    renderTodos();
}

// 3. Schedule Overrides
let overridesData = JSON.parse(localStorage.getItem('overrides_v1') || '{}');

function saveOverrides() {
    localStorage.setItem('overrides_v1', JSON.stringify(overridesData));
}

function addOverride() {
    const dateInput = document.getElementById('override-date').value;
    const codeInput = document.getElementById('override-code').value.trim();
    const timeInput = document.getElementById('override-time').value.trim();

    if (!dateInput || !codeInput || !timeInput) {
        alert("Please fill in all fields.");
        return;
    }

    const newRange = parseRange(timeInput);
    if (!newRange) {
        alert("Invalid time format. Use something like '08:50 AM - 09:40 AM'");
        return;
    }

    // Determine the day key from the date
    const d = new Date(dateInput);
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayKey = dayMap[d.getDay()];

    // Get effective classes for that day to check overlaps
    const existingClasses = getEffectiveClassesForDay(dayKey, dateInput);

    // Check overlap
    let conflict = false;
    for (const cls of existingClasses) {
        const clsRange = parseRange(cls.time);
        if (clsRange) {
            if ((newRange.startMin >= clsRange.startMin && newRange.startMin < clsRange.endMin) ||
                (newRange.endMin > clsRange.startMin && newRange.endMin <= clsRange.endMin) ||
                (newRange.startMin <= clsRange.startMin && newRange.endMin >= clsRange.endMin)) {
                conflict = true;
                break;
            }
        }
    }

    if (conflict) {
        const proceed = confirm("Warning: This makeup class overlaps with an existing class or override. Add anyway?");
        if (!proceed) return;
    }

    if (!overridesData[activeRoutineId]) {
        overridesData[activeRoutineId] = {};
    }

    if (!overridesData[activeRoutineId][dateInput]) {
        overridesData[activeRoutineId][dateInput] = [];
    }

    overridesData[activeRoutineId][dateInput].push({
        code: codeInput,
        time: timeInput,
        type: 'Theory',
        name: 'Makeup Class',
        isOverride: true
    });

    saveOverrides();
    renderOverrides();

    // Clear inputs
    document.getElementById('override-code').value = '';
    document.getElementById('override-time').value = '';

    // Force UI refresh for live tracking in main view
    updateRealTimeStatus();
    if (currentViewMode === 'daily') renderDaySchedule(currentDayTab);
    else renderWeeklyGrid();
}

function deleteOverride(date, index) {
    if (overridesData[activeRoutineId] && overridesData[activeRoutineId][date]) {
        overridesData[activeRoutineId][date].splice(index, 1);
        if (overridesData[activeRoutineId][date].length === 0) {
            delete overridesData[activeRoutineId][date];
        }
        saveOverrides();
        renderOverrides();

        // Force UI refresh for live tracking
        updateRealTimeStatus();
        if (currentViewMode === 'daily') renderDaySchedule(currentDayTab);
        else renderWeeklyGrid();
    }
}

function shareOverrides() {
    const currentOverrides = overridesData[activeRoutineId];
    if (!currentOverrides || Object.keys(currentOverrides).length === 0) {
        alert("No overrides exist for the current routine to share.");
        return;
    }

    try {
        const compressedData = btoa(encodeURIComponent(JSON.stringify(currentOverrides)));
        const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        const shareUrl = `${baseUrl}?r=${activeRoutineId}&import_overrides=${compressedData}`;

        document.getElementById('share-link-input').value = shareUrl;

        // Generate QR
        const qrContainer = document.getElementById('qrcode-container');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: shareUrl,
            width: 128,
            height: 128,
            colorDark : "#121212",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.L
        });

        const modal = document.getElementById('share-overrides-modal');
        modal.classList.remove('hidden');
        modal.offsetHeight; // force reflow
        modal.classList.add('active');
        document.body.classList.add('overflow-hidden');
    } catch (e) {
        console.error("Failed to generate share link", e);
        alert("Error generating share link.");
    }
}

function closeShareOverridesModal() {
    const modal = document.getElementById('share-overrides-modal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }, 250);
}

function copyShareLink() {
    const input = document.getElementById('share-link-input');
    input.select();
    document.execCommand('copy');
    alert("Link copied!");
}

function renderOverrides() {
    const list = document.getElementById('overrides-list');
    if (!list) return;
    list.innerHTML = '';

    const routineOverrides = overridesData[activeRoutineId] || {};
    let hasOverrides = false;

    for (const date in routineOverrides) {
        routineOverrides[date].forEach((override, index) => {
            hasOverrides = true;
            list.innerHTML += `
                <li class="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-2 rounded text-amber-800 dark:text-amber-300">
                    <div class="font-medium text-[10px] leading-tight">
                        <span class="font-bold">${override.code}</span> <span class="text-amber-600 dark:text-amber-500">(${date})</span><br>
                        ${override.time}
                    </div>
                    <button onclick="deleteOverride('${date}', ${index})" class="text-amber-600 hover:text-rose-500 transition">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </li>
            `;
        });
    }

    if (!hasOverrides) {
        list.innerHTML = `<li class="text-xs text-cream-muted dark:text-charcoal-muted font-medium">No overrides added yet.</li>`;
    }
}

function getEffectiveClassesForDay(dayKey, specificDateStr = null) {
    if (!currentRoutine) return [];

    // 1. Get base routine classes for the day of the week
    let baseClasses = currentRoutine.data[dayKey] || [];

    // 2. Map dayKey to an actual YYYY-MM-DD if specificDateStr not provided
    let targetDateStr = specificDateStr;
    if (!targetDateStr) {
        targetDateStr = getDateForDayTab(dayKey);
    }

    // 3. Check for overrides on that date
    if (overridesData[activeRoutineId] && overridesData[activeRoutineId][targetDateStr]) {
        // Merge base classes with overrides
        const addedOverrides = overridesData[activeRoutineId][targetDateStr];
        let merged = [...baseClasses, ...addedOverrides];

        // Sort by start time
        merged.sort((a, b) => {
            const rangeA = parseRange(a.time);
            const rangeB = parseRange(b.time);
            const startA = rangeA ? rangeA.startMin : 0;
            const startB = rangeB ? rangeB.startMin : 0;
            return startA - startB;
        });

        return merged;
    }

    return baseClasses;
}


function selectRoutine(id) {
    const matched = Object.values(routines).find(r => r.id === id);
    if (!matched) return;

    activeRoutineId = matched.id;
    localStorage.setItem('active_routine_id', matched.id);
    currentRoutine = matched;

    // Update Header titles & palette
    updateHeaderTitles();
    applyRoutinePalette(currentRoutine);

    // Re-initialize day selection and rendering
    setupInitialDay();

    if (currentViewMode === 'weekly') {
        renderWeeklyGrid();
    } else {
        renderDaySchedule(currentDayTab);
    }

    // Update real time banner status
    updateRealTimeStatus();

    // Close modal
    closeSettingsModal();
}

function openClassModal(dayKey, index) {
    if (!currentRoutine) return;
    const effectiveClasses = getEffectiveClassesForDay(dayKey);
    const cls = effectiveClasses[index];
    if (!cls) return;

    // Injected type and update theme colors
    const typePill = document.getElementById('modal-class-type');
    typePill.innerText = cls.type;
    if (cls.type === 'Sessional') {
        typePill.className = "inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 mb-2";
    } else {
        typePill.className = "inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/40 mb-2";
    }

    // Inject code & title
    document.getElementById('modal-class-code-name').innerHTML = `${cls.code} &bull; ${cls.name}`;

    // Inject time and period
    document.getElementById('modal-class-time-period').innerText = `${cls.time} (${cls.period || 'N/A'})`;

    // Inject location (dynamic room loading shown in popup only, not in feed cards)
    let demographic = "All Students";
    if (cls.group) {
        demographic = `${cls.group} (Group A: Roll 2409001-030 | Group B: Roll 2409031-060)`;
    }
    const roomLabel = cls.room || 'ECE-102';
    document.getElementById('modal-class-location').innerHTML = `${roomLabel} &bull; ${demographic}`;

    // Inject full instructor names mapped from acronyms
    const instructorsList = document.getElementById('modal-class-instructors');
    instructorsList.innerHTML = '';

    if (cls.instructors && cls.instructors.length > 0) {
        const teacherDir = currentRoutine.teacherDirectory || {};
        cls.instructors.forEach(acronym => {
            const fullName = teacherDir[acronym] || acronym;
            instructorsList.innerHTML += `
                <li class="flex items-center gap-2 text-cream-text dark:text-charcoal-text text-sm font-semibold">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-cream-muted dark:bg-charcoal-muted"></span>
                    <span>${fullName} (${acronym})</span>
                </li>
            `;
        });
    } else {
        instructorsList.innerHTML = `
            <li class="text-neutral-400 dark:text-neutral-500 text-sm font-medium italic">
                No instructors assigned.
            </li>
        `;
    }

    // Inject special notes (e.g. overlaps)
    const notesContainer = document.getElementById('modal-class-notes-container');
    if (cls.notes) {
        document.getElementById('modal-class-notes').innerText = cls.notes;
        notesContainer.classList.remove('hidden');
    } else {
        notesContainer.classList.add('hidden');
    }

    // Personal Notes
    const notesArea = document.getElementById('modal-personal-notes');
    if (notesArea) {
        const key = `${activeRoutineId}_${cls.code}`;
        notesArea.value = personalNotesData[key] || '';
        notesArea.oninput = (e) => {
            personalNotesData[key] = e.target.value;
            savePersonalNotesData();
        };
    }

    // Attendance
    const dateStr = getDateForDayTab(dayKey);
    const dateSpan = document.getElementById('modal-attendance-date');
    if (dateSpan) dateSpan.innerText = `(${dateStr})`;
    
    function refreshModalAttendance() {
        const routineAtt = attendanceData[activeRoutineId] || {};
        const courseAtt = routineAtt[cls.code] || {};
        const status = courseAtt[dateStr];
        
        const btnPresent = document.getElementById('btn-attendance-present');
        const btnAbsent = document.getElementById('btn-attendance-absent');
        
        if (btnPresent && btnAbsent) {
            btnPresent.classList.remove('bg-emerald-500', 'text-white', 'dark:text-white', 'bg-cream-card', 'dark:bg-charcoal-card');
            btnAbsent.classList.remove('bg-rose-500', 'text-white', 'dark:text-white', 'bg-cream-card', 'dark:bg-charcoal-card');
            
            if (status === 'present') {
                btnPresent.classList.add('bg-emerald-500', 'text-white', 'dark:text-white');
                btnAbsent.classList.add('bg-cream-card', 'dark:bg-charcoal-card');
            } else if (status === 'absent') {
                btnAbsent.classList.add('bg-rose-500', 'text-white', 'dark:text-white');
                btnPresent.classList.add('bg-cream-card', 'dark:bg-charcoal-card');
            } else {
                btnPresent.classList.add('bg-cream-card', 'dark:bg-charcoal-card');
                btnAbsent.classList.add('bg-cream-card', 'dark:bg-charcoal-card');
            }
        }
        
        // Update stats
        const stats = getCourseAttendanceStats(cls.code);
        const statsEl = document.getElementById('modal-attendance-stats');
        if (statsEl) {
            statsEl.innerText = `${stats.percentage}% (${stats.present}/${stats.total})`;
        }
    }
    
    const btnPresent = document.getElementById('btn-attendance-present');
    if (btnPresent) btnPresent.onclick = () => { markAttendance(cls.code, dateStr, 'present'); refreshModalAttendance(); };
    const btnAbsent = document.getElementById('btn-attendance-absent');
    if (btnAbsent) btnAbsent.onclick = () => { markAttendance(cls.code, dateStr, 'absent'); refreshModalAttendance(); };
    const btnClear = document.getElementById('btn-attendance-clear');
    if (btnClear) btnClear.onclick = () => { markAttendance(cls.code, dateStr, null); refreshModalAttendance(); };
    
    refreshModalAttendance();

    // Display the modal with animation
    const modal = document.getElementById('detail-modal');
    modal.classList.remove('hidden');

    // Force a browser reflow to trigger opacity transition
    modal.offsetHeight;
    modal.classList.add('active');

    // Prevent body scrolling
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    modal.classList.remove('active');

    // Hide modal and restore body scroll after animation completes
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }, 250); // Matches CSS transition duration (250ms)
}

function setupTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('sun-icon').classList.remove('hidden');
        document.getElementById('moon-icon').classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('sun-icon').classList.add('hidden');
        document.getElementById('moon-icon').classList.remove('hidden');
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const activeIcon = isDark ? sunIcon : moonIcon;
    const inactiveIcon = isDark ? moonIcon : sunIcon;

    // Switch visibility
    inactiveIcon.classList.add('hidden');
    activeIcon.classList.remove('hidden');

    // Trigger rotation transition
    activeIcon.classList.add('theme-icon-rotate');
    setTimeout(() => {
        activeIcon.classList.remove('theme-icon-rotate');
    }, 500);
}

async function toggleNotifications() {
    if (!("Notification" in window)) {
        alert("This browser does not support web notifications.");
        return;
    }

    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            notificationsEnabled = false;
            localStorage.setItem('notifications_enabled', 'false');
            updateNotificationUI();
            return;
        }
    } else if (Notification.permission === "denied") {
        alert("Notification permissions are blocked. Please enable them in your browser site settings.");
        notificationsEnabled = false;
        localStorage.setItem('notifications_enabled', 'false');
        updateNotificationUI();
        return;
    }

    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem('notifications_enabled', notificationsEnabled ? 'true' : 'false');
    updateNotificationUI();

    if (notificationsEnabled) {
        showNotification("Class Alerts Enabled", {
            body: "We will notify you 10 minutes before your classes start.",
            tag: "alert-config"
        });
    }
}

function updateNotificationUI() {
    const btn = document.getElementById('notification-btn');
    if (!btn) return;

    if (notificationsEnabled && Notification.permission === "granted") {
        // Highlight active bell with emerald color
        btn.className = "p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition text-emerald-600 dark:text-emerald-400";
        btn.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22zm7-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C8.63 5.36 7 7.92 7 11v5l-2 2v1h14v-1l-2-2z"></path>
            </svg>
        `;
    } else {
        // Normal gray bell outline
        btn.className = "p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition text-cream-muted dark:text-charcoal-muted";
        btn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
        `;
    }
}

function showNotification(title, options) {
    if (!notificationsEnabled || Notification.permission !== "granted") return;

    const defaultOptions = {
        icon: 'favicon.ico',
        badge: 'favicon.ico',
        ...options
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, defaultOptions);
        }).catch(() => {
            new Notification(title, defaultOptions);
        });
    } else {
        new Notification(title, defaultOptions);
    }
}

function checkUpcomingClassAlerts() {
    if (!notificationsEnabled || Notification.permission !== "granted" || !currentRoutine) return;

    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const dayClasses = currentRoutine.data[currentDay] || [];
    const dateStr = now.toISOString().split('T')[0];

    dayClasses.forEach(cls => {
        const range = parseRange(cls.time);
        if (!range) return;

        const minutesDiff = range.startMin - currentMin;
        const roomStr = cls.room || 'ECE-102';

        // 1. Alert 10 minutes before class start
        if (minutesDiff === 10) {
            const alertKey = `${dateStr}_${cls.code}_10m`;
            if (!sentNotifications[alertKey]) {
                sentNotifications[alertKey] = true;
                showNotification(`Class starts in 10 minutes!`, {
                    body: `${cls.code} ${cls.name ? `- ${cls.name}` : ''} in Room ${roomStr} starts at ${range.startStr}.`,
                    tag: `class-10m-${cls.code}`,
                    requireInteraction: true
                });
            }
        }

        // 2. Alert exactly at class start
        if (minutesDiff === 0) {
            const alertKey = `${dateStr}_${cls.code}_start`;
            if (!sentNotifications[alertKey]) {
                sentNotifications[alertKey] = true;
                showNotification(`Class starting now!`, {
                    body: `${cls.code} ${cls.name ? `- ${cls.name}` : ''} is starting in Room ${roomStr}.`,
                    tag: `class-start-${cls.code}`,
                    requireInteraction: true
                });
            }
        }
    });
}

function showPwaBanner(platform) {
    if (sessionStorage.getItem('pwa_banner_dismissed') === 'true') return;

    const banner = document.getElementById('pwa-install-banner');
    const desc = document.getElementById('pwa-install-desc');
    const btn = document.getElementById('pwa-install-btn');
    if (!banner || !desc || !btn) return;

    if (platform === 'ios') {
        desc.innerText = "Please open this page in Safari, tap the Share icon (at the bottom), and select 'Add to Home Screen' for offline access and alerts.";
        btn.classList.add('hidden'); // Programmatic triggers not supported on iOS Safari
    } else {
        btn.classList.remove('hidden');

        // Remove previous listeners (if any) and attach fresh click listener
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                dismissPwaBanner();
            });
        });
    }

    // Slide up animation
    banner.classList.remove('hidden');
    banner.offsetHeight; // Force layout reflow
    banner.classList.remove('opacity-0', 'translate-y-8');
    banner.classList.add('opacity-100', 'translate-y-0');
}

function dismissPwaBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (!banner) return;

    banner.classList.remove('opacity-100', 'translate-y-0');
    banner.classList.add('opacity-0', 'translate-y-8');
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 300);

    sessionStorage.setItem('pwa_banner_dismissed', 'true');
}


