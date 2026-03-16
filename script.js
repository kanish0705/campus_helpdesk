/**
 * Student Management Portal
 * Mobile-First Frontend with Professional Design
 */

const API_BASE = window.location.origin;

// ============== STATE MANAGEMENT ==============
let currentUser = null;
let dashboardData = null;
let isChatOpen = false;
let adminScope = {
    configured: false,
    depts: [],
    sections: [],
    sems: []
};

// ============== DOM ELEMENTS ==============
const loginSection = document.getElementById('loginSection');
const mainDashboard = document.getElementById('mainDashboard');
const chatWidget = document.getElementById('chatWidget');
const chatContainer = document.getElementById('chatContainer');

// ============== INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);

    // Make multi-select controls easier to use (toggle options with simple click).
    [
        'adminScopeDepts', 'adminScopeSections', 'adminScopeSems',
        'newAnnTargetDepts', 'newAnnTargetSections', 'newAnnTargetSemesters',
        'editAnnTargetDepts', 'editAnnTargetSections', 'editAnnTargetSemesters'
    ].forEach(enableSimpleMultiSelect);
});

function enableSimpleMultiSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select || !select.multiple) return;

    select.addEventListener('mousedown', (event) => {
        const option = event.target.closest('option');
        if (!option) return;

        event.preventDefault();
        option.selected = !option.selected;

        // Preserve scroll position while toggling selections.
        const scrollTop = select.scrollTop;
        requestAnimationFrame(() => {
            select.scrollTop = scrollTop;
            select.focus();
        });
    });
}

function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = dateStr;
}

// ============== TOAST NOTIFICATIONS ==============
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-amber-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============== AUTHENTICATION ==============
function handleLoginKeypress(event) {
    if (event.key === 'Enter') login();
}

function setAdminNavigationMode(isAdmin) {
    const studentViewNames = ['dashboard', 'schedule', 'attendance', 'announcements', 'resources'];

    studentViewNames.forEach((viewName) => {
        const matchingButtons = document.querySelectorAll(`.nav-item[onclick*="switchView('${viewName}')"]`);
        matchingButtons.forEach((btn) => btn.classList.toggle('hidden', isAdmin));
    });

    const quickSyncBtn = document.getElementById('quickSyncBtn');
    if (quickSyncBtn) quickSyncBtn.classList.toggle('hidden', isAdmin);

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) bottomNav.classList.toggle('hidden', isAdmin);
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.detail || 'Invalid credentials', 'error');
            return;
        }
        
        currentUser = await response.json();
        showToast(`Welcome, ${currentUser.name}!`, 'success');
        
        // Update UI
        loginSection.classList.add('hidden');
        mainDashboard.classList.remove('hidden');
        chatWidget.classList.remove('hidden');
        isChatOpen = false;
        chatContainer.classList.add('hidden');
        
        // Update user info
        document.getElementById('sidebarUserName').textContent = currentUser.name;
        document.getElementById('sidebarUserRole').textContent = `${currentUser.dept} - Sem ${currentUser.sem}`;
        document.getElementById('pageSubtitle').textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
        
        // Show admin section only for admin users
        const adminSection = document.getElementById('adminSection');
        const scopeBtn = document.getElementById('adminScopeBtn');
        if (currentUser.role === 'ADMIN') {
            adminSection.classList.remove('hidden');
            if (scopeBtn) scopeBtn.classList.remove('hidden');
            setAdminNavigationMode(true);
            openAdminScopeModal();
            switchView('manage-timetable');
        } else {
            adminSection.classList.add('hidden');
            if (scopeBtn) scopeBtn.classList.add('hidden');
            setAdminNavigationMode(false);
            switchView('dashboard');
        }
        
        // Load student dashboard data only for student users.
        if (currentUser.role !== 'ADMIN') {
            loadDashboard();
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Connection error. Ensure server is running.', 'error');
    }
}

function logout() {
    currentUser = null;
    dashboardData = null;
    adminScope = { configured: false, depts: [], sections: [], sems: [] };
    
    mainDashboard.classList.add('hidden');
    loginSection.classList.remove('hidden');
    chatWidget.classList.add('hidden');
    isChatOpen = false;
    chatContainer.classList.add('hidden');
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    const scopeBtn = document.getElementById('adminScopeBtn');
    if (scopeBtn) scopeBtn.classList.add('hidden');
    const adminSection = document.getElementById('adminSection');
    if (adminSection) adminSection.classList.add('hidden');
    setAdminNavigationMode(false);
    switchView('dashboard');
    document.getElementById('chatMessages').innerHTML = `
        <div class="flex items-end space-x-2">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-primary-600 text-sm"></i>
            </div>
            <div class="chat-bubble-bot p-3 rounded-lg text-sm text-gray-700">
                Hi! Ask me about your attendance, schedule, or announcements! 📚
            </div>
        </div>
    `;
    
    showToast('Logged out successfully', 'success');
}

// ============== DASHBOARD & DATA LOADING ==============

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/student/dashboard?email=${currentUser.email}`);
        if (!response.ok) throw new Error('Failed to load dashboard');
        
        dashboardData = await response.json();
        renderDashboard();
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Failed to load dashboard', 'error');
    }
}

function renderDashboard() {
    // Update attendance stats
    const attendance = dashboardData.attendance;
    if (attendance && attendance.overall_percentage > -1) {
        document.getElementById('overallAttendance').textContent = `${attendance.overall_percentage}%`;
        document.getElementById('attendanceStatus').textContent = attendance.overall_status;
        
        // Color code status
        const statusEl = document.getElementById('attendanceStatus');
        statusEl.className = 'text-lg font-bold ' + (
            attendance.overall_status === 'SAFE' ? 'text-green-600' :
            attendance.overall_status === 'WARNING' ? 'text-amber-600' :
            'text-red-600'
        );
    }
    
    // Update today's schedule
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const todayClasses = dashboardData.timetable.filter(t => t.day_of_week === today);
    document.getElementById('todayClassCount').textContent = todayClasses.length;
    renderTodaySchedule(todayClasses);
    
    // Update announcements count
    document.getElementById('dashAnnouncementCount').textContent = dashboardData.announcements.length;
    renderLatestAnnouncements();
    
    // Render timetable
    renderTimetable(dashboardData.timetable);
    
    // Render attendance details
    if (attendance) renderAttendanceDetails(attendance);
    
    // Render announcements
    renderAnnouncements();

    // Render resources preview data when available
    loadResources();
}

function renderTodaySchedule(classes) {
    const container = document.getElementById('todayScheduleContent');
    
    if (classes.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-400"><p>🎉 No classes today! Enjoy your free time.</p></div>';
        return;
    }
    
    container.innerHTML = classes.map(cls => `
        <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-lg border-l-4 border-primary-500">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${cls.subject_name}</h4>
                <p class="text-sm text-gray-600"><i class="fas fa-clock mr-2"></i>${cls.period_slots}</p>
                <p class="text-sm text-gray-600"><i class="fas fa-door-open mr-2"></i>${cls.room_number}</p>
                ${cls.faculty_name ? `<p class="text-sm text-gray-500">${cls.faculty_name}</p>` : ''}
            </div>
            <div class="text-3xl">📚</div>
        </div>
    `).join('');
}

function renderLatestAnnouncements() {
    const container = document.getElementById('latestAnnouncementsContent');
    const announcements = dashboardData.announcements.slice(0, 3);
    
    if (announcements.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 text-sm">No announcements</p>';
        return;
    }
    
    container.innerHTML = announcements.map(ann => `
        <div class="p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border-l-2 border-amber-500">
            <p class="font-semibold text-sm text-gray-800 truncate">${ann.title}</p>
            <p class="text-xs text-gray-600 mt-1 line-clamp-2">${ann.body}</p>
            ${ann.priority === 'urgent' ? '<span class="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">🔴 Urgent</span>' : ''}
        </div>
    `).join('');
}

function renderTimetable(timetable) {
    const tbody = document.getElementById('timetableBody');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    if (timetable.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No timetable available</td></tr>';
        return;
    }

    const slots = [...new Set(timetable.map(entry => entry.period_slots))].sort();
    const matrix = {};
    slots.forEach(slot => {
        matrix[slot] = {};
        days.forEach(day => {
            matrix[slot][day] = null;
        });
    });

    timetable.forEach(entry => {
        if (!matrix[entry.period_slots]) return;
        matrix[entry.period_slots][entry.day_of_week] = entry;
    });

    tbody.innerHTML = slots.map(slot => `
        <tr>
            <td class="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">${slot}</td>
            ${days.map(day => {
                const cls = matrix[slot][day];
                if (!cls) return '<td class="px-4 py-3 text-gray-300 text-sm">-</td>';
                return `
                    <td class="px-4 py-3 align-top">
                        <div class="font-semibold text-gray-800 text-sm">${cls.subject_name}</div>
                        <div class="text-xs text-gray-600">${cls.room_number}</div>
                        ${cls.resource_details ? `<div class="text-xs text-primary-700 mt-1">📘 ${cls.resource_details}</div>` : ''}
                    </td>
                `;
            }).join('')}
        </tr>
    `).join('');
}

function renderAttendanceDetails(attendance) {
    // Update progress circle
    const percentage = attendance.overall_percentage;
    const offset = 251.2 * (1 - percentage / 100);
    document.getElementById('progressCircle').style.strokeDashoffset = offset;
    document.getElementById('progressCircle').style.stroke = 
        attendance.overall_status === 'SAFE' ? '#10b981' :
        attendance.overall_status === 'WARNING' ? '#f59e0b' : '#ef4444';
    document.getElementById('circlePercentage').textContent = `${Math.round(percentage)}%`;
    
    // Update status badge
    const statusBadge = document.getElementById('overallStatusBadge');
    statusBadge.textContent = attendance.overall_status;
    statusBadge.className = 'px-4 py-2 rounded-xl text-white font-semibold ' + (
        attendance.overall_status === 'SAFE' ? 'bg-status-safe' :
        attendance.overall_status === 'WARNING' ? 'bg-status-warning' : 'bg-status-danger'
    );
    
    // Render subjects
    const container = document.getElementById('subjectAttendanceContent');
    container.innerHTML = attendance.subjects.map(subject => {
        const statusColor = subject.status === 'SAFE' ? 'text-green-600' :
                          subject.status === 'WARNING' ? 'text-amber-600' : 'text-red-600';
        
        return `
            <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${subject.subject_name}</h4>
                        <p class="text-sm text-gray-600">${subject.attended} / ${subject.total} classes</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold ${statusColor}">${subject.percentage}%</p>
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded text-white ${
                            subject.status === 'SAFE' ? 'bg-status-safe' :
                            subject.status === 'WARNING' ? 'bg-status-warning' : 'bg-status-danger'
                        }">${subject.status}</span>
                    </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r ${
                        subject.status === 'SAFE' ? 'from-status-safe to-green-700' :
                        subject.status === 'WARNING' ? 'from-status-warning to-amber-700' :
                        'from-status-danger to-red-700'
                    } h-2 rounded-full transition" style="width: ${subject.percentage}%"></div>
                </div>
                ${subject.classes_needed ? `
                    <p class="text-sm text-red-600 mt-2 font-semibold">⚠️ Attend ${subject.classes_needed} more classes to reach 75%</p>
                ` : subject.safe_bunks !== undefined ? `
                    <p class="text-sm text-green-600 mt-2 font-semibold">✅ You have ${subject.safe_bunks} safe bunks remaining</p>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderAnnouncements() {
    const grid = document.getElementById('announcementsGrid');
    const announcements = dashboardData.announcements;
    
    if (announcements.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><p>No announcements</p></div>';
        return;
    }
    
    grid.innerHTML = announcements.map(ann => `
        <div class="announcement-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="announcement-image">
                ${ann.image_url ? `<img src="${ann.image_url}" alt="${ann.title}" class="w-full h-full object-cover">` : '<i class="fas fa-bullhorn"></i>'}
            </div>
            <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-800 flex-1">${ann.title}</h3>
                    ${ann.priority ? `<span class="priority-${ann.priority} px-2 py-1 text-xs rounded-full font-semibold">${ann.priority.toUpperCase()}</span>` : ''}
                </div>
                <p class="text-sm text-gray-600 mb-3">${ann.body.substring(0, 100)}...</p>
                <p class="text-xs text-gray-400">${new Date(ann.date).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

async function loadResources() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/student/resources?email=${encodeURIComponent(currentUser.email)}`);
        if (!response.ok) throw new Error('Failed to load resources');

        const resources = await response.json();
        const grid = document.getElementById('resourcesGrid');
        if (!grid) return;

        if (!resources.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><p>No resources available for your class.</p></div>';
            return;
        }

        grid.innerHTML = resources.map(res => `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-800 flex-1">${res.title}</h3>
                    <span class="px-2 py-1 text-xs rounded-full font-semibold bg-teal-100 text-teal-700">${res.resource_type}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${res.description || 'No description provided.'}</p>
                <p class="text-xs text-gray-500 mb-2">Target: ${res.dept}/${res.section} Sem ${res.sem === 0 ? 'ALL' : res.sem}</p>
                ${res.resource_url ? `<a href="${res.resource_url}" target="_blank" class="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition"><i class="fas fa-external-link-alt mr-2"></i>Open Resource</a>` : '<span class="text-xs text-gray-400">No URL attached</span>'}
            </div>
        `).join('');
    } catch (error) {
        showToast('Failed to load resources', 'error');
    }
}

// ============== VIEW SWITCHING ==============

function switchView(viewName) {
    const adminViews = ['manage-timetable', 'manage-announcements', 'manage-attendance', 'manage-resources'];
    const studentViews = ['dashboard', 'schedule', 'attendance', 'announcements', 'resources'];

    if (currentUser?.role === 'ADMIN' && studentViews.includes(viewName)) {
        viewName = 'manage-timetable';
    }

    if (adminViews.includes(viewName) && currentUser?.role === 'ADMIN' && !adminScope.configured) {
        showToast('Select admin scope first (dept/section/semester)', 'warning');
        openAdminScopeModal();
        return;
    }

    // Hide all views
    const views = document.querySelectorAll('.view-content');
    views.forEach(v => v.classList.add('hidden'));
    
    // Show selected view
    const view = document.getElementById(`view-${viewName}`);
    if (view) {
        view.classList.remove('hidden');
        
        // Load data for admin views
        if (viewName === 'manage-timetable') {
            loadAllTimetable();
        } else if (viewName === 'manage-announcements') {
            loadAllAnnouncements();
        } else if (viewName === 'manage-attendance') {
            loadAllAttendance();
        } else if (viewName === 'resources') {
            loadResources();
        } else if (viewName === 'manage-resources') {
            loadAllResources();
        }
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[onclick*="switchView('${viewName}')"]`);
    activeNav?.classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'schedule': 'Weekly Schedule',
        'attendance': 'Attendance Tracking',
        'announcements': 'Announcements',
        'resources': 'Resources',
        'manage-timetable': 'Manage Timetable',
        'manage-announcements': 'Manage Announcements',
        'manage-attendance': 'Manage Attendance',
        'manage-resources': 'Manage Resources'
    };
    
    document.getElementById('pageTitle').textContent = titles[viewName] || 'Dashboard';
}

// ============== QUICK SYNC ==============

async function quickSync() {
    const btn = document.getElementById('quickSyncBtn');
    btn.classList.add('syncing');
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/student/quick-sync?email=${currentUser.email}`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Sync failed');
        
        const data = await response.json();
        
        // Update attendance in dashboardData
        if (dashboardData) {
            dashboardData.attendance = data.attendance;
            dashboardData.announcements = data.announcements;
            renderDashboard();
        }
        
        showToast('✅ Data synced successfully!', 'success');
    } catch (error) {
        console.error('Sync error:', error);
        showToast('Failed to sync. Please try again.', 'error');
    } finally {
        btn.classList.remove('syncing');
        btn.disabled = false;
    }
}

// ============== CHATBOT FUNCTIONALITY ==============

function toggleChatbox() {
    const container = document.getElementById('chatContainer');
    const toggle = document.getElementById('chatToggle');
    if (!container || !toggle) return;

    const shouldOpen = container.classList.contains('hidden');
    isChatOpen = shouldOpen;
    container.classList.toggle('hidden', !shouldOpen);

    const icon = toggle.querySelector('i');
    if (icon) {
        icon.className = shouldOpen ? 'fas fa-times text-2xl' : 'fas fa-robot text-2xl';
    }
}

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                user_email: currentUser.email
            })
        });
        
        if (!response.ok) throw new Error('Chat failed');
        
        const data = await response.json();
        addChatMessage(data.response, 'bot');
        
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('Sorry, something went wrong. Try again!', 'bot');
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'flex items-end justify-end space-x-2';
        messageDiv.innerHTML = `
            <div class="chat-bubble-user p-3 rounded-lg max-w-xs text-sm">
                ${text}
            </div>
        `;
    } else {
        messageDiv.className = 'flex items-end space-x-2';
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-primary-600 text-sm"></i>
            </div>
            <div class="chat-bubble-bot p-3 rounded-lg max-w-xs text-sm text-gray-700">
                ${text}
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============== MOBILE RESPONSIVE ==============

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('hidden');
    }
}

// ============== UTILITY: Close chat when clicking outside ==============

document.addEventListener('click', (e) => {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (!chatWidget || !chatToggle || !isChatOpen) {
        return;
    }

    if (!chatWidget.contains(e.target)) {
        const container = document.getElementById('chatContainer');
        if (container) container.classList.add('hidden');
        const icon = chatToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-robot text-2xl';
        isChatOpen = false;
    }
});

// ============== ADMIN TIMETABLE MANAGEMENT (DELETE & PUT) ==============

function getAdminQuery() {
    const params = new URLSearchParams();
    params.set('admin_email', currentUser?.email || '');
    if (adminScope.configured) {
        if (adminScope.depts.length) params.set('filter_depts', adminScope.depts.join(','));
        if (adminScope.sections.length) params.set('filter_sections', adminScope.sections.join(','));
        if (adminScope.sems.length) params.set('filter_sems', adminScope.sems.join(','));
    }
    return params.toString();
}

function openAdminScopeModal() {
    if (currentUser?.role !== 'ADMIN') return;
    const modal = document.getElementById('adminScopeModal');
    if (!modal) return;
    modal.classList.remove('hidden');
}

function closeAdminScopeModal() {
    const modal = document.getElementById('adminScopeModal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function saveAdminScope() {
    const depts = getSelectedValues('adminScopeDepts');
    const sections = getSelectedValues('adminScopeSections');
    const sems = getSelectedValues('adminScopeSems').map(Number);

    if (!depts.length || !sections.length) {
        showToast('Select at least one department and section', 'error');
        return;
    }

    adminScope = {
        configured: true,
        depts,
        sections,
        sems
    };

    const ttDept = document.getElementById('newTtDept');
    const ttSection = document.getElementById('newTtSection');
    const ttSem = document.getElementById('newTtSem');
    if (ttDept && depts[0]) ttDept.value = depts[0];
    if (ttSection && sections[0]) ttSection.value = sections[0];
    if (ttSem && sems[0]) ttSem.value = sems[0];

    const resDept = document.getElementById('newResDept');
    const resSection = document.getElementById('newResSection');
    const resSem = document.getElementById('newResSem');
    if (resDept && depts[0]) resDept.value = depts[0];
    if (resSection && sections[0]) resSection.value = sections[0];
    if (resSem && sems[0]) resSem.value = sems[0];

    const annDept = document.getElementById('newAnnTargetDepts');
    const annSection = document.getElementById('newAnnTargetSections');
    const annSem = document.getElementById('newAnnTargetSemesters');
    if (annDept) Array.from(annDept.options).forEach(opt => { opt.selected = depts.includes(opt.value); });
    if (annSection) Array.from(annSection.options).forEach(opt => { opt.selected = sections.includes(opt.value); });
    if (annSem) Array.from(annSem.options).forEach(opt => { opt.selected = sems.map(String).includes(opt.value); });

    closeAdminScopeModal();
    showToast('✅ Admin scope applied', 'success');
    if (document.getElementById('view-manage-timetable') && !document.getElementById('view-manage-timetable').classList.contains('hidden')) loadAllTimetable();
    if (document.getElementById('view-manage-announcements') && !document.getElementById('view-manage-announcements').classList.contains('hidden')) loadAllAnnouncements();
    if (document.getElementById('view-manage-attendance') && !document.getElementById('view-manage-attendance').classList.contains('hidden')) loadAllAttendance();
    if (document.getElementById('view-manage-resources') && !document.getElementById('view-manage-resources').classList.contains('hidden')) loadAllResources();
}

function getSelectedValues(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];
    return Array.from(select.selectedOptions).map(option => option.value);
}

async function loadAllTimetable() {
    try {
        const response = await fetch(`${API_BASE}/admin/timetable?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load timetable');
        
        const data = await response.json();
        const tbody = document.getElementById('timetableManagementBody');
        
        if (data.entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No timetable entries</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.entries.map(entry => `
            <tr>
                <td class="px-4 py-3 text-gray-800 font-medium">${entry.day_of_week}</td>
                <td class="px-4 py-3 text-gray-600">${entry.period_slots}</td>
                <td class="px-4 py-3 text-gray-600">${entry.subject_name}</td>
                <td class="px-4 py-3 text-gray-600">${entry.room_number}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">${entry.resource_details || '-'}</td>
                <td class="px-4 py-3 text-gray-600">${entry.dept} - ${entry.section}</td>
                <td class="px-4 py-3 space-x-2">
                    <button onclick="openEditTimetableModal(${entry.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteTimetableEntry(${entry.id})" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load timetable error:', error);
        showToast('Failed to load timetable entries', 'error');
    }
}

async function openEditTimetableModal(entryId) {
    try {
        const response = await fetch(`${API_BASE}/admin/timetable/${entryId}?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load entry');
        
        const entry = await response.json();
        
        document.getElementById('editTimetableId').value = entry.id;
        document.getElementById('editTtDay').value = entry.day_of_week;
        document.getElementById('editTtTime').value = entry.period_slots;
        document.getElementById('editTtSubject').value = entry.subject_name;
        document.getElementById('editTtRoom').value = entry.room_number;
        document.getElementById('editTtFaculty').value = entry.faculty_name || '';
        document.getElementById('editTtResource').value = entry.resource_details || '';
        document.getElementById('editTtDept').value = entry.dept;
        document.getElementById('editTtSection').value = entry.section;
        document.getElementById('editTtSem').value = entry.sem;
        
        document.getElementById('editTimetableModal').classList.remove('hidden');
    } catch (error) {
        console.error('Open modal error:', error);
        showToast('Failed to load entry', 'error');
    }
}

function closeEditTimetableModal() {
    document.getElementById('editTimetableModal').classList.add('hidden');
}

async function updateTimetableEntry() {
    const entryId = document.getElementById('editTimetableId').value;
    
    const data = {
        day_of_week: document.getElementById('editTtDay').value,
        period_slots: document.getElementById('editTtTime').value,
        subject_name: document.getElementById('editTtSubject').value,
        room_number: document.getElementById('editTtRoom').value,
        faculty_name: document.getElementById('editTtFaculty').value || null,
        resource_details: document.getElementById('editTtResource').value || null,
        dept: document.getElementById('editTtDept').value.trim(),
        section: document.getElementById('editTtSection').value.trim(),
        sem: parseInt(document.getElementById('editTtSem').value, 10)
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/timetable/${entryId}?${getAdminQuery()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Update failed');
        
        closeEditTimetableModal();
        showToast('✅ Timetable entry updated successfully!', 'success');
        loadAllTimetable();
    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update entry', 'error');
    }
}

async function deleteTimetableEntry(entryId) {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/timetable/${entryId}?${getAdminQuery()}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Delete failed');
        
        showToast('✅ Timetable entry deleted successfully!', 'success');
        loadAllTimetable();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete entry', 'error');
    }
}

async function createTimetableEntry() {
    const scopedDept = adminScope.depts[0] || '';
    const scopedSection = adminScope.sections[0] || '';
    const scopedSem = adminScope.sems[0];
    const data = {
        day_of_week: document.getElementById('newTtDay').value,
        period_slots: document.getElementById('newTtTime').value.trim(),
        subject_name: document.getElementById('newTtSubject').value.trim(),
        room_number: document.getElementById('newTtRoom').value.trim(),
        faculty_name: document.getElementById('newTtFaculty').value.trim() || null,
        resource_details: document.getElementById('newTtResource').value.trim() || null,
        dept: (document.getElementById('newTtDept').value.trim() || scopedDept),
        section: (document.getElementById('newTtSection').value.trim() || scopedSection),
        sem: parseInt(document.getElementById('newTtSem').value || (scopedSem !== undefined ? String(scopedSem) : ''), 10)
    };

    if (!data.period_slots || !data.subject_name || !data.room_number || !data.dept || !data.section || Number.isNaN(data.sem)) {
        showToast('Please fill all required timetable fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/timetable?${getAdminQuery()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Create failed');
        }

        showToast('✅ Timetable entry added', 'success');
        loadAllTimetable();
    } catch (error) {
        showToast(error.message || 'Failed to create timetable entry', 'error');
    }
}

async function uploadTimetableExcel() {
    const input = document.getElementById('timetableExcelInput');
    if (!input.files.length) return;

    const formData = new FormData();
    formData.append('admin_email', currentUser.email);
    formData.append('file', input.files[0]);

    try {
        const response = await fetch(`${API_BASE}/admin/timetable/upload-excel`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Upload failed');
        showToast(`✅ Timetable uploaded (${result.created} rows)`, 'success');
        input.value = '';
        loadAllTimetable();
    } catch (error) {
        showToast(error.message || 'Failed to upload timetable excel', 'error');
    }
}

// ============== ADMIN ANNOUNCEMENT MANAGEMENT (DELETE & PUT) ==============

async function loadAllAnnouncements() {
    try {
        const response = await fetch(`${API_BASE}/admin/announcements?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load announcements');
        
        const data = await response.json();
        const grid = document.getElementById('announcementManagementGrid');
        
        if (data.announcements.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><p>No announcements</p></div>';
            return;
        }
        
        grid.innerHTML = data.announcements.map(ann => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-800 flex-1">${ann.title}</h4>
                    <span class="px-2 py-1 text-xs rounded-full font-semibold ${
                        ann.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        ann.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                    }">${ann.priority}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${ann.body}</p>
                <p class="text-xs text-gray-400 mb-3">Dept: ${(ann.target_depts && ann.target_depts.length) ? ann.target_depts.join(', ') : ann.target_dept}</p>
                <p class="text-xs text-gray-400 mb-3">Sections: ${(ann.target_sections && ann.target_sections.length) ? ann.target_sections.join(', ') : 'All'}</p>
                <div class="flex space-x-2">
                    <button onclick="openEditAnnouncementModal(${ann.id})" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteAnnouncement(${ann.id})" class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Load announcements error:', error);
        showToast('Failed to load announcements', 'error');
    }
}

async function openEditAnnouncementModal(announcementId) {
    try {
        const response = await fetch(`${API_BASE}/admin/announcement/${announcementId}?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load announcement');
        
        const ann = await response.json();
        
        document.getElementById('editAnnouncementId').value = ann.id;
        document.getElementById('editAnnTitle').value = ann.title;
        document.getElementById('editAnnBody').value = ann.body;
        document.getElementById('editAnnDept').value = ann.target_dept;
        document.getElementById('editAnnPriority').value = ann.priority;
        document.getElementById('editAnnImage').value = ann.image_url || '';

        const deptSelect = document.getElementById('editAnnTargetDepts');
        const sectionSelect = document.getElementById('editAnnTargetSections');
        const semSelect = document.getElementById('editAnnTargetSemesters');

        Array.from(deptSelect.options).forEach(opt => opt.selected = (ann.target_depts || []).includes(opt.value));
        Array.from(sectionSelect.options).forEach(opt => opt.selected = (ann.target_sections || []).includes(opt.value));
        Array.from(semSelect.options).forEach(opt => opt.selected = (ann.target_semesters || []).map(String).includes(opt.value));
        
        document.getElementById('editAnnouncementModal').classList.remove('hidden');
    } catch (error) {
        console.error('Open modal error:', error);
        showToast('Failed to load announcement', 'error');
    }
}

function closeEditAnnouncementModal() {
    document.getElementById('editAnnouncementModal').classList.add('hidden');
}

async function updateAnnouncement() {
    const announcementId = document.getElementById('editAnnouncementId').value;
    
    const data = {
        title: document.getElementById('editAnnTitle').value,
        body: document.getElementById('editAnnBody').value,
        target_dept: document.getElementById('editAnnDept').value,
        target_depts: getSelectedValues('editAnnTargetDepts'),
        target_sections: getSelectedValues('editAnnTargetSections'),
        target_semesters: getSelectedValues('editAnnTargetSemesters').map(Number),
        priority: document.getElementById('editAnnPriority').value,
        image_url: document.getElementById('editAnnImage').value.trim() || null
    };
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcement/${announcementId}?${getAdminQuery()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Update failed');
        
        closeEditAnnouncementModal();
        showToast('✅ Announcement updated successfully!', 'success');
        loadAllAnnouncements();
    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update announcement', 'error');
    }
}

async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcement/${announcementId}?${getAdminQuery()}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Delete failed');
        
        showToast('✅ Announcement deleted successfully!', 'success');
        loadAllAnnouncements();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete announcement', 'error');
    }
}

async function createAnnouncement() {
    const scopeDepts = adminScope.depts || [];
    const scopeSections = adminScope.sections || [];
    const scopeSems = adminScope.sems || [];

    const selectedDepts = getSelectedValues('newAnnTargetDepts');
    const selectedSections = getSelectedValues('newAnnTargetSections');
    const selectedSems = getSelectedValues('newAnnTargetSemesters').map(Number);

    const data = {
        title: document.getElementById('newAnnTitle').value.trim(),
        body: document.getElementById('newAnnBody').value.trim(),
        target_dept: 'ALL',
        target_depts: selectedDepts.length ? selectedDepts : scopeDepts,
        target_sections: selectedSections.length ? selectedSections : scopeSections,
        target_semesters: selectedSems.length ? selectedSems : scopeSems,
        image_url: document.getElementById('newAnnImage').value.trim() || null,
        priority: document.getElementById('newAnnPriority').value
    };

    if (!data.title || !data.body) {
        showToast('Title and body are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/announcement?${getAdminQuery()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Create failed');

        showToast('✅ Announcement posted', 'success');
        loadAllAnnouncements();
    } catch (error) {
        showToast(error.message || 'Failed to create announcement', 'error');
    }
}

async function uploadAnnouncementsExcel() {
    const input = document.getElementById('announcementExcelInput');
    if (!input.files.length) return;

    const formData = new FormData();
    formData.append('admin_email', currentUser.email);
    formData.append('file', input.files[0]);

    try {
        const response = await fetch(`${API_BASE}/admin/announcements/upload-excel`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Upload failed');
        showToast(`✅ Announcements uploaded (${result.created} rows)`, 'success');
        input.value = '';
        loadAllAnnouncements();
    } catch (error) {
        showToast(error.message || 'Failed to upload announcements excel', 'error');
    }
}

// ============== ADMIN ATTENDANCE MANAGEMENT (DELETE & PUT) ==============

async function loadAllAttendance() {
    try {
        const response = await fetch(`${API_BASE}/admin/attendance?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load attendance');
        
        const data = await response.json();
        const tbody = document.getElementById('attendanceManagementBody');
        
        if (data.records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No attendance records</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.records.map(record => {
            const percentage = record.total > 0 ? ((record.attended / record.total) * 100).toFixed(2) : 0;
            return `
                <tr>
                    <td class="px-4 py-3 text-gray-800 font-medium text-sm">${record.student_email}</td>
                    <td class="px-4 py-3 text-gray-600">${record.subject_name}</td>
                    <td class="px-4 py-3 text-gray-600">${record.attended}</td>
                    <td class="px-4 py-3 text-gray-600">${record.total}</td>
                    <td class="px-4 py-3 font-semibold ${percentage >= 75 ? 'text-green-600' : percentage >= 65 ? 'text-amber-600' : 'text-red-600'}">${percentage}%</td>
                    <td class="px-4 py-3 space-x-2">
                        <button onclick="openEditAttendanceModal('${record.student_email}', '${record.subject_name}', ${record.attended}, ${record.total})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button onclick="deleteAttendanceRecord('${record.student_email}', '${record.subject_name}')" class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Load attendance error:', error);
        showToast('Failed to load attendance records', 'error');
    }
}

async function openEditAttendanceModal(email, subject, attended, total) {
    document.getElementById('editAttendanceEmail').value = email;
    document.getElementById('editAttendanceSubject').value = subject;
    document.getElementById('editAttendanceEmailDisplay').value = email;
    document.getElementById('editAttendanceSubjectDisplay').value = subject;
    document.getElementById('editAttendanceAttended').value = attended;
    document.getElementById('editAttendanceTotal').value = total;
    
    document.getElementById('editAttendanceModal').classList.remove('hidden');
}

function closeEditAttendanceModal() {
    document.getElementById('editAttendanceModal').classList.add('hidden');
}

async function updateAttendance() {
    const email = document.getElementById('editAttendanceEmail').value;
    const subject = document.getElementById('editAttendanceSubject').value;
    const attended = parseInt(document.getElementById('editAttendanceAttended').value);
    const total = parseInt(document.getElementById('editAttendanceTotal').value);
    
    if (attended > total) {
        showToast('Classes attended cannot exceed total classes', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/attendance/${email}/${encodeURIComponent(subject)}?${getAdminQuery()}&attended=${attended}&total=${total}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Update failed');
        
        closeEditAttendanceModal();
        showToast('✅ Attendance updated successfully!', 'success');
        loadAllAttendance();
    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update attendance', 'error');
    }
}

async function deleteAttendanceRecord(email, subject) {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/attendance/${email}/${encodeURIComponent(subject)}?${getAdminQuery()}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Delete failed');
        
        showToast('✅ Attendance record deleted successfully!', 'success');
        loadAllAttendance();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete attendance record', 'error');
    }
}

async function createAttendanceRecord() {
    const student_email = document.getElementById('newAttEmail').value.trim();
    const subject_name = document.getElementById('newAttSubject').value.trim();
    const attended = parseInt(document.getElementById('newAttAttended').value, 10);
    const total = parseInt(document.getElementById('newAttTotal').value, 10);

    if (!student_email || !subject_name || Number.isNaN(attended) || Number.isNaN(total)) {
        showToast('Please fill all attendance fields', 'error');
        return;
    }

    if (attended > total) {
        showToast('Classes attended cannot exceed total classes', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/attendance?${getAdminQuery()}&student_email=${encodeURIComponent(student_email)}&subject_name=${encodeURIComponent(subject_name)}&attended=${attended}&total=${total}`, {
            method: 'POST'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Create failed');

        showToast('✅ Attendance saved', 'success');
        loadAllAttendance();
    } catch (error) {
        showToast(error.message || 'Failed to save attendance', 'error');
    }
}

async function uploadAttendanceExcel() {
    const input = document.getElementById('attendanceExcelInput');
    if (!input.files.length) return;

    const formData = new FormData();
    formData.append('admin_email', currentUser.email);
    formData.append('file', input.files[0]);

    try {
        const response = await fetch(`${API_BASE}/admin/attendance/upload-excel`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Upload failed');

        showToast(`✅ Attendance uploaded (Created: ${result.created}, Updated: ${result.updated})`, 'success');
        input.value = '';
        loadAllAttendance();
    } catch (error) {
        showToast(error.message || 'Failed to upload attendance excel', 'error');
    }
}

// ============== RESOURCE TAB (STUDENT + ADMIN) ==============

async function loadAllResources() {
    try {
        const response = await fetch(`${API_BASE}/admin/resources?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load resources');

        const data = await response.json();
        const grid = document.getElementById('resourceManagementGrid');

        if (!data.resources.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><p>No resources yet.</p></div>';
            return;
        }

        grid.innerHTML = data.resources.map(res => `
            <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="font-semibold text-gray-800 flex-1">${res.title}</h4>
                    <span class="px-2 py-1 text-xs rounded-full font-semibold bg-teal-100 text-teal-700">${res.resource_type}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${res.description || 'No description'}</p>
                <p class="text-xs text-gray-400 mb-3">${res.dept}/${res.section} • Sem ${res.sem === 0 ? 'ALL' : res.sem}</p>
                ${res.resource_url ? `<a href="${res.resource_url}" target="_blank" class="text-xs text-primary-600 hover:text-primary-700 font-medium">Open Link</a>` : '<span class="text-xs text-gray-400">No link</span>'}
                <div class="flex space-x-2 mt-3">
                    <button onclick="openEditResourceModal(${res.id})" class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteResource(${res.id})" class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showToast('Failed to load resources', 'error');
    }
}

async function createResource() {
    const scopedDept = adminScope.depts[0] || 'ALL';
    const scopedSection = adminScope.sections[0] || 'ALL';
    const scopedSem = adminScope.sems[0] !== undefined ? adminScope.sems[0] : 0;
    const data = {
        title: document.getElementById('newResTitle').value.trim(),
        description: document.getElementById('newResDescription').value.trim() || null,
        resource_type: document.getElementById('newResType').value,
        resource_url: document.getElementById('newResUrl').value.trim() || null,
        dept: (document.getElementById('newResDept').value.trim() || scopedDept).toUpperCase(),
        section: (document.getElementById('newResSection').value.trim() || scopedSection).toUpperCase(),
        sem: parseInt(document.getElementById('newResSem').value || String(scopedSem), 10)
    };

    if (!data.title) {
        showToast('Resource title is required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/resources?${getAdminQuery()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Create failed');

        showToast('✅ Resource added', 'success');
        loadAllResources();
    } catch (error) {
        showToast(error.message || 'Failed to add resource', 'error');
    }
}

async function openEditResourceModal(resourceId) {
    try {
        const response = await fetch(`${API_BASE}/admin/resources/${resourceId}?${getAdminQuery()}`);
        if (!response.ok) throw new Error('Failed to load resource');

        const res = await response.json();
        document.getElementById('editResourceId').value = res.id;
        document.getElementById('editResTitle').value = res.title;
        document.getElementById('editResType').value = res.resource_type;
        document.getElementById('editResUrl').value = res.resource_url || '';
        document.getElementById('editResDescription').value = res.description || '';
        document.getElementById('editResDept').value = res.dept;
        document.getElementById('editResSection').value = res.section;
        document.getElementById('editResSem').value = res.sem;

        document.getElementById('editResourceModal').classList.remove('hidden');
    } catch (error) {
        showToast('Failed to load resource', 'error');
    }
}

function closeEditResourceModal() {
    document.getElementById('editResourceModal').classList.add('hidden');
}

async function updateResource() {
    const resourceId = document.getElementById('editResourceId').value;
    const data = {
        title: document.getElementById('editResTitle').value.trim(),
        description: document.getElementById('editResDescription').value.trim() || null,
        resource_type: document.getElementById('editResType').value,
        resource_url: document.getElementById('editResUrl').value.trim() || null,
        dept: (document.getElementById('editResDept').value.trim() || 'ALL').toUpperCase(),
        section: (document.getElementById('editResSection').value.trim() || 'ALL').toUpperCase(),
        sem: parseInt(document.getElementById('editResSem').value || '0', 10)
    };

    if (!data.title) {
        showToast('Resource title is required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/resources/${resourceId}?${getAdminQuery()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Update failed');

        closeEditResourceModal();
        showToast('✅ Resource updated', 'success');
        loadAllResources();
    } catch (error) {
        showToast(error.message || 'Failed to update resource', 'error');
    }
}

async function deleteResource(resourceId) {
    if (!confirm('Delete this resource?')) return;

    try {
        const response = await fetch(`${API_BASE}/admin/resources/${resourceId}?${getAdminQuery()}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Delete failed');

        showToast('✅ Resource deleted', 'success');
        loadAllResources();
    } catch (error) {
        showToast(error.message || 'Failed to delete resource', 'error');
    }
}
