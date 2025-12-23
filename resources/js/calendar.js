const API_BASE_URL = '/api';
    let rawTasks = [];
    let activeTasks = [];
    let tasksByDate = new Map();
    let currentMonth = new Date();
    let selectedDate = null;

    async function fetchWithAuth(url, options = {}) {
const token = localStorage.getItem('auth_token');
if (!token) { window.location.href = '/login'; return; }
const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    ...options.headers
};
const res = await fetch(url, { ...options, headers });
if (res?.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    return;
}
return res;
    }

    function formatKey(date) {
const y = date.getFullYear();
const m = String(date.getMonth() + 1).padStart(2, '0');
const d = String(date.getDate()).padStart(2, '0');
return `${y}-${m}-${d}`;
    }

    function toKey(dateStr) {
if (!dateStr) return null;
const d = new Date(dateStr);
if (isNaN(d.getTime())) return null;
return formatKey(d);
    }

    function categoryClass(category) {
const normalized = (category || 'PERSONAL').toUpperCase();
if (normalized === 'WORK') return 'work';
if (normalized === 'SCHOOL') return 'school';
return 'personal';
    }

    function groupTasks(tasks) {
tasksByDate = new Map();
tasks.forEach(task => {
    const key = toKey(task.due_date);
    if (!key) return;
    if (!tasksByDate.has(key)) tasksByDate.set(key, []);
    tasksByDate.get(key).push(task);
});
    }

    function renderWeekdays() {
const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const container = document.getElementById('calendarWeekdays');
container.innerHTML = '';
names.forEach((name, index) => {
    const div = document.createElement('div');
    div.className = 'weekday' + (index === 0 ? ' sun' : '');
    div.textContent = name;
    container.appendChild(div);
});
    }

    function renderCalendar() {
document.getElementById('calendarTitle').textContent = currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
const daysContainer = document.getElementById('calendarDays');
daysContainer.innerHTML = '';

const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
const firstWeekday = firstDay.getDay();
const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

// previous month padding
for (let i = 0; i < firstWeekday; i++) {
    const prevDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -firstWeekday + i + 1);
    daysContainer.appendChild(createDayTile(prevDate, true));
}

// current month
for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    daysContainer.appendChild(createDayTile(dateObj));
}

// next month padding to complete weeks
const cells = daysContainer.childElementCount;
const trailing = (7 - (cells % 7)) % 7;
for (let i = 1; i <= trailing; i++) {
    const nextDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
    daysContainer.appendChild(createDayTile(nextDate, true));
}
    }

    function createDayTile(dateObj, isOutside = false) {
const key = formatKey(dateObj);
const tile = document.createElement('div');
tile.className = 'day-tile' + (isOutside ? ' out' : '');

const number = document.createElement('div');
number.className = 'day-number';
number.textContent = dateObj.getDate();
tile.appendChild(number);

if (!isOutside && tasksByDate.has(key)) {
    const list = document.createElement('div');
    list.className = 'day-tasks';
    const tasks = tasksByDate.get(key).slice(0, 3);
    tasks.forEach(task => {
        const pill = document.createElement('div');
        pill.className = `day-task-pill category-chip ${categoryClass(task.category)}`;
        pill.textContent = task.title;
        list.appendChild(pill);
    });
    if (tasksByDate.get(key).length > 3) {
        const more = document.createElement('div');
        more.className = 'more-count';
        more.textContent = `+${tasksByDate.get(key).length - 3} more`;
        list.appendChild(more);
    }
    tile.appendChild(list);
}

if (!isOutside) {
    tile.addEventListener('click', () => {
        selectedDate = dateObj;
        renderWeekList();
    });
}

return tile;
    }

    function renderWeekList() {
const list = document.getElementById('weekTasks');
const label = document.getElementById('weekRangeLabel');

// If no date is selected, show default message
if (!selectedDate) {
    label.textContent = 'Click on a date to view tasks';
    list.innerHTML = '<div class="no-data">Click on a date to view tasks for that day.</div>';
    return;
}

// Format the selected date for display
const dateStr = selectedDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});
label.textContent = dateStr;
list.innerHTML = '';

// Filter tasks for the selected date only (same day, ignoring time)
const selectedDateStart = new Date(selectedDate);
selectedDateStart.setHours(0, 0, 0, 0);
const selectedDateEnd = new Date(selectedDate);
selectedDateEnd.setHours(23, 59, 59, 999);

const items = activeTasks.filter(task => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    return due >= selectedDateStart && due <= selectedDateEnd;
}).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'no-data';
    empty.textContent = `No tasks scheduled for ${selectedDate.toLocaleDateString()}.`;
    list.appendChild(empty);
    return;
}

items.forEach(task => {
    const row = document.createElement('div');
    row.className = 'week-task-row';

    const meta = document.createElement('div');
    meta.className = 'week-task-meta';
    const title = document.createElement('div');
    title.className = 'week-task-title';
    title.textContent = task.title;

    const chip = document.createElement('span');
    chip.className = `category-chip ${categoryClass(task.category)}`;
    chip.textContent = (task.category || 'PERSONAL').toUpperCase();

    meta.appendChild(title);
    meta.appendChild(chip);

    const statusText = (task.status || 'pending').toLowerCase();
    const statusClass = statusText === 'ongoing' ? 'ongoing' : statusText === 'completed' ? 'completed' : 'pending';
    const status = document.createElement('div');
    status.className = `status-badge ${statusClass}`;
    status.textContent = statusText.charAt(0).toUpperCase() + statusText.slice(1);

    const dateLabel = document.createElement('div');
    dateLabel.className = 'week-task-date';
    dateLabel.textContent = new Date(task.due_date).toLocaleDateString();

    const info = document.createElement('div');
    info.className = 'week-task-info';
    info.appendChild(status);
    info.appendChild(dateLabel);

    row.appendChild(meta);
    row.appendChild(info);
    list.appendChild(row);
});
    }

    function getDefaultReferenceDate() {
const today = new Date();
if (today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()) {
    return today;
}
return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    }

    function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text ?? '';
return div.innerHTML;
    }

document.getElementById('logoutBtn')?.addEventListener('click', async function() {
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            await fetchWithAuth(`${API_BASE_URL}/logout`, { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
});

document.addEventListener('DOMContentLoaded', () => {
document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    selectedDate = null; // Clear selected date when changing months
    renderCalendar();
    renderWeekList();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    selectedDate = null; // Clear selected date when changing months
    renderCalendar();
    renderWeekList();
});

if (!localStorage.getItem('auth_token')) {
    window.location.href = '/login';
    return;
}

renderWeekdays();
renderCalendar();
renderWeekList();
loadData();
    });

    async function loadData() {
try {
    const meResponse = await fetchWithAuth(`${API_BASE_URL}/me`);
    if (meResponse?.ok) {
        const me = await meResponse.json();
        document.getElementById('userEmail').textContent = me.email || 'user@gmail.com';
        // Display full name if available, otherwise use email or 'User'
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = me.fname || me.email?.split('@')[0] || 'User';
        }
    }
    const tasksRes = await fetchWithAuth(`${API_BASE_URL}/tasks`);
    if (tasksRes?.ok) {
        rawTasks = await tasksRes.json();
        activeTasks = rawTasks.filter(task => (task.status || '').toLowerCase() !== 'completed');
        groupTasks(activeTasks);
        renderCalendar();
        renderWeekList();
    }
} catch (error) {
    console.error('Error loading calendar data', error);
    if (!localStorage.getItem('auth_token')) {
        window.location.href = '/login';
    }
}
    }