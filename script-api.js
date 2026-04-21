/**
 * Student Management Portal - API Integration
 * FastAPI Backend Integration - Admin & Student Portal
 */

console.log('🚀 Script-API.js loading...');

// ============== CONFIGURATION ==============
const API_BASE = 'http://localhost:8000';
let currentUser = null;
let currentAdminScope = { depts: ['ALL'], sections: ['ALL'], sems: ['ALL'] };

// ============== LOGIN FUNCTIONS ==============

async function login() {
  console.log('🔐 LOGIN CLICKED');
  try {
    const emailInput = document.getElementById('loginEmail');
    const email = emailInput?.value?.trim();

    if (!email) {
      showToast('Please enter email', 'error');
      return;
    }

    console.log('🔐 Logging in with email:', email);

    // Call login API
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const userData = await response.json();
    
    currentUser = {
      email: userData.email,
      name: userData.name,
      role: userData.role || 'STUDENT'
    };

    console.log('✓ User logged in:', currentUser);
    showToast(`Welcome, ${currentUser.name}! (${currentUser.role})`, 'success');

    // Show admin menu if user is admin
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
      if (currentUser.role === 'ADMIN') {
        adminSection.classList.remove('hidden');
        console.log('✓ Admin menu shown');
      } else {
        adminSection.classList.add('hidden');
        console.log('✗ Admin menu hidden (not admin)');
      }
    }

    // Update sidebar user name
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.role;

    // Hide login, show dashboard
    const loginSection = document.getElementById('loginSection');
    const mainDashboard = document.getElementById('mainDashboard');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    // Show chat widget
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) chatWidget.classList.remove('hidden');

    console.log('✓ Login complete');
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    showToast('Login failed: ' + error.message, 'error');
  }
}

function handleLoginKeypress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

function logout() {
  currentUser = null;
  const loginSection = document.getElementById('loginSection');
  const mainDashboard = document.getElementById('mainDashboard');
  if (loginSection) loginSection.classList.remove('hidden');
  if (mainDashboard) mainDashboard.classList.add('hidden');
  
  const emailInput = document.getElementById('loginEmail');
  if (emailInput) emailInput.value = '';
  
  console.log('✓ User logged out');
  showToast('Logged out successfully', 'success');
}

// ============== UTILITY FUNCTIONS ==============

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============== VIEW SWITCHING ==============

function switchView(viewName) {
  console.log(`Switching to view: ${viewName}`);
  
  // Hide all views
  document.querySelectorAll('.view-content').forEach(el => {
    el.classList.add('hidden');
  });
  
  // Show selected view
  const selectedView = document.getElementById(`view-${viewName}`);
  if (selectedView) {
    selectedView.classList.remove('hidden');
  }
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });
  event.target?.closest('.nav-item')?.classList.add('active');
  
  // Update page title
  const titles = {
    'dashboard': { title: 'Dashboard', subtitle: 'Welcome back!' },
    'schedule': { title: 'Class Schedule', subtitle: 'Your timetable' },
    'attendance': { title: 'Attendance', subtitle: 'Your attendance record' },
    'announcements': { title: 'Announcements', subtitle: 'Latest updates' },
    'resources': { title: 'Resources', subtitle: 'Course materials' },
    'manage-timetable': { title: 'Manage Timetable', subtitle: 'Update class schedule' },
    'manage-announcements': { title: 'Manage Announcements', subtitle: 'Create & edit announcements' },
    'manage-attendance': { title: 'Manage Attendance', subtitle: 'Update attendance records' },
    'manage-resources': { title: 'Manage Resources', subtitle: 'Upload course materials' },
    'manage-bulk-students': { title: 'Bulk Student Upload', subtitle: 'Import students in bulk' },
    'manage-students': { title: 'Manage Students', subtitle: 'Manage student records' }
  };
  
  const viewInfo = titles[viewName] || { title: viewName, subtitle: '' };
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  if (pageTitle) pageTitle.textContent = viewInfo.title;
  if (pageSubtitle) pageSubtitle.textContent = viewInfo.subtitle;
  
  // Load view-specific data
  if (viewName === 'dashboard') loadDashboardData();
  else if (viewName === 'manage-students') loadStudentsByScope();
  else if (viewName === 'manage-timetable') loadTimetableManagement();
  else if (viewName === 'manage-announcements') loadAnnouncementsManagement();
  else if (viewName === 'manage-attendance') loadAttendanceManagement();
}

// ============== ADMIN FUNCTIONS ==============

// Admin Scope Management
function openAdminScopeModal() {
  const modal = document.getElementById('adminScopeModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAdminScopeModal() {
  const modal = document.getElementById('adminScopeModal');
  if (modal) modal.classList.add('hidden');
}

function saveAdminScope() {
  try {
    const depts = Array.from(document.getElementById('adminScopeDepts')?.selectedOptions || []).map(o => o.value);
    const sections = Array.from(document.getElementById('adminScopeSections')?.selectedOptions || []).map(o => o.value);
    const sems = Array.from(document.getElementById('adminScopeSems')?.selectedOptions || []).map(o => o.value);
    
    currentAdminScope = {
      depts: depts.length > 0 ? depts : ['ALL'],
      sections: sections.length > 0 ? sections : ['ALL'],
      sems: sems.length > 0 ? sems : ['ALL']
    };
    
    console.log('✓ Admin scope saved:', currentAdminScope);
    showToast(`✓ Scope: ${currentAdminScope.depts.join(',')} | ${currentAdminScope.sections.join(',')}`, 'success');
    closeAdminScopeModal();
  } catch (error) {
    console.error('Error saving scope:', error);
    showToast('Error saving scope', 'error');
  }
}

// ============== STUDENTS MANAGEMENT ==============

async function loadStudentsByScope() {
  console.log('Loading students by scope...');
  try {
    const container = document.getElementById('studentsManagementBody');
    if (!container) return;
    
    container.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center"><i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>Loading students...</td></tr>';
    
    // Fetch all students - will be filtered by scope
    const response = await fetch(`${API_BASE}/admin/students`, {
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to load students');
    
    const students = await response.json();
    container.innerHTML = '';
    
    if (!students || students.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No students found</td></tr>';
      return;
    }
    
    students.forEach(student => {
      const row = document.createElement('tr');
      row.className = 'border-t border-gray-100 hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-700">${escapeHtml(student.name)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(student.email)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(student.roll_number || '-')}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(student.dept)}/${escapeHtml(student.section)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">Sem ${student.sem}</td>
        <td class="px-4 py-3 text-sm flex gap-2">
          <button onclick="editStudent('${escapeHtml(student.email)}')" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">Edit</button>
          <button onclick="deleteStudent('${escapeHtml(student.email)}')" class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });
    
    console.log(`✓ Loaded ${students.length} students`);
    showToast(`✓ ${students.length} students loaded`, 'success');
  } catch (error) {
    console.error('Error loading students:', error);
    showToast('Error loading students: ' + error.message, 'error');
  }
}

async function createStudentManually() {
  try {
    const name = document.getElementById('studentName')?.value?.trim();
    const email = document.getElementById('studentEmail')?.value?.trim();
    const roll = document.getElementById('studentRoll')?.value?.trim();
    const dept = document.getElementById('studentDept')?.value?.trim();
    const section = document.getElementById('studentSection')?.value?.trim();
    const sem = parseInt(document.getElementById('studentSem')?.value);
    
    if (!name || !email || !roll || !dept || !section || !sem) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    const response = await fetch(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Email': currentUser?.email || 'admin@college.edu'
      },
      body: JSON.stringify({
        name, email, roll_number: roll, dept, section, sem
      })
    });
    
    if (!response.ok) throw new Error(await response.text());
    
    showToast('✓ Student added successfully', 'success');
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentRoll').value = '';
    document.getElementById('studentDept').value = '';
    document.getElementById('studentSection').value = '';
    document.getElementById('studentSem').value = '';
    
    loadStudentsByScope();
  } catch (error) {
    console.error('Error creating student:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

async function deleteStudent(email) {
  if (!confirm('Delete this student?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/admin/students/${email}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    showToast('✓ Student deleted', 'success');
    loadStudentsByScope();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

async function editStudent(email) {
  // Implement edit modal here
  console.log('Edit student:', email);
  showToast('Edit feature coming soon', 'info');
}

// ============== TIMETABLE MANAGEMENT ==============

async function loadTimetableManagement() {
  console.log('Loading timetable management...');
  try {
    const container = document.getElementById('timetableManagementBody');
    if (!container) return;
    
    container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center"><i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>Loading...</td></tr>';
    
    const response = await fetch(`${API_BASE}/admin/timetable`, {
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to load');
    
    const entries = await response.json();
    container.innerHTML = '';
    
    if (!entries || entries.length === 0) {
      container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No timetable entries</td></tr>';
      return;
    }
    
    entries.forEach(entry => {
      const row = document.createElement('tr');
      row.className = 'border-t border-gray-100 hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-700">${escapeHtml(entry.day)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(entry.time)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(entry.subject)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(entry.room)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(entry.faculty || '-')}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${entry.dept}/${entry.section}</td>
        <td class="px-4 py-3"><button onclick="deleteTimetableEntry(${entry.id})" class="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button></td>
      `;
      container.appendChild(row);
    });
    
    console.log(`✓ Loaded ${entries.length} timetable entries`);
  } catch (error) {
    console.error('Error:', error);
    showToast('Error loading timetable', 'error');
  }
}

async function deleteTimetableEntry(entryId) {
  if (!confirm('Delete this entry?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/admin/timetable/${entryId}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    showToast('✓ Entry deleted', 'success');
    loadTimetableManagement();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

// ============== ANNOUNCEMENTS MANAGEMENT ==============

async function loadAnnouncementsManagement() {
  console.log('Loading announcements management...');
  try {
    const container = document.getElementById('announcementManagementGrid');
    if (!container) return;
    
    container.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-spinner fa-spin text-2xl text-blue-400"></i></div>';
    
    const response = await fetch(`${API_BASE}/admin/announcements`, {
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to load');
    
    const announcements = await response.json();
    container.innerHTML = '';
    
    if (!announcements || announcements.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No announcements yet</div>';
      return;
    }
    
    announcements.forEach(ann => {
      const card = document.createElement('div');
      const priorityColors = {
        'urgent': 'bg-red-50 border-red-200',
        'high': 'bg-orange-50 border-orange-200',
        'normal': 'bg-blue-50 border-blue-200'
      };
      
      card.className = `${priorityColors[ann.priority] || priorityColors['normal']} rounded-xl p-4 border-2 hover:shadow-lg transition`;
      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-bold text-gray-800">${escapeHtml(ann.title)}</h4>
            <p class="text-xs text-gray-500">by ${escapeHtml(ann.created_by || 'Admin')}</p>
          </div>
          <button onclick="deleteAnnouncement(${ann.id})" class="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
        </div>
        <p class="text-sm text-gray-700 mb-2">${escapeHtml(ann.description)}</p>
        <span class="text-xs px-2 py-1 bg-gray-200 rounded">${ann.priority}</span>
      `;
      container.appendChild(card);
    });
    
    console.log(`✓ Loaded ${announcements.length} announcements`);
  } catch (error) {
    console.error('Error:', error);
    showToast('Error loading announcements', 'error');
  }
}

async function deleteAnnouncement(annId) {
  if (!confirm('Delete this announcement?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/admin/announcement/${annId}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    showToast('✓ Announcement deleted', 'success');
    loadAnnouncementsManagement();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

// ============== ATTENDANCE MANAGEMENT ==============

async function loadAttendanceManagement() {
  console.log('Loading attendance management...');
  try {
    const container = document.getElementById('attendanceManagementBody');
    if (!container) return;
    
    container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center"><i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>Loading...</td></tr>';
    
    const response = await fetch(`${API_BASE}/admin/attendance`, {
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to load');
    
    const records = await response.json();
    container.innerHTML = '';
    
    if (!records || records.length === 0) {
      container.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No attendance records</td></tr>';
      return;
    }
    
    records.forEach(record => {
      const row = document.createElement('tr');
      const statusColor = record.status?.toLowerCase() === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
      row.className = 'border-t border-gray-100 hover:bg-gray-50';
      row.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(record.student_email)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(record.date)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(record.subject)}</td>
        <td class="px-4 py-3 text-sm"><span class="px-3 py-1 ${statusColor} rounded-full text-xs font-semibold">${record.status}</span></td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(record.recorded_by || 'Admin')}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${new Date(record.created_at).toLocaleDateString()}</td>
        <td class="px-4 py-3 text-sm">
          <button onclick="deleteAttendanceRecord('${record.student_email}', '${record.subject}')" class="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });
    
    console.log(`✓ Loaded ${records.length} attendance records`);
  } catch (error) {
    console.error('Error:', error);
    showToast('Error loading attendance', 'error');
  }
}

async function deleteAttendanceRecord(email, subject) {
  if (!confirm('Delete this record?')) return;
  
  try {
    const response = await fetch(`${API_BASE}/admin/attendance/${email}/${subject}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Email': currentUser?.email || 'admin@college.edu' }
    });
    
    if (!response.ok) throw new Error('Failed to delete');
    
    showToast('✓ Record deleted', 'success');
    loadAttendanceManagement();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}

// ============== DASHBOARD ==============

async function loadDashboardData() {
  console.log('Loading dashboard...');
  try {
    const response = await fetch(`${API_BASE}/student/dashboard`, {
      headers: { 'X-Student-Email': currentUser?.email || 'student1@college.edu' }
    });
    
    if (!response.ok) return;
    
    const dashboard = await response.json();
    const element = document.getElementById('overallAttendance');
    if (element) {
      element.textContent = dashboard.attendance_percentage ? Math.round(dashboard.attendance_percentage) + '%' : '0%';
    }
    
    console.log('✓ Dashboard loaded');
  } catch (error) {
    console.error('Dashboard error:', error);
  }
}

// ============== EVENT LISTENERS ==============

document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ DOMContentLoaded fired');
  
  const loginButton = document.getElementById('loginButton');
  if (loginButton) {
    loginButton.addEventListener('click', login);
    console.log('✓ Login button listener attached');
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
    console.log('✓ Logout button listener attached');
  }
});

// ============== MAKE FUNCTIONS GLOBALLY ACCESSIBLE ==============
window.login = login;
window.logout = logout;
window.handleLoginKeypress = handleLoginKeypress;
window.switchView = switchView;
window.openAdminScopeModal = openAdminScopeModal;
window.closeAdminScopeModal = closeAdminScopeModal;
window.saveAdminScope = saveAdminScope;
window.loadStudentsByScope = loadStudentsByScope;
window.createStudentManually = createStudentManually;
window.deleteStudent = deleteStudent;
window.editStudent = editStudent;
window.loadTimetableManagement = loadTimetableManagement;
window.deleteTimetableEntry = deleteTimetableEntry;
window.loadAnnouncementsManagement = loadAnnouncementsManagement;
window.deleteAnnouncement = deleteAnnouncement;
window.loadAttendanceManagement = loadAttendanceManagement;
window.deleteAttendanceRecord = deleteAttendanceRecord;
window.showToast = showToast;

console.log('✓ Script-API.js loaded successfully');
