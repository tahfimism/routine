let currentDayTab = "Sun";
let currentViewMode = "daily"; // "daily" or "weekly"
let realTimeInterval = null;

// Registry reference variables
let activeRoutineId = 'ece_2_1';
let currentRoutine = null;

// Notification Alert States
let notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
let sentNotifications = {};

// PWA Install Prompt State
let deferredPrompt = null;

// DOM Loaded Init
window.addEventListener('DOMContentLoaded', () => {
    // Check if query parameter 'r' is present and matches a valid routine id
    const urlParams = new URLSearchParams(window.location.search);
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
    
    // Add global escape key listener to close modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeSettingsModal();
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
    
    const now = new Date();
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayMap[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    
    const academicDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const isAcademic = academicDays.includes(currentDay);
    
    const banner = document.getElementById('countdown-banner');
    if (!banner) return;
    
    // Check class alert triggers
    checkUpcomingClassAlerts();

    // If we're on the Daily view, update the card styles live
    if (currentViewMode === 'daily') {
        renderDaySchedule(currentDayTab);
    }

    // 1. Weekend / Off-Hours Greeting Banner State
    if (!isAcademic) {
        banner.innerHTML = `
            <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Enjoy your weekend! Sunday classes start at ${currentRoutine.data["Sun"]?.[0]?.time.split(' – ')[0] || '08:50 AM'}.</span>
        `;
        banner.classList.remove('hidden');
        return;
    }

    const dayClasses = currentRoutine.data[currentDay] || [];
    if (dayClasses.length === 0) {
        banner.innerHTML = `
            <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        banner.innerHTML = `
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
        const firstTimeStr = nextClass.data.time.split(' – ')[0];
        if (nextClass.minUntil <= 60) {
            banner.innerHTML = `
                <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Next class (<span class="font-bold">${nextClass.data.code}</span>) starts in ${nextClass.minUntil} minutes.</span>
            `;
        } else {
            banner.innerHTML = `
                <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Class schedule starts today at ${firstTimeStr}. First class: <span class="font-bold">${nextClass.data.code}</span>.</span>
            `;
        }
        banner.classList.remove('hidden');
        return;
    }

    // 4. Evening/All Classes Completed State
    banner.innerHTML = `
        <svg class="w-4 h-4 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    const dayClasses = currentRoutine.data[dayKey] || [];
    
    // Dynamic starts-at time calculation
    const dayInfo = document.getElementById('day-info');
    if (dayInfo) {
        if (dayClasses.length > 0) {
            const firstTime = dayClasses[0].time.split(' – ')[0];
            dayInfo.innerHTML = `
                <svg class="w-3.5 h-3.5 text-cream-muted dark:text-charcoal-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    dayClasses.forEach((cls, index) => {
        const isSessional = cls.type === 'Sessional';
        let pillTheme = isSessional 
            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
            : 'text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/40';

        // Check if class is live *right now*
        let isLive = false;
        let elapsedMins = 0;
        let remainingMins = 0;
        let progressPercent = 0;

        if (dayKey === currentSystemDay) {
            const range = parseRange(cls.time);
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
            <div role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openClassModal('${dayKey}', ${index}); }" onclick="openClassModal('${dayKey}', ${index})" class="schedule-card bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-5 cursor-pointer transition duration-250 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
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
        const dayClasses = currentRoutine.data[dayKey] || [];
        let startsAtText = "No classes";
        if (dayClasses.length > 0) {
            startsAtText = `Starts at: ${dayClasses[0].time.split(' – ')[0]}`;
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
                if (isToday) {
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
                    <div role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openClassModal('${dayKey}', ${index}); }" onclick="openClassModal('${dayKey}', ${index})" class="schedule-card shrink-0 w-[130px] md:w-[145px] bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-3 cursor-pointer select-none text-left transition duration-150 flex flex-col justify-between min-h-[85px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
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
                            <span class="font-medium">${cls.time.split(' – ')[0]}</span>
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
// Modal handling logic
function openClassModal(dayKey, index) {
    if (!currentRoutine) return;
    const cls = currentRoutine.data[dayKey][index];
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

// Set up dark mode settings
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

// Toggle Alert notifications state
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

// Update bell icon styling based on active notifications alert choice
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

// Display notifications via Service Worker (Android/iOS PWA compatible) or fall back to window Notification
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

// Alarm logic checks class intervals and alerts
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

// Display the PWA installation promotion banner
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

// Slide down and dismiss the PWA promotion banner
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
