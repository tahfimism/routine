let currentDayTab = "Sun";

// DOM Loaded Init
window.addEventListener('DOMContentLoaded', () => {
    setupInitialDay();
    setupTheme();
    renderDaySchedule(currentDayTab);
    
    // Add global escape key listener to close modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

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
    renderDaySchedule(dayKey);
}

// Render schedule items elegantly
function renderDaySchedule(dayKey) {
    // Highlight Tab Button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        if (btn.id === `tab-${dayKey}`) {
            btn.className = "tab-btn py-3 text-sm font-bold tracking-wide transition-all relative border-b-2 border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 shrink-0";
        } else {
            btn.className = "tab-btn py-3 text-sm font-semibold tracking-wide transition-all relative border-b-2 border-transparent text-cream-muted dark:text-charcoal-muted hover:text-neutral-900 dark:hover:text-neutral-100 shrink-0";
        }
    });

    const timeline = document.getElementById('classes-timeline');
    timeline.innerHTML = '';

    const dayClasses = routineData[dayKey] || [];
    
    // Calculate and display "Starts at: time"
    const dayInfo = document.getElementById('day-info');
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

    if (dayClasses.length === 0) {
        timeline.innerHTML = `
            <div class="py-12 text-center text-sm text-cream-muted dark:text-charcoal-muted font-medium">
                No classes scheduled for today.
            </div>
        `;
        return;
    }

    // Render classes cards in a highly sleek line layout
    dayClasses.forEach((cls, index) => {
        const isSessional = cls.type === 'Sessional';
        const pillTheme = isSessional 
            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
            : 'text-neutral-700 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/40';

        timeline.innerHTML += `
            <div onclick="openClassModal('${dayKey}', ${index})" class="bg-cream-card dark:bg-charcoal-card border border-cream-border dark:border-charcoal-border rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer transition duration-200 select-none">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <span class="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${pillTheme}">
                                ${cls.type}
                            </span>
                        </div>
                        <div>
                            <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                ${cls.code} &bull; ${cls.name}
                            </h3>
                            <p class="text-xs text-cream-muted dark:text-charcoal-muted mt-1 font-medium">
                                Instructors: ${cls.instructors.join(' &bull; ')}
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
            </div>
        `;
    });
}

// Modal handling logic
function openClassModal(dayKey, index) {
    const cls = routineData[dayKey][index];
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
    
    // Inject location and group details
    let demographic = "All Students";
    if (cls.group) {
        demographic = `${cls.group} (Group A: Roll 2409001-030 | Group B: Roll 2409031-060)`;
    }
    document.getElementById('modal-class-location').innerHTML = `ECE-102 &bull; ${demographic}`;
    
    // Inject full instructor names mapped from acronyms
    const instructorsList = document.getElementById('modal-class-instructors');
    instructorsList.innerHTML = '';
    cls.instructors.forEach(acronym => {
        const fullName = teacherDirectory[acronym] || acronym;
        instructorsList.innerHTML += `
            <li class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 text-sm">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"></span>
                <span>${fullName} (${acronym})</span>
            </li>
        `;
    });
    
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
    document.getElementById('sun-icon').classList.toggle('hidden', !isDark);
    document.getElementById('moon-icon').classList.toggle('hidden', isDark);
}
