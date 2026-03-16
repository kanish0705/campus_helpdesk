/**
 * College Management System - Frontend JavaScript
 */

const API_BASE = 'http://127.0.0.1:8000';

// State Management
let currentUser = null;
let isAdminView = false;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const mainContainer = document.getElementById('mainContainer');
const demoToggle = document.getElementById('demoToggle');
const userInfo = document.getElementById('userInfo');
const studentPanel = document.getElementById('studentPanel');
const adminPanel = document.getElementById('adminPanel');
const chatbotWidget = document.getElementById('chatbotWidget');

// ============== Utility Functions ==============

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

// ============== Authentication ==============

function handleLoginKeypress(event) {
    if (event.key === 'Enter') {
        login();
    }
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
            showToast(error.detail || 'Invalid email or password', 'error');
            return;
        }
        
        currentUser = await response.json();
        showToast(`Welcome, ${currentUser.name}!`, 'success');
        
        // Update UI
        loginSection.style.display = 'none';
        mainContainer.classList.add('active');
        userInfo.style.display = 'flex';
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userRole').textContent = currentUser.role;
        
        // Show toggle only for admin users
        if (currentUser.role === 'ADMIN') {
            demoToggle.style.display = 'flex';
        }
        
        // Show chatbot for students
        if (currentUser.role === 'STUDENT') {
            chatbotWidget.style.display = 'block';
        }
        
        // Load dashboard data
        loadDashboard();
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Connection error. Make sure the server is running.', 'error');
    }
}

function logout() {
    currentUser = null;
    isAdminView = false;
    
    // Reset UI
    loginSection.style.display = 'flex';
    mainContainer.classList.remove('active');
    demoToggle.style.display = 'none';
    userInfo.style.display = 'none';
    chatbotWidget.style.display = 'none';
    
    // Reset toggle
    document.getElementById('toggleSwitch').classList.remove('admin');
    document.getElementById('studentLabel').classList.add('active');
    document.getElementById('adminLabel').classList.remove('active');
    studentPanel.classList.add('active');
    adminPanel.classList.remove('active');
    
    // Clear inputs
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    // Clear chat messages
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="chat-message bot">
            <div class="message-bubble">
                👋 Hello! I'm your college assistant. Ask me about your classes, schedule, announcements, or resources!
            </div>
        </div>
    `;
    
    showToast('Logged out successfully', 'info');
}

// ============== View Toggle ==============

function toggleView() {
    isAdminView = !isAdminView;
    
    const toggle = document.getElementById('toggleSwitch');
    const studentLabel = document.getElementById('studentLabel');
    const adminLabel = document.getElementById('adminLabel');
    
    if (isAdminView) {
        toggle.classList.add('admin');
        studentLabel.classList.remove('active');
        adminLabel.classList.add('active');
        studentPanel.classList.remove('active');
        adminPanel.classList.add('active');
        chatbotWidget.style.display = 'none';
        loadAdminData();
    } else {
        toggle.classList.remove('admin');
        studentLabel.classList.add('active');
        adminLabel.classList.remove('active');
        studentPanel.classList.add('active');
        adminPanel.classList.remove('active');
        chatbotWidget.style.display = 'block';
        loadDashboard();
    }
}

// ============== Scope Selection State ==============

let scopeLocked = false;
let lockedDept = '';
let lockedSem = '';
let lockedSections = [];
let currentViewSection = '';

// ============== Scope Selection Functions ==============

function lockSelection() {
    const dept = document.getElementById('scopeDept').value;
    const sem = document.getElementById('scopeSem').value;
    
    // Get selected sections
    const checkboxes = document.querySelectorAll('#sectionChecklist input[type="checkbox"]:checked');
    const sections = Array.from(checkboxes).map(cb => cb.value);
    
    if (!dept || !sem || sections.length === 0) {
        showToast('Please select Department, Semester, and at least one Section', 'error');
        return;
    }
    
    // Lock the selection
    scopeLocked = true;
    lockedDept = dept;
    lockedSem = sem;
    lockedSections = sections;
    currentViewSection = sections[0]; // Default to first section
    
    // Update locked scope banner
    document.getElementById('lockedDept').textContent = dept;
    document.getElementById('lockedSem').textContent = `Sem ${sem}`;
    document.getElementById('lockedSections').textContent = sections.join(', ');
    
    // Update current view label with prominent formatting
    const sectionsText = sections.length > 1 ? `Sections ${sections.join(', ')}` : `Section ${sections[0]}`;
    document.getElementById('currentViewLabel').innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i>Viewing: ${dept} - Sem ${sem} - ${sectionsText}`;
    
    // Show admin tools, hide scope gate
    document.getElementById('scopeGate').style.display = 'none';
    document.getElementById('adminToolsContainer').style.display = 'block';
    
    // Create section view tabs
    createSectionViewTabs();
    
    // Load data for the locked scope
    loadScopeData();
    
    showToast(`Scope locked: ${dept} - Sem ${sem} - Sections ${sections.join(', ')}`, 'success');
}

function unlockSelection() {
    // Show scope gate, hide admin tools
    document.getElementById('scopeGate').style.display = 'block';
    document.getElementById('adminToolsContainer').style.display = 'none';
    
    scopeLocked = false;
    
    showToast('Scope unlocked. You can now change your selection.', 'info');
}

function clearSelection() {
    // Reset all selections
    document.getElementById('scopeDept').value = '';
    document.getElementById('scopeSem').value = '';
    
    // Uncheck all section checkboxes
    document.querySelectorAll('#sectionChecklist input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Reset state
    scopeLocked = false;
    lockedDept = '';
    lockedSem = '';
    lockedSections = [];
    currentViewSection = '';
    
    // Reset current view label
    document.getElementById('currentViewLabel').innerHTML = '<i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i>Viewing: Select a scope to begin';
    
    // Show scope gate, hide admin tools
    document.getElementById('scopeGate').style.display = 'block';
    document.getElementById('adminToolsContainer').style.display = 'none';
    
    showToast('Selection cleared. Choose a new scope to continue.', 'info');
}

function createSectionViewTabs() {
    const tabsContainer = document.getElementById('sectionTabButtons');
    const tabsWrapper = document.getElementById('sectionViewTabs');
    
    if (lockedSections.length <= 1) {
        tabsWrapper.style.display = 'none';
        return;
    }
    
    tabsWrapper.style.display = 'block';
    tabsContainer.innerHTML = lockedSections.map((section, i) => `
        <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="switchSectionView('${section}', this)">
            Section ${section}
        </button>
    `).join('');
}

function switchSectionView(section, btn) {
    currentViewSection = section;
    
    // Update active tab
    document.querySelectorAll('#sectionTabButtons .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Reload timetable for this section
    loadScopeTimetable(section);
}

async function loadScopeData() {
    // Load resources for the scope
    loadScopeResources();
    
    // Load announcements for the scope
    loadScopeAnnouncements();
    
    // Load timetable for the first section
    if (lockedSections.length > 0) {
        loadScopeTimetable(lockedSections[0]);
    }
    
    // Load users table
    loadUsers();
}

async function loadScopeResources() {
    const container = document.getElementById('scopeResourcesList');
    
    try {
        const response = await fetch(`${API_BASE}/admin/resources?dept=${encodeURIComponent(lockedDept)}&sem=${lockedSem}`);
        const resources = await response.json();
        
        if (resources.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">No resources yet</p>';
            return;
        }
        
        container.innerHTML = resources.map(item => `
            <div class="resource-item" style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #e9d5ff; font-size: 0.9rem;">${item.title}</div>
                        <div style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">${item.subject}</div>
                    </div>
                    <button onclick="deleteResource(${item.id})" style="background: rgba(239,68,68,0.3); border: none; color: #fca5a5; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading resources:', error);
        container.innerHTML = '<p style="color: #fca5a5;">Error loading resources</p>';
    }
}

async function loadScopeAnnouncements() {
    const container = document.getElementById('scopeAnnouncementsList');
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcements`);
        const announcements = await response.json();
        
        // Filter for this department or ALL
        const filtered = announcements.filter(a => a.target_dept === lockedDept || a.target_dept === 'ALL');
        
        if (filtered.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">No announcements</p>';
            return;
        }
        
        container.innerHTML = filtered.map(item => `
            <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="color: #e9d5ff; font-size: 0.9rem;">${item.title}</div>
                <div style="color: rgba(255,255,255,0.6); font-size: 0.75rem; margin-top: 4px;">${item.content.substring(0, 50)}...</div>
                <span style="display: inline-block; margin-top: 4px; background: rgba(167,139,250,0.2); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; color: #c4b5fd;">${item.target_dept}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p style="color: #fca5a5;">Error loading announcements</p>';
    }
}

async function loadScopeTimetable(section) {
    const container = document.getElementById('scopeTimetableView');
    
    try {
        const response = await fetch(`${API_BASE}/admin/view-data?dept=${encodeURIComponent(lockedDept)}&section=${encodeURIComponent(section)}&sem=${lockedSem}`);
        const data = await response.json();
        const timetable = data.timetable;
        
        // Update the current view label with prominent formatting
        document.getElementById('currentViewLabel').innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right: 8px;"></i>Viewing: ${lockedDept} - Sem ${lockedSem} - Section ${section}`;
        
        if (timetable.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>No timetable entries for Section ${section}</p>
                    <p style="font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-top: 10px;">Upload an Excel file to add entries</p>
                </div>
            `;
            return;
        }
        
        // Sort by day order then time
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sortedTimetable = [...timetable].sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.time.localeCompare(b.time);
        });
        
        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Time</th>
                            <th>Subject</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedTimetable.map(item => `
                            <tr>
                                <td><span class="timetable-day-badge">${item.day}</span></td>
                                <td>${item.time}</td>
                                <td>${item.subject}</td>
                                <td>${item.room}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p style="margin-top: 15px; color: rgba(255,255,255,0.6); font-size: 0.9rem;"><i class="fas fa-info-circle" style="margin-right: 6px;"></i>Total: ${timetable.length} classes scheduled</p>
        `;
        
    } catch (error) {
        console.error('Error loading timetable:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading timetable</p></div>';
    }
}

async function addResource() {
    const title = document.getElementById('resourceTitle').value.trim();
    const link = document.getElementById('resourceLink').value.trim();
    const subject = document.getElementById('resourceSubject').value.trim();
    
    if (!title || !link || !subject) {
        showToast('Please fill in all resource fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/resource`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                link,
                subject,
                dept: lockedDept,
                sem: parseInt(lockedSem)
            })
        });
        
        if (response.ok) {
            showToast('Resource added successfully!', 'success');
            document.getElementById('resourceTitle').value = '';
            document.getElementById('resourceLink').value = '';
            document.getElementById('resourceSubject').value = '';
            loadScopeResources();
        } else {
            const error = await response.json();
            showToast(error.detail || 'Failed to add resource', 'error');
        }
    } catch (error) {
        console.error('Error adding resource:', error);
        showToast('Connection error', 'error');
    }
}

async function deleteResource(id) {
    if (!confirm('Delete this resource?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/resource/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Resource deleted', 'success');
            loadScopeResources();
        } else {
            showToast('Failed to delete resource', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Connection error', 'error');
    }
}

async function createScopedAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    
    if (!title || !content) {
        showToast('Please fill in title and content', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                content,
                target_dept: lockedDept // Use the locked department
            })
        });
        
        if (response.ok) {
            showToast('Announcement posted!', 'success');
            document.getElementById('annTitle').value = '';
            document.getElementById('annContent').value = '';
            loadScopeAnnouncements();
        } else {
            showToast('Failed to post announcement', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Connection error', 'error');
    }
}

async function clearScopeTimetable() {
    if (!confirm(`This will delete ALL timetable entries for ${lockedDept} - Sem ${lockedSem} - Sections ${lockedSections.join(', ')}. Continue?`)) {
        return;
    }
    
    try {
        // Pass all sections as comma-separated string
        const sectionsParam = lockedSections.join(',');
        const response = await fetch(`${API_BASE}/admin/timetable/clear?dept=${encodeURIComponent(lockedDept)}&sem=${lockedSem}&sections=${encodeURIComponent(sectionsParam)}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showToast(result.message || 'Timetable cleared for selected scope', 'success');
        loadScopeTimetable(currentViewSection || lockedSections[0]);
        
    } catch (error) {
        console.error('Error clearing timetable:', error);
        showToast('Failed to clear timetable', 'error');
    }
}

function switchAdminTab(tabName) {
    // Update buttons
    document.querySelectorAll('#adminToolsContainer > div:last-child .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update content
    document.querySelectorAll('#adminToolsContainer .tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}AdminTab`).classList.add('active');
    
    // Load data if needed
    if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'alltimetable') {
        loadAllTimetable();
    }
}

// ============== Student Dashboard ==============

async function loadDashboard() {
    if (!currentUser) return;
    
    // Update today's day
    document.getElementById('todayDay').textContent = getDayName();
    
    try {
        const response = await fetch(`${API_BASE}/student/dashboard?email=${encodeURIComponent(currentUser.email)}`);
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard');
        }
        
        const data = await response.json();
        
        // Render timetable (today)
        renderTimetable(data.timetable);
        
        // Render weekly schedule (full week)
        renderWeeklySchedule(data.timetable);
        
        // Render announcements
        renderAnnouncements(data.announcements);
        
        // Render resources
        renderResources(data.resources);
        
        // Render profile
        renderProfile();
        
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function renderTimetable(timetable) {
    const container = document.getElementById('timetableContent');
    const today = getDayName();
    
    // Filter today's classes
    const todayClasses = timetable.filter(t => t.day === today);
    
    if (todayClasses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>No classes scheduled for today!</p>
            </div>
        `;
        return;
    }
    
    // Sort by time
    todayClasses.sort((a, b) => a.time.localeCompare(b.time));
    
    container.innerHTML = todayClasses.map(item => `
        <div class="timetable-item">
            <div class="timetable-time">${item.time}</div>
            <div class="timetable-details">
                <div class="timetable-subject">${item.subject}</div>
                <div class="timetable-room"><i class="fas fa-map-marker-alt"></i> Room ${item.room}</div>
            </div>
        </div>
    `).join('');
}

function renderAnnouncements(announcements) {
    const container = document.getElementById('announcementsContent');
    document.getElementById('announcementCount').textContent = announcements.length;
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>No announcements at the moment</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = announcements.map(item => `
        <div class="announcement-item">
            <div class="announcement-title">${item.title}</div>
            <div class="announcement-content">${item.content}</div>
            <span class="announcement-dept">${item.target_dept === 'ALL' ? 'All Departments' : item.target_dept}</span>
        </div>
    `).join('');
}

function renderResources(resources) {
    const container = document.getElementById('resourcesContent');
    document.getElementById('resourceCount').textContent = resources.length;
    
    if (resources.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No resources available yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = resources.map(item => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div>
                    <div class="resource-title">${item.title}</div>
                    <div class="resource-subject">${item.subject}</div>
                </div>
            </div>
            <a href="${item.link}" target="_blank" class="resource-link">
                <i class="fas fa-external-link-alt"></i> Open
            </a>
        </div>
    `).join('');
}

function renderProfile() {
    const container = document.getElementById('profileContent');
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #8b5cf6, #a78bfa); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user" style="font-size: 2rem; color: #fff;"></i>
            </div>
            <h4 style="color: #e9d5ff; margin-bottom: 5px;">${currentUser.name}</h4>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 20px;">${currentUser.email}</p>
            <div style="text-align: left; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: rgba(255,255,255,0.6);">Department</span>
                    <span style="color: #c4b5fd;">${currentUser.dept}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: rgba(255,255,255,0.6);">Section</span>
                    <span style="color: #c4b5fd;">${currentUser.section}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: rgba(255,255,255,0.6);">Semester</span>
                    <span style="color: #c4b5fd;">${currentUser.sem}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(255,255,255,0.6);">Role</span>
                    <span style="color: #c4b5fd;">${currentUser.role}</span>
                </div>
            </div>
        </div>
    `;
}

function renderWeeklySchedule(timetable) {
    const container = document.getElementById('weeklyScheduleContent');
    document.getElementById('weeklyClassCount').textContent = `${timetable.length} Classes`;
    
    if (timetable.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No classes scheduled for this semester</p>
            </div>
        `;
        return;
    }
    
    // Sort by day order then time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedTimetable = [...timetable].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.time.localeCompare(b.time);
    });
    
    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTimetable.map(item => `
                        <tr>
                            <td><span class="timetable-day-badge">${item.day}</span></td>
                            <td>${item.time}</td>
                            <td>${item.subject}</td>
                            <td>${item.room}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============== Admin Functions ==============

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.tab-btn').classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Load data if needed
    if (tabName === 'announcements') {
        loadAdminAnnouncements();
    } else if (tabName === 'users') {
        loadUsers();
    } else if (tabName === 'timetable') {
        loadAllTimetable();
    } else if (tabName === 'viewdata') {
        loadDepartmentsForView();
    }
}

async function loadAdminData() {
    // Reset to scope gate
    document.getElementById('scopeGate').style.display = 'block';
    document.getElementById('adminToolsContainer').style.display = 'none';
    
    // If scope was already locked, show admin tools
    if (scopeLocked && lockedDept && lockedSem && lockedSections.length > 0) {
        document.getElementById('scopeGate').style.display = 'none';
        document.getElementById('adminToolsContainer').style.display = 'block';
        loadScopeData();
    }
}

async function loadAdminAnnouncements() {
    try {
        const response = await fetch(`${API_BASE}/admin/announcements`);
        const announcements = await response.json();
        
        const container = document.getElementById('adminAnnouncementsList');
        
        if (announcements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <p>No announcements yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = announcements.map(item => `
            <div class="announcement-item" style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div class="announcement-title">${item.title}</div>
                    <div class="announcement-content">${item.content}</div>
                    <span class="announcement-dept">${item.target_dept}</span>
                </div>
                <button class="action-btn delete" onclick="deleteAnnouncement(${item.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

async function createAnnouncement() {
    const title = document.getElementById('annTitle').value.trim();
    const content = document.getElementById('annContent').value.trim();
    const target_dept = document.getElementById('annDept').value;
    
    if (!title || !content) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, target_dept })
        });
        
        if (response.ok) {
            showToast('Announcement posted successfully!', 'success');
            document.getElementById('annTitle').value = '';
            document.getElementById('annContent').value = '';
            loadAdminAnnouncements();
        } else {
            showToast('Failed to post announcement', 'error');
        }
    } catch (error) {
        console.error('Error creating announcement:', error);
        showToast('Connection error', 'error');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/announcement/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Announcement deleted', 'success');
            loadAdminAnnouncements();
        } else {
            showToast('Failed to delete announcement', 'error');
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showToast('Connection error', 'error');
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        
        const container = document.getElementById('usersTableContainer');
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Semester</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span style="background: ${user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}; padding: 3px 10px; border-radius: 10px; font-size: 0.8rem;">${user.role}</span></td>
                            <td>${user.dept}</td>
                            <td>${user.section}</td>
                            <td>${user.sem}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadAllTimetable() {
    try {
        const response = await fetch(`${API_BASE}/admin/timetable`);
        const entries = await response.json();
        
        const container = document.getElementById('timetableTableContainer');
        
        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <p>No timetable entries. Upload an Excel file to add entries.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Room</th>
                        <th>Department</th>
                        <th>Section</th>
                        <th>Semester</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(entry => `
                        <tr>
                            <td>${entry.day}</td>
                            <td>${entry.time}</td>
                            <td>${entry.subject}</td>
                            <td>${entry.room}</td>
                            <td>${entry.dept}</td>
                            <td>${entry.section}</td>
                            <td>${entry.sem}</td>
                            <td>
                                <button class="action-btn delete" onclick="deleteTimetableEntry(${entry.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

async function deleteTimetableEntry(id) {
    if (!confirm('Delete this timetable entry?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/timetable/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Entry deleted', 'success');
            loadAllTimetable();
        } else {
            showToast('Failed to delete', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============== Admin View Data (Deep Dive) ==============

async function loadDepartmentsForView() {
    try {
        const response = await fetch(`${API_BASE}/admin/departments`);
        const departments = await response.json();
        
        const select = document.getElementById('viewDept');
        select.innerHTML = '<option value="">Select Department</option>';
        departments.forEach(dept => {
            select.innerHTML += `<option value="${dept}">${dept}</option>`;
        });
        
        // Reset other dropdowns
        document.getElementById('viewSection').innerHTML = '<option value="">Select Section</option>';
        document.getElementById('viewSem').innerHTML = '<option value="">Select Semester</option>';
        document.getElementById('viewDataResults').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

async function loadSectionsForView() {
    const dept = document.getElementById('viewDept').value;
    const sectionSelect = document.getElementById('viewSection');
    const semSelect = document.getElementById('viewSem');
    
    sectionSelect.innerHTML = '<option value="">Select Section</option>';
    semSelect.innerHTML = '<option value="">Select Semester</option>';
    document.getElementById('viewDataResults').style.display = 'none';
    
    if (!dept) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/sections?dept=${encodeURIComponent(dept)}`);
        const sections = await response.json();
        
        sections.forEach(section => {
            sectionSelect.innerHTML += `<option value="${section}">${section}</option>`;
        });
        
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

async function loadSemestersForView() {
    const dept = document.getElementById('viewDept').value;
    const section = document.getElementById('viewSection').value;
    const semSelect = document.getElementById('viewSem');
    
    semSelect.innerHTML = '<option value="">Select Semester</option>';
    document.getElementById('viewDataResults').style.display = 'none';
    
    if (!dept || !section) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/semesters?dept=${encodeURIComponent(dept)}&section=${encodeURIComponent(section)}`);
        const semesters = await response.json();
        
        semesters.forEach(sem => {
            semSelect.innerHTML += `<option value="${sem}">Semester ${sem}</option>`;
        });
        
    } catch (error) {
        console.error('Error loading semesters:', error);
    }
}

async function fetchViewData() {
    const dept = document.getElementById('viewDept').value;
    const section = document.getElementById('viewSection').value;
    const sem = document.getElementById('viewSem').value;
    
    if (!dept || !section || !sem) {
        showToast('Please select Department, Section, and Semester', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/view-data?dept=${encodeURIComponent(dept)}&section=${encodeURIComponent(section)}&sem=${sem}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        // Show results container
        document.getElementById('viewDataResults').style.display = 'block';
        
        // Render timetable
        renderViewDataTimetable(data.timetable);
        
        // Render announcements
        renderViewDataAnnouncements(data.announcements);
        
        // Render resources
        renderViewDataResources(data.resources);
        
        showToast(`Showing data for ${dept} - Section ${section} - Sem ${sem}`, 'success');
        
    } catch (error) {
        console.error('Error fetching view data:', error);
        showToast('Failed to fetch data', 'error');
    }
}

function renderViewDataTimetable(timetable) {
    const container = document.getElementById('viewDataTimetable');
    
    if (timetable.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No timetable entries found</p>
            </div>
        `;
        return;
    }
    
    // Sort by day order then time
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedTimetable = [...timetable].sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.time.localeCompare(b.time);
    });
    
    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Subject</th>
                        <th>Room</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTimetable.map(item => `
                        <tr>
                            <td><span class="timetable-day-badge">${item.day}</span></td>
                            <td>${item.time}</td>
                            <td>${item.subject}</td>
                            <td>${item.room}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p style="margin-top: 10px; color: rgba(255,255,255,0.5); font-size: 0.85rem;">Total: ${timetable.length} classes</p>
    `;
}

function renderViewDataAnnouncements(announcements) {
    const container = document.getElementById('viewDataAnnouncements');
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <p>No announcements for this selection</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = announcements.map(item => `
        <div class="announcement-item">
            <div class="announcement-title">${item.title}</div>
            <div class="announcement-content">${item.content}</div>
            <span class="announcement-dept">${item.target_dept === 'ALL' ? 'All Departments' : item.target_dept}</span>
        </div>
    `).join('');
}

function renderViewDataResources(resources) {
    const container = document.getElementById('viewDataResources');
    
    if (resources.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No resources for this selection</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = resources.map(item => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div>
                    <div class="resource-title">${item.title}</div>
                    <div class="resource-subject">${item.subject}</div>
                </div>
            </div>
            <a href="${item.link}" target="_blank" class="resource-link">
                <i class="fas fa-external-link-alt"></i> Open
            </a>
        </div>
    `).join('');
}

// ============== File Upload ==============

// Drag and drop handlers - use function to setup when DOM ready
function setupDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    
    if (!uploadZone) {
        console.warn('Upload zone not found');
        return;
    }
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showToast('Please upload an Excel file (.xlsx or .xls)', 'error');
        return;
    }
    
    // Check if scope is locked
    if (!scopeLocked || !lockedDept || !lockedSem || lockedSections.length === 0) {
        showToast('Please lock a scope first before uploading', 'error');
        return;
    }
    
    const resultDiv = document.getElementById('uploadResult');
    resultDiv.innerHTML = '<div class="loading"></div> Uploading to ' + lockedDept + ' - Sem ' + lockedSem + ' - Sections ' + lockedSections.join(', ') + '...';
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Build URL with scope parameters
    const sectionsParam = lockedSections.join(',');
    const uploadUrl = `${API_BASE}/admin/upload?dept=${encodeURIComponent(lockedDept)}&sem=${lockedSem}&sections=${encodeURIComponent(sectionsParam)}`;
    
    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            resultDiv.innerHTML = `<span style="color: #22c55e;"><i class="fas fa-check-circle"></i> ${result.message}</span>`;
            showToast('Timetable uploaded successfully!', 'success');
            
            // Reload timetable view
            loadScopeTimetable(currentViewSection || lockedSections[0]);
        } else {
            resultDiv.innerHTML = `<span style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> ${result.detail}</span>`;
            showToast('Upload failed', 'error');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        resultDiv.innerHTML = `<span style="color: #ef4444;"><i class="fas fa-exclamation-circle"></i> Connection error</span>`;
        showToast('Connection error', 'error');
    }
}

// ============== Chatbot ==============

function toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    const icon = document.getElementById('chatbotIcon');
    
    container.classList.toggle('open');
    
    if (container.classList.contains('open')) {
        icon.classList.remove('fa-comments');
        icon.classList.add('fa-times');
        document.getElementById('chatInput').focus();
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-comments');
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
    
    const messagesContainer = document.getElementById('chatMessages');
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="chat-message user">
            <div class="message-bubble">${escapeHtml(message)}</div>
        </div>
    `;
    
    input.value = '';
    
    // Add typing indicator
    messagesContainer.innerHTML += `
        <div class="chat-message bot" id="typingIndicator">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                user_email: currentUser.email
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        document.getElementById('typingIndicator').remove();
        
        // Add bot response
        messagesContainer.innerHTML += `
            <div class="chat-message bot">
                <div class="message-bubble">${formatChatResponse(data.response)}</div>
            </div>
        `;
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        console.error('Chat error:', error);
        
        document.getElementById('typingIndicator').remove();
        
        messagesContainer.innerHTML += `
            <div class="chat-message bot">
                <div class="message-bubble">Sorry, I'm having trouble connecting. Please try again later.</div>
            </div>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatChatResponse(text) {
    // Convert markdown-like formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// ============== Initialize ==============

document.addEventListener('DOMContentLoaded', () => {
    // Setup drag and drop
    setupDragAndDrop();
    
    // Check if server is running
    fetch(`${API_BASE}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Server connected:', data.message);
        })
        .catch(error => {
            console.error('Server not running:', error);
            showToast('Server is not running. Start with: uvicorn main:app --reload', 'error');
        });
});
