let currentDayTab = "Sun";
let currentViewMode = "daily"; // "daily" or "weekly"
let realTimeInterval = null;

// Registry reference variables
let activeRoutineId = 'ece_2_1';
let currentRoutine = null;

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
    
    // Inject dynamic header titles
    updateHeaderTitles();
    
    setupInitialDay();
    setupTheme();
    renderDaySchedule(currentDayTab);
    
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
            btn.className = "tab-btn py-3 text-sm font-bold tracking-wide transition-all relative border-b-2 border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 shrink-0";
        } else {
            btn.className = "tab-btn py-3 text-sm font-semibold tracking-wide transition-all relative border-b-2 border-transparent text-cream-muted dark:text-charcoal-muted hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0";
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
            <div onclick="openClassModal('${dayKey}', ${index})" class="schedule-card bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-5 cursor-pointer transition duration-250 select-none">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <span class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${pillTheme}">
                                ${cls.type}
                            </span>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight flex items-center gap-1.5">
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
                    <div onclick="openClassModal('${dayKey}', ${index})" class="schedule-card shrink-0 w-[130px] md:w-[145px] bg-cream-card dark:bg-charcoal-card border ${cardBorderTheme} rounded-xl p-3 cursor-pointer select-none text-left transition duration-150 flex flex-col justify-between min-h-[85px]">
                        <div>
                            <div class="flex items-center justify-between gap-1 mb-1">
                                <div class="flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                                    <span class="text-[8px] font-extrabold uppercase tracking-wider text-cream-muted dark:text-charcoal-muted">${isSessional ? 'Sess' : 'Theo'}</span>
                                </div>
                                ${isLive ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live"></span>` : ''}
                            </div>
                            <h4 class="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight leading-tight">
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
                    <span class="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
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
function toggleViewMode(view) {
    currentViewMode = view;
    
    const dailySec = document.getElementById('daily-view-section');
    const weeklySec = document.getElementById('weekly-view-section');
    const btnDaily = document.getElementById('btn-view-daily');
    const btnWeekly = document.getElementById('btn-view-weekly');
    
    if (view === 'weekly') {
        dailySec.classList.add('hidden');
        weeklySec.classList.remove('hidden');
        
        // Update active class triggers on toggle controls
        btnDaily.className = "px-2.5 py-1.5 rounded-md transition text-cream-muted dark:text-charcoal-muted hover:text-neutral-955 dark:hover:text-neutral-50";
        btnWeekly.className = "px-2.5 py-1.5 rounded-md transition text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 shadow-sm";
        
        // Render the calendar grid
        renderWeeklyGrid();
    } else {
        weeklySec.classList.add('hidden');
        dailySec.classList.remove('hidden');
        
        btnWeekly.className = "px-2.5 py-1.5 rounded-md transition text-cream-muted dark:text-charcoal-muted hover:text-neutral-955 dark:hover:text-neutral-50";
        btnDaily.className = "px-2.5 py-1.5 rounded-md transition text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 shadow-sm";
        
        // Redraw list to calculate ongoing class stats
        renderDaySchedule(currentDayTab);
    }
    
    // Update live banner immediately when toggling views
    updateRealTimeStatus();
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
            <div onclick="selectRoutine('${r.id}')" class="border ${borderTheme} rounded-xl p-3.5 cursor-pointer transition select-none flex items-center justify-between">
                <div>
                    <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100">${r.name}</p>
                    <p class="text-xs text-cream-muted dark:text-charcoal-muted mt-0.5 font-medium">${r.subtitle}</p>
                </div>
                ${isSelected ? `
                    <svg class="w-4 h-4 text-neutral-900 dark:text-neutral-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    
    // Update Header titles
    updateHeaderTitles();
    
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
                <li class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 text-sm font-semibold">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
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
