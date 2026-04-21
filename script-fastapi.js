/**
 * Student Management Portal - FastAPI Backend Integration
 * Corrected for port 8000 running with: uvicorn main:app --reload
 */

console.log('🚀 Script-FastAPI.js loading...');

// ============== API CONFIGURATION ==============
// Always use the current origin to communicate with backend
const API_BASE = window.location.origin;
console.log('📍 Page URL:', window.location.href);
console.log('🔗 API BASE URL:', API_BASE);
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);

// ============== GLOBAL STATE ==============
let currentUser = null;

// ============== AUTHENTICATION FUNCTIONS ==============

/**
 * Handle user login using FastAPI backend
 */
async function login() {
  console.log('🔐 LOGIN CLICKED');
  try {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput) {
      console.error('❌ Email input not found');
      showToast('Form error: Email input missing', 'error');
      return;
    }
    if (!passwordInput) {
      console.error('❌ Password input not found');
      showToast('Form error: Password input missing', 'error');
      return;
    }
    
    const email = emailInput.value?.trim();
    const password = passwordInput.value?.trim();

    console.log('📝 Form values:');
    console.log('  Email:', email);
    console.log('  Password length:', password?.length || 0);

    if (!email) {
      console.warn('❌ Email is empty');
      showToast('Please enter email', 'error');
      return;
    }
    
    if (!password) {
      console.warn('❌ Password is empty');
      showToast('Please enter password', 'error');
      return;
    }

    const loginUrl = `${API_BASE}/login`;
    console.log(`🔐 Sending login request to: ${loginUrl}`);
    console.log('Request body:', { email, password: '***' });
    
    // Call FastAPI login endpoint
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log('📤 Response received:');
    console.log('  Status:', response.status);
    console.log('  StatusText:', response.statusText);
    console.log('  Headers Content-Type:', response.headers.get('content-type'));
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('  Body:', responseData);
    } catch (e) {
      console.error('  Failed to parse JSON:', e.message);
      responseData = null;
    }
    
    if (!response.ok) {
      const errorMsg = responseData?.detail || `HTTP ${response.status}`;
      console.error('❌ Login failed:', errorMsg);
      showToast(errorMsg, 'error');
      return;
    }

    if (!responseData) {
      console.error('❌ No response data returned');
      showToast('Server returned empty response', 'error');
      return;
    }

    const userProfile = responseData;
    console.log('✅ User profile received:', userProfile);

    currentUser = {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role || 'STUDENT',
      id: userProfile.id,
      dept: userProfile.dept,
      section: userProfile.section,
      sem: userProfile.sem
    };

    console.log('✅ currentUser set:', currentUser);
    console.log('✅ User logged in successfully');
    showToast(`Welcome, ${currentUser.name}! (${currentUser.role})`, 'success');

    // Clear password field for security
    passwordInput.value = '';

    // Show admin menu if user is admin
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
      if (currentUser.role === 'ADMIN') {
        adminSection.classList.remove('hidden');
        console.log('✅ Admin section shown');
      } else {
        adminSection.classList.add('hidden');
        console.log('✅ Admin section hidden (not admin)');
      }
    } else {
      console.warn('⚠️ Admin section not found');
    }

    // Update sidebar user name
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.role;

    // Hide login, show dashboard
    const loginSection = document.getElementById('loginSection');
    const mainDashboard = document.getElementById('mainDashboard');
    
    console.log('🔄 Switching UI....');
    console.log('  loginSection found:', !!loginSection);
    console.log('  mainDashboard found:', !!mainDashboard);
    
    if (loginSection) {
      loginSection.classList.add('hidden');
      console.log('✅ Login section hidden');
    }
    if (mainDashboard) {
      mainDashboard.classList.remove('hidden');
      console.log('✅ Dashboard shown');
    }

    console.log('🎉 Login successful!');
    
  } catch (error) {
    console.error('❌ Login exception:', error);
    console.error('  Name:', error.name);
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    showToast('Login failed: ' + error.message, 'error');
  }
}

/**
 * Logout function
 */
function logout() {
  console.log('🚪 Logout clicked');
  currentUser = null;
  
  // Reset UI
  const loginSection = document.getElementById('loginSection');
  const mainDashboard = document.getElementById('mainDashboard');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  
  if (loginEmail) loginEmail.value = '';
  if (loginPassword) loginPassword.value = '';
  
  if (loginSection) loginSection.classList.remove('hidden');
  if (mainDashboard) mainDashboard.classList.add('hidden');
  
  showToast('Logged out successfully', 'success');
}

// ============== DASHBOARD FUNCTIONS ==============

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
  if (!currentUser) {
    console.warn('⚠ No user logged in');
    return;
  }

  try {
    console.log('Loading dashboard data for:', currentUser.email);
    
    const response = await fetch(`${API_BASE}/student/dashboard?email=${encodeURIComponent(currentUser.email)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const dashboardData = await response.json();
    console.log('✓ Dashboard data loaded:', dashboardData);
    
    // Display timetable
    if (dashboardData.timetable) {
      displayTimetable(dashboardData.timetable);
    }
    
    // Display announcements
    if (dashboardData.announcements) {
      displayAnnouncements(dashboardData.announcements);
    }
    
    // Display attendance
    if (dashboardData.attendance) {
      displayAttendance(dashboardData.attendance);
    }
    
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

/**
 * Display timetable
 */
function displayTimetable(timetable) {
  console.log('📅 Displaying timetable:', timetable);
  
  const timetableContainer = document.getElementById('timetableContainer');
  if (!timetableContainer) return;
  
  if (!timetable || timetable.length === 0) {
    timetableContainer.innerHTML = '<p class="text-gray-500">No timetable available</p>';
    return;
  }
  
  const html = timetable.map(entry => `
    <div class="p-3 bg-white border border-gray-200 rounded-lg">
      <div class="font-semibold text-primary-600">${entry.subject_name}</div>
      <div class="text-sm text-gray-600">${entry.day_of_week} ${entry.period_slots}</div>
      <div class="text-sm text-gray-500">Room: ${entry.room_number}</div>
      ${entry.faculty_name ? `<div class="text-sm text-gray-500">Faculty: ${entry.faculty_name}</div>` : ''}
    </div>
  `).join('');
  
  timetableContainer.innerHTML = html;
}

/**
 * Display announcements
 */
function displayAnnouncements(announcements) {
  console.log('📢 Displaying announcements:', announcements);
  
  const announcementContainer = document.getElementById('announcementContainer') || document.getElementById('announcementsContainer');
  if (!announcementContainer) return;
  
  if (!announcements || announcements.length === 0) {
    announcementContainer.innerHTML = '<p class="text-gray-500">No announcements</p>';
    return;
  }
  
  const html = announcements.map(ann => `
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="font-semibold text-blue-900">${ann.title}</div>
      <div class="text-sm text-blue-800 mt-2">${ann.body}</div>
      ${ann.date ? `<div class="text-xs text-blue-600 mt-2">${new Date(ann.date).toLocaleDateString()}</div>` : ''}
    </div>
  `).join('');
  
  announcementContainer.innerHTML = html;
}

/**
 * Display attendance
 */
function displayAttendance(attendance) {
  console.log('📊 Displaying attendance:', attendance);
  
  const attendanceContainer = document.getElementById('attendanceContainer');
  if (!attendanceContainer) return;
  
  const overallStatus = attendance.overall_status;
  const statusColor = {
    'SAFE': 'text-green-600',
    'WARNING': 'text-yellow-600',
    'DANGER': 'text-red-600'
  }[overallStatus] || 'text-gray-600';
  
  let html = `
    <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div class="text-sm text-blue-600">Overall Attendance</div>
      <div class="text-3xl font-bold ${statusColor}">${attendance.overall_percentage.toFixed(1)}%</div>
      <div class="text-sm text-blue-600">Status: ${overallStatus}</div>
    </div>
  `;
  
  if (attendance.subjects && attendance.subjects.length > 0) {
    html += '<div class="space-y-2">';
    for (const subject of attendance.subjects) {
      const subjectStatus = {
        'SAFE': 'bg-green-50 border-green-200',
        'WARNING': 'bg-yellow-50 border-yellow-200',
        'DANGER': 'bg-red-50 border-red-200'
      }[subject.status] || 'bg-gray-50 border-gray-200';
      
      html += `
        <div class="p-3 ${subjectStatus} border rounded-lg">
          <div class="font-semibold text-sm">${subject.subject_name}</div>
          <div class="text-xs text-gray-600">${subject.attended}/${subject.total} classes (${subject.percentage.toFixed(1)}%)</div>
          ${subject.classes_needed ? `<div class="text-xs text-blue-600">Need ${subject.classes_needed} more classes</div>` : ''}
        </div>
      `;
    }
    html += '</div>';
  }
  
  attendanceContainer.innerHTML = html;
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Show toast message
 */
function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}]`, message);
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
    type === 'error' ? 'bg-red-500' : 
    type === 'success' ? 'bg-green-500' : 
    'bg-blue-500'
  }`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============== HANDLE KEYPRESS ==============

/**
 * Handle Enter key on login form
 */
function handleLoginKeypress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

// ============== INITIALIZE ==============

// Setup event listeners immediately (don't wait for DOMContentLoaded for module scripts)
function setupEventListeners() {
  console.log('⚙️ Setting up event listeners...');
  
  const loginBtn = document.getElementById('loginButton');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (loginBtn) {
    console.log('✅ Attached click listener to loginButton');
    loginBtn.addEventListener('click', login);
  } else {
    console.warn('⚠️ loginButton not found');
  }
  
  if (logoutBtn) {
    console.log('✅ Attached click listener to logoutBtn');
    logoutBtn.addEventListener('click', logout);
  } else {
    console.warn('⚠️ logoutBtn not found');
  }
  
  // Email and password fields already have onkeypress in HTML
  console.log('✅ Event listeners setup complete');
}

// Try to setup immediately in case DOM is ready
if (document.readyState === 'loading') {
  console.log('⏳ Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  console.log('📄 Document already loaded, setup immediately');
  setupEventListeners();
}

console.log('✅ Script-FastAPI.js loaded successfully');
