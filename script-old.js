/**
 * Student Management Portal
 * Mobile-First Frontend with Firebase Chat Integration
 */

// ============== FIREBASE IMPORTS ==============
import { db, auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  initializeUserSession,
  createChat,
  getUserChats,
  getMessages,
  addMessage,
  onMessagesUpdate,
  editMessage,
  deleteMessage
} from './firebase-chat-operations.js';

const API_BASE = window.location.origin;

// ============== FIREBASE TEST FUNCTIONS ==============

// Test 1: Write user data
async function testWriteUser() {
  try {
    console.log("📝 Test 1: Writing user data...");
    await setDoc(doc(db, "users", "user1"), {
      email: "kanish@example.com",
      displayName: "Kanish",
      createdAt: serverTimestamp(),
      status: "active",
      preferences: {
        theme: "dark",
        notifications: true
      }
    });
    console.log("✓ User document created successfully!");
    return true;
  } catch (error) {
    console.error("✗ Error writing user:", error);
    return false;
  }
}

// Test 2: Read user data
async function testReadUser() {
  try {
    console.log("📖 Test 2: Reading user data...");
    const userRef = doc(db, "users", "user1");
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log("✓ User found:", userSnap.data());
      return true;
    } else {
      console.log("⚠ User not found");
      return false;
    }
  } catch (error) {
    console.error("✗ Error reading user:", error);
    return false;
  }
}

// Test 3: Create a chat
async function testCreateChat() {
  try {
    console.log("💬 Test 3: Creating a chat...");
    const chatRef = await addDoc(
      collection(db, "users", "user1", "chats"),
      {
        title: "Test Chat",
        description: "Testing Firestore structure",
        createdAt: serverTimestamp(),
        participants: ["user1", "ai-bot"],
        messageCount: 0,
        isArchived: false
      }
    );
    console.log("✓ Chat created with ID:", chatRef.id);
    
    // Store chat ID for next test
    window.testChatId = chatRef.id;
    return true;
  } catch (error) {
    console.error("✗ Error creating chat:", error);
    return false;
  }
}

// Test 4: Add a message to chat
async function testAddMessage() {
  try {
    console.log("💌 Test 4: Adding a message...");
    if (!window.testChatId) {
      console.log("⚠ No chat ID found, skipping message test");
      return false;
    }
    
    const messageRef = await addDoc(
      collection(db, "users", "user1", "chats", window.testChatId, "messages"),
      {
        text: "Hello from Firestore!",
        sender: "user",
        senderId: "user1",
        senderName: "Kanish",
        timestamp: serverTimestamp(),
        type: "text",
        status: "sent"
      }
    );
    console.log("✓ Message created with ID:", messageRef.id);
    return true;
  } catch (error) {
    console.error("✗ Error adding message:", error);
    return false;
  }
}

// Test 5: Fetch all chats
async function testFetchChats() {
  try {
    console.log("📋 Test 5: Fetching all chats...");
    const chatsSnap = await getDocs(collection(db, "users", "user1", "chats"));
    console.log(`✓ Found ${chatsSnap.size} chat(s):`);
    chatsSnap.forEach((doc) => {
      console.log("  -", doc.id, ":", doc.data().title);
    });
    return true;
  } catch (error) {
    console.error("✗ Error fetching chats:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("\n🚀 Starting Firestore Database Tests...\n");
  
  const results = {
    writeUser: await testWriteUser(),
    readUser: await testReadUser(),
    createChat: await testCreateChat(),
    addMessage: await testAddMessage(),
    fetchChats: await testFetchChats()
  };
  
  console.log("\n✅ Test Summary:");
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? "✓" : "✗"} ${test}`);
  });
  console.log("\n");
}

// Run tests on page load
window.testDB = runAllTests; // Expose in console as window.testDB()
// Uncomment below to auto-run on page load:
// runAllTests();

// ============== FIREBASE SEED DATA ==============

// Seed demo users to Firebase
async function seedDemoUsers() {
  console.log('\n🌱 Seeding demo users...\n');
  
  const demoUsers = [
    {
      email: 'admin@college.edu',
      name: 'Admin User',
      password: 'admin123',
      role: 'ADMIN'
    },
    {
      email: 'student1@college.edu',
      name: 'John Doe',
      password: 'student123',
      role: 'STUDENT',
      dept: 'CSE',
      section: 'A',
      sem: '3'
    },
    {
      email: 'student2@college.edu',
      name: 'Jane Smith',
      password: 'student123',
      role: 'STUDENT',
      dept: 'ECE',
      section: 'B',
      sem: '2'
    },
    {
      email: 'kanish@college.edu',
      name: 'Kanish Kumar',
      password: 'kanish123',
      role: 'STUDENT',
      dept: 'AIML',
      section: 'A',
      sem: '4'
    }
  ];

  let added = 0;
  let skipped = 0;

  for (const user of demoUsers) {
    try {
      const userRef = doc(db, 'users', user.email.toLowerCase());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log(`⏭️  Skipped: ${user.email} (already exists)`);
        skipped++;
        continue;
      }

      const hashedPassword = btoa(user.password);
      await setDoc(userRef, {
        email: user.email.toLowerCase(),
        name: user.name,
        password: hashedPassword,
        role: user.role,
        dept: user.dept || '',
        section: user.section || '',
        sem: user.sem || '1',
        createdAt: serverTimestamp(),
        status: 'active'
      });

      console.log(`✅ Added: ${user.name} (${user.email})`);
      added++;
    } catch (error) {
      console.error(`❌ Error adding ${user.email}:`, error.message);
    }
  }

  console.log(`\n📊 Summary: ${added} added, ${skipped} skipped\n`);
  console.log('Demo Users Ready for Login:');
  console.log('  📧 admin@college.edu / admin123 (Admin)');
  console.log('  📧 student1@college.edu / student123 (Student)');
  console.log('  📧 kanish@college.edu / kanish123 (Student)');
}

window.seedDemoUsers = seedDemoUsers; // Expose in console

// ============== FIREBASE USER MANAGEMENT ==============

// Add a new user to Firebase
async function addUserToFirebase() {
  const email = document.getElementById('newUserEmail')?.value;
  const password = document.getElementById('newUserPassword')?.value;
  const name = document.getElementById('newUserName')?.value;
  const role = document.getElementById('newUserRole')?.value || 'STUDENT';
  const dept = document.getElementById('newUserDept')?.value || '';
  const section = document.getElementById('newUserSection')?.value || '';
  const sem = document.getElementById('newUserSem')?.value || '1';

  if (!email || !password || !name) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  try {
    console.log('📝 Adding user to Firebase:', email);
    const hashedPassword = btoa(password); // Simple encoding (use proper hashing in production)
    
    await setDoc(doc(db, "users", email.toLowerCase()), {
      email: email.toLowerCase(),
      name: name,
      password: hashedPassword,
      role: role,
      dept: dept,
      section: section,
      sem: sem,
      createdAt: serverTimestamp(),
      status: "active"
    });

    showToast(`✓ User ${name} added successfully!`, 'success');
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    document.getElementById('newUserName').value = '';
    
    // Reload users table
    loadUsersForAdmin();
  } catch (error) {
    console.error('✗ Error adding user:', error);
    showToast(`Error: ${error.message}`, 'error');
  }
}

// Authenticate user with Firebase
async function firebaseLogin(email, password) {
  try {
    console.log('🔐 Authenticating user:', email);
    const userRef = doc(db, "users", email.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      showToast('User not found', 'error');
      return null;
    }

    const userData = userSnap.data();
    const hashedPassword = btoa(password);

    if (userData.password !== hashedPassword) {
      showToast('Invalid password', 'error');
      return null;
    }

    if (userData.status !== 'active') {
      showToast('This account is inactive', 'error');
      return null;
    }

    console.log('✓ Authentication successful:', email);
    return {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      dept: userData.dept || '',
      section: userData.section || '',
      sem: userData.sem || '1'
    };
  } catch (error) {
    console.error('✗ Auth error:', error);
    showToast(`Authentication error: ${error.message}`, 'error');
    return null;
  }
}

// Load all users for admin dashboard
async function loadUsersForAdmin() {
  try {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
      console.error('❌ Users table body element not found');
      return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">Loading users...</td></tr>';
    
    console.log('📋 Loading users from Firebase...');
    const usersSnap = await getDocs(collection(db, "users"));
    const usersList = [];

    usersSnap.forEach(doc => {
      usersList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${usersList.length} users in Firebase`);
    
    if (usersList.length === 0) {
      console.log('⚠️  No users found. Run seedDemoUsers() in console to create demo users.');
      tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500"><strong>No users found</strong><br><small>Run <code>seedDemoUsers()</code> in console to create demo users</small></td></tr>';
      return;
    }

    displayUsersTable(usersList);
    console.log(`✓ Displayed ${usersList.length} users in table`);
  } catch (error) {
    console.error('✗ Error loading users:', error);
    const tbody = document.getElementById('usersTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-red-500">❌ Error loading users: ${error.message}</td></tr>`;
    }
    showToast(`Error loading users: ${error.message}`, 'error');
  }
}

// Display users in a table
function displayUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) {
    console.error('❌ Users table body not found in DOM');
    return;
  }

  console.log(`🎨 Rendering ${users.length} users in table...`);
  tbody.innerHTML = '';

  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No users found. <br><small onclick="seedDemoUsers()" style="cursor:pointer; color: #0284c7; text-decoration: underline;">Click here to create demo users</small></td></tr>';
    return;
  }

  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.email} - ${user.name} (${user.role})`);
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-100 hover:bg-gray-50';
    row.innerHTML = `
      <td class="px-4 py-3 text-sm text-gray-700 font-medium">${user.email}</td>
      <td class="px-4 py-3 text-sm text-gray-700">${user.name || '-'}</td>
      <td class="px-4 py-3 text-sm"><span class="px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">${user.role || 'STUDENT'}</span></td>
      <td class="px-4 py-3 text-sm text-gray-700">${user.dept || '-'}</td>
      <td class="px-4 py-3 text-sm"><span class="px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${user.status || 'active'}</span></td>
      <td class="px-4 py-3 text-sm space-x-2">
        <button onclick="toggleUserStatus('${user.id}')" class="px-2 py-1 text-xs rounded-lg ${user.status === 'active' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'} transition">
          ${user.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
        <button onclick="deleteUserFromFirebase('${user.id}')" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  console.log(`✓ Table rendered with ${users.length} users`);
}

// Toggle user status (active/inactive)
async function toggleUserStatus(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.data().status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    await setDoc(userRef, {
      status: newStatus
    }, { merge: true });

    showToast(`✓ User status updated to ${newStatus}`, 'success');
    loadUsersForAdmin();
  } catch (error) {
    console.error('✗ Error updating user status:', error);
    showToast(`Error: ${error.message}`, 'error');
  }
}

// Delete a user from Firebase
async function deleteUserFromFirebase(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    await deleteDoc(doc(db, "users", userId));
    showToast('✓ User deleted successfully', 'success');
    loadUsersForAdmin();
  } catch (error) {
    console.error('✗ Error deleting user:', error);
    showToast(`Error: ${error.message}`, 'error');
  }
}

// ============== STATE MANAGEMENT ==============

// ============== STATE MANAGEMENT ==============
let currentUser = null;
let dashboardData = null;
let isChatOpen = false;
let isChatRequestInFlight = false;
let isAttendanceAlertRequestInFlight = false;
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

    const scopeBtn = document.getElementById('adminScopeBtn');
    if (scopeBtn) scopeBtn.classList.toggle('hidden', !isAdmin);

    const adminSection = document.getElementById('adminSection');
    if (adminSection) adminSection.classList.toggle('hidden', !isAdmin);

    if (chatWidget) {
        chatWidget.classList.toggle('hidden', isAdmin);
        if (isAdmin) {
            isChatOpen = false;
            if (chatContainer) chatContainer.classList.add('hidden');
        }
    }

    const chatToggle = document.getElementById('chatToggle');
    if (chatToggle) chatToggle.classList.toggle('hidden', isAdmin);

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) bottomNav.classList.toggle('hidden', isAdmin);
}

function login() {
    console.log('LOGIN FUNCTION CALLED');
    
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    
    console.log('Email:', email);
    console.log('Password:', password ? 'set' : 'empty');
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    console.log('Authenticating with Firebase...');
    
    // Use Firebase authentication
    firebaseLogin(email, password).then(async user => {
        if (!user) {
            return; // Error message already shown
        }

        console.log('Login success:', user);
        currentUser = user;
        const loginEl = document.getElementById('loginSection');
        const dashboardEl = document.getElementById('mainDashboard');
        if (loginEl) loginEl.classList.add('hidden');
        if (dashboardEl) dashboardEl.classList.remove('hidden');

        const userNameEl = document.getElementById('sidebarUserName');
        const userRoleEl = document.getElementById('sidebarUserRole');
        if (userNameEl) userNameEl.textContent = user.name || user.email;
        if (userRoleEl) {
            userRoleEl.textContent = user.role === 'ADMIN'
                ? 'Administrator'
                : `${user.dept} - ${user.section} - Sem ${user.sem}`;
        }

        setAdminNavigationMode(user.role === 'ADMIN');
        if (user.role === 'ADMIN') {
            // Load users table for admin
            loadUsersForAdmin();
            switchView('manage-users');
        } else {
            switchView('schedule');
        }

        showToast(`Welcome ${user.name}!`, 'success');
    }).catch(err => {
        console.error('Login error:', err);
        showToast('Login failed: ' + err.message, 'error');
    });
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

    const userNameEl = document.getElementById('sidebarUserName');
    const userRoleEl = document.getElementById('sidebarUserRole');
    if (userNameEl) userNameEl.textContent = 'Guest';
    if (userRoleEl) userRoleEl.textContent = 'Student';

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

    // Render persisted attendance notification history in attendance view.
    renderAttendanceNotificationHistory();

    // Trigger proactive attendance alerts for students.
    notifyAttendanceAlerts();
}

function getAttendanceHistoryStorageKey() {
    if (!currentUser?.email) return null;
    return `attendance-notification-history-${currentUser.email}`;
}

function readAttendanceNotificationHistory() {
    const storageKey = getAttendanceHistoryStorageKey();
    if (!storageKey) return [];

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Failed to read attendance notification history:', error);
        return [];
    }
}

function saveAttendanceNotificationHistory(entries) {
    const storageKey = getAttendanceHistoryStorageKey();
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(entries));
}

function appendAttendanceNotificationHistory(type, message) {
    const entries = readAttendanceNotificationHistory();
    entries.unshift({
        type,
        message,
        timestamp: new Date().toISOString()
    });

    // Keep latest entries only to avoid growing storage indefinitely.
    saveAttendanceNotificationHistory(entries.slice(0, 25));
    renderAttendanceNotificationHistory();
}

function renderAttendanceNotificationHistory() {
    const container = document.getElementById('attendanceNotificationHistory');
    if (!container || !currentUser || currentUser.role === 'ADMIN') return;

    const entries = readAttendanceNotificationHistory();
    if (!entries.length) {
        container.innerHTML = `
            <div class="text-center py-6 text-gray-400 text-sm">
                <p>No attendance notifications yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = entries.map((entry) => {
        const when = new Date(entry.timestamp).toLocaleString();
        const badge = entry.type === 'warning'
            ? '<span class="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">Low Attendance</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">Month-End</span>';

        return `
            <div class="border border-gray-200 rounded-lg p-3 mb-3 last:mb-0">
                <div class="flex items-center justify-between mb-2">
                    ${badge}
                    <span class="text-xs text-gray-400">${when}</span>
                </div>
                <p class="text-sm text-gray-700">${entry.message}</p>
            </div>
        `;
    }).join('');
}

function clearAttendanceNotificationHistory() {
    const storageKey = getAttendanceHistoryStorageKey();
    if (!storageKey) return;

    localStorage.removeItem(storageKey);
    renderAttendanceNotificationHistory();
    showToast('Attendance notification history cleared', 'info');
}

async function notifyAttendanceAlerts() {
    if (!currentUser?.email || currentUser.role === 'ADMIN' || isAttendanceAlertRequestInFlight) {
        return;
    }

    isAttendanceAlertRequestInFlight = true;
    try {
        const response = await fetch(`${API_BASE}/student/attendance-alerts?email=${encodeURIComponent(currentUser.email)}`);
        if (!response.ok) throw new Error('Attendance alerts unavailable');

        const data = await response.json();
        const todayKey = new Date().toISOString().slice(0, 10);

        if (data.has_low_attendance && Array.isArray(data.low_attendance_subjects) && data.low_attendance_subjects.length) {
            const lowAlertKey = `low-attendance-alert-${currentUser.email}-${todayKey}`;
            if (!localStorage.getItem(lowAlertKey)) {
                const focusSubject = data.low_attendance_subjects[0];
                const lowMsg = `Attendance alert: ${focusSubject.subject_name} is ${focusSubject.percentage}%. Attend ${focusSubject.classes_needed ?? 0} classes to reach 75%.`;
                showToast(lowMsg, 'warning');
                addChatMessage(`⚠️ ${lowMsg}`, 'bot');
                appendAttendanceNotificationHistory('warning', lowMsg);
                localStorage.setItem(lowAlertKey, 'sent');
            }
        }

        const monthly = data.monthly_summary;
        if (monthly?.is_month_end) {
            const monthAlertKey = `month-end-attendance-${currentUser.email}-${monthly.month}`;
            if (!localStorage.getItem(monthAlertKey)) {
                const monthMsg = `Month-end update (${monthly.month}): ${monthly.total_classes} classes happened, and you attended ${monthly.attended_classes} (${monthly.percentage}%).`;
                showToast(monthMsg, 'info');
                addChatMessage(`📅 ${monthMsg}`, 'bot');
                appendAttendanceNotificationHistory('month_end', monthMsg);
                localStorage.setItem(monthAlertKey, 'sent');
            }
        }
    } catch (error) {
        console.error('Attendance alert error:', error);
    } finally {
        isAttendanceAlertRequestInFlight = false;
    }
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
                    <p class="text-sm text-green-600 mt-2 font-semibold">✅ You can miss ${subject.safe_bunks} classes and still stay above 75%</p>
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
    const adminViews = ['manage-timetable', 'manage-announcements', 'manage-attendance', 'manage-resources', 'manage-bulk-students', 'manage-academic-structure', 'manage-students', 'manage-users'];
    const scopeRequiredAdminViews = ['manage-timetable', 'manage-announcements', 'manage-attendance', 'manage-resources', 'manage-bulk-students', 'manage-students'];
    const studentViews = ['dashboard', 'schedule', 'attendance', 'announcements', 'resources'];

    if (currentUser?.role === 'ADMIN' && studentViews.includes(viewName)) {
        viewName = 'manage-timetable';
    }

    if (scopeRequiredAdminViews.includes(viewName) && currentUser?.role === 'ADMIN' && !adminScope.configured) {
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
        } else if (viewName === 'manage-bulk-students') {
            resetBulkUploadView();
        } else if (viewName === 'manage-academic-structure') {
            loadAcademicStructure();
        } else if (viewName === 'manage-students') {
            loadStudentsByScope();
        } else if (viewName === 'manage-users') {
            console.log('📋 Loading users for manage-users view...');
            loadUsersForAdmin();
        } else if (viewName === 'attendance') {
            renderAttendanceNotificationHistory();
        }
    }

    // Auto-close slide sidebar after selecting a destination on small screens.
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    if (!isDesktop) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.add('hidden');
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
        'manage-resources': 'Manage Resources',
        'manage-bulk-students': 'Bulk Student Upload',
        'manage-academic-structure': 'Manage Dept/Section',
        'manage-students': 'Manage Students'
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
    if (currentUser?.role === 'ADMIN') return;

    const container = document.getElementById('chatContainer');
    const toggle = document.getElementById('chatToggle');
    if (!container || !toggle) return;

    const shouldOpen = container.classList.contains('hidden');
    isChatOpen = shouldOpen;
    container.classList.toggle('hidden', !shouldOpen);

    if (shouldOpen) {
        // Trigger alerts here so month-end summary appears when chat opens too.
        notifyAttendanceAlerts();
    }

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
    const sendBtn = document.getElementById('chatSendBtn');
    if (!input || isChatRequestInFlight) return;

    if (currentUser?.role === 'ADMIN') {
        showToast('Chatbot is disabled in admin panel', 'info');
        return;
    }

    const message = input.value.trim();
    
    if (!message) return;
    if (!currentUser?.email) {
        showToast('Please login to use chat', 'warning');
        addChatMessage('Please login first, then I can help you with attendance and schedule.', 'bot');
        return;
    }

    isChatRequestInFlight = true;
    if (sendBtn) sendBtn.disabled = true;
    
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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Chat failed (${response.status})`);
        }
        
        const data = await response.json();
        const botReply = (data?.response || '').toString().trim();
        if (!botReply) throw new Error('Empty response from assistant');
        addChatMessage(botReply, 'bot');
        
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage(`Sorry, I could not process that (${error.message}). Please try again.`, 'bot');
    } finally {
        isChatRequestInFlight = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = sender === 'user'
        ? 'chat-bubble-user p-3 rounded-lg max-w-xs text-sm'
        : 'chat-bubble-bot p-3 rounded-lg max-w-xs text-sm text-gray-700 whitespace-pre-line';
    bubble.textContent = String(text || '');
    
    if (sender === 'user') {
        messageDiv.className = 'flex items-end justify-end space-x-2';
        messageDiv.appendChild(bubble);
    } else {
        messageDiv.className = 'flex items-end space-x-2';

        const avatar = document.createElement('div');
        avatar.className = 'w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0';

        const icon = document.createElement('i');
        icon.className = 'fas fa-robot text-primary-600 text-sm';
        avatar.appendChild(icon);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============== MOBILE RESPONSIVE ==============

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');
    const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
    
    if (sidebar) {
        if (isDesktop) {
            sidebar.classList.toggle('closed');
            if (mainContent) {
                mainContent.classList.toggle('sidebar-collapsed', sidebar.classList.contains('closed'));
            }
        } else {
            sidebar.classList.toggle('open');
            overlay?.classList.toggle('hidden');
        }
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
    refreshAdminScopeOptions();
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
    if (document.getElementById('view-manage-bulk-students') && !document.getElementById('view-manage-bulk-students').classList.contains('hidden')) resetBulkUploadView();
    if (document.getElementById('view-manage-academic-structure') && !document.getElementById('view-manage-academic-structure').classList.contains('hidden')) loadAcademicStructure();
    if (document.getElementById('view-manage-students') && !document.getElementById('view-manage-students').classList.contains('hidden')) loadStudentsByScope();
}

function getSelectedValues(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];
    return Array.from(select.selectedOptions).map(option => option.value);
}

function setOptions(selectId, values, selectedValues = []) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const selectedSet = new Set(selectedValues.map(String));
    select.innerHTML = values.map(value => `<option value="${value}" ${selectedSet.has(String(value)) ? 'selected' : ''}>${value}</option>`).join('');
}

function setDepartmentFilterOptions(values, selectedValue = '') {
    const select = document.getElementById('studentDeptFilter');
    if (!select) return;

    const current = selectedValue || select.value || '';
    select.innerHTML = '<option value="">All Departments</option>' + values.map(value => `<option value="${value}">${value}</option>`).join('');
    select.value = current;
}

async function refreshAdminScopeOptions(preferredDept = null, preferredSection = null) {
    if (currentUser?.role !== 'ADMIN') return;

    try {
        const response = await fetch(`${API_BASE}/admin/academic-options?admin_email=${encodeURIComponent(currentUser.email)}`);
        if (!response.ok) throw new Error('Failed to load academic options');

        const data = await response.json();
        const departments = data.departments || [];
        const sections = data.sections || [];

        const selectedDepts = preferredDept ? [preferredDept] : (adminScope.depts || []);
        const selectedSections = preferredSection ? [preferredSection] : (adminScope.sections || []);

        setOptions('adminScopeDepts', departments, selectedDepts);
        setOptions('adminScopeSections', sections, selectedSections);
        setOptions('newAnnTargetDepts', departments, getSelectedValues('newAnnTargetDepts'));
        setOptions('newAnnTargetSections', sections, getSelectedValues('newAnnTargetSections'));
        setOptions('editAnnTargetDepts', departments, getSelectedValues('editAnnTargetDepts'));
        setOptions('editAnnTargetSections', sections, getSelectedValues('editAnnTargetSections'));

        setDepartmentFilterOptions(departments);
    } catch (error) {
        console.error('Academic options error:', error);
    }
}

async function loadAcademicStructure() {
    try {
        const response = await fetch(`${API_BASE}/admin/academic-options?admin_email=${encodeURIComponent(currentUser.email)}`);
        if (!response.ok) throw new Error('Failed to load academic structure');

        const data = await response.json();
        const deptSections = data.dept_sections || {};
        const tbody = document.getElementById('academicStructureBody');
        if (!tbody) return;

        // Create individual rows for each dept:section combination
        const rows = [];
        for (const dept of Object.keys(deptSections).sort()) {
            const sections = deptSections[dept] || [];
            if (!sections.length) continue;
            
            for (const section of sections.sort()) {
                rows.push({ dept, section });
            }
        }

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-400">No department/section records</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map((item) => `
            <tr>
                <td class="px-4 py-3 font-semibold text-gray-800">${item.dept}</td>
                <td class="px-4 py-3 text-gray-600">${item.section}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="openEditAcademicUnitModal('${item.dept}', '${item.section}')" class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button onclick="deleteAcademicUnit('${item.dept}', '${item.section}')" class="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs font-medium">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Load academic structure error:', error);
        showToast('Failed to load department/section list', 'error');
    }


async function createAcademicUnit() {
    const deptInput = document.getElementById('newDeptName');
    const sectionInput = document.getElementById('newSectionName');
    const dept = (deptInput?.value || '').trim().toUpperCase();
    const section = (sectionInput?.value || '').trim().toUpperCase();

    if (!dept || !section) {
        showToast('Department and section are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/academic-options?admin_email=${encodeURIComponent(currentUser.email)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dept, section })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to create option');

        showToast('✅ Department/section added', 'success');
        if (deptInput) deptInput.value = '';
        if (sectionInput) sectionInput.value = '';

        await refreshAdminScopeOptions(dept, section);
        loadAcademicStructure();
    } catch (error) {
        showToast(error.message || 'Failed to add department/section', 'error');
    }
}

async function loadStudentsByScope() {
    // Build query with admin scope instead of manual filter
    const params = new URLSearchParams();
    params.set('admin_email', currentUser?.email || '');
    
    // Use admin scope if configured, otherwise load with first available department
    if (adminScope.configured && adminScope.depts.length > 0) {
        params.set('dept', adminScope.depts[0]); // Get first selected department
    } else {
        // If scope not configured, try to get first available department from options
        try {
            const response = await fetch(`${API_BASE}/admin/academic-options?admin_email=${encodeURIComponent(currentUser.email)}`);
            if (response.ok) {
                const data = await response.json();
                const depts = data.departments || [];
                if (depts.length > 0) {
                    params.set('dept', depts[0]); // Use first available department
                }
            }
        } catch (e) {
            console.error('Failed to get default scope:', e);
        }
    }

    try {
        const response = await fetch(`${API_BASE}/admin/students?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to load students');

        const data = await response.json();
        const tbody = document.getElementById('studentsManagementBody');
        if (!tbody) return;

        const students = data.students || [];
        const deptDisplay = adminScope.configured ? adminScope.depts[0] : 'selected';
        
        if (!students.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No students found in ${deptDisplay} department.</td></tr>`;
            return;
        }

        tbody.innerHTML = students.map((student) => `
            <tr>
                <td class="px-4 py-3 text-gray-800 font-medium">${student.name}</td>
                <td class="px-4 py-3 text-gray-600 text-sm">${student.email}</td>
                <td class="px-4 py-3 text-gray-600">${student.roll_number}</td>
                <td class="px-4 py-3 text-gray-600">${student.dept} - ${student.section}</td>
                <td class="px-4 py-3 text-gray-600">${student.sem}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="openEditStudentModal('${student.email}', '${student.name.replace(/'/g, "\\'")}', '${student.roll_number}', '${student.dept}', '${student.section}', ${student.sem})" class="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button onclick="deleteStudentFromTab('${student.email}')" class="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs font-medium">
                            <i class="fas fa-trash mr-1"></i>Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Load students error:', error);
        showToast('Failed to load students', 'error');
    }
}

async function createStudentManually() {
    const payload = {
        name: (document.getElementById('studentName')?.value || '').trim(),
        email: (document.getElementById('studentEmail')?.value || '').trim().toLowerCase(),
        roll_number: (document.getElementById('studentRoll')?.value || '').trim().toUpperCase(),
        dept: (document.getElementById('studentDept')?.value || '').trim().toUpperCase(),
        section: (document.getElementById('studentSection')?.value || '').trim().toUpperCase(),
        sem: parseInt(document.getElementById('studentSem')?.value || '1', 10)
    };

    if (!payload.name || !payload.email || !payload.roll_number || !payload.dept || !payload.section || Number.isNaN(payload.sem)) {
        showToast('Fill all student fields correctly', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/students?admin_email=${encodeURIComponent(currentUser.email)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to create student');

        showToast('✅ Student created', 'success');
        ['studentName', 'studentEmail', 'studentRoll', 'studentDept', 'studentSection', 'studentSem'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        await refreshAdminScopeOptions(payload.dept, payload.section);
        loadStudentsByScope();
    } catch (error) {
        showToast(error.message || 'Failed to create student', 'error');
    }
}

async function deleteStudentFromTab(studentEmail) {
    if (!confirm(`Delete student ${studentEmail}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/admin/students/${encodeURIComponent(studentEmail)}?admin_email=${encodeURIComponent(currentUser.email)}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to delete student');

        showToast('✅ Student deleted', 'success');
        loadStudentsByScope();
    } catch (error) {
        showToast(error.message || 'Failed to delete student', 'error');
    }
}

// ============== EDIT ACADEMIC UNIT ==============

let currentEditingAcademicUnit = { dept: '', section: '' };

function openEditAcademicUnitModal(dept, section) {
    currentEditingAcademicUnit = { dept, section };
    document.getElementById('editAcademicDept').value = dept;
    document.getElementById('editAcademicSection').value = section;
    document.getElementById('editAcademicUnitModal')?.classList.remove('hidden');
}

function closeEditAcademicUnitModal() {
    document.getElementById('editAcademicUnitModal')?.classList.add('hidden');
    currentEditingAcademicUnit = { dept: '', section: '' };
}

async function saveAcademicUnitEdit() {
    const newDept = (document.getElementById('editAcademicDept')?.value || '').trim().toUpperCase();
    const newSection = (document.getElementById('editAcademicSection')?.value || '').trim().toUpperCase();
    
    if (!newDept || !newSection) {
        showToast('Department and section are required', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/admin/academic-options?old_dept=${encodeURIComponent(currentEditingAcademicUnit.dept)}&old_section=${encodeURIComponent(currentEditingAcademicUnit.section)}&admin_email=${encodeURIComponent(currentUser.email)}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dept: newDept, section: newSection })
            }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to update');

        showToast('✅ Department/Section updated', 'success');
        closeEditAcademicUnitModal();
        await refreshAdminScopeOptions(newDept, newSection);
        loadAcademicStructure();
    } catch (error) {
        showToast(error.message || 'Failed to update department/section', 'error');
    }
}

async function deleteAcademicUnit(dept, section) {
    if (!confirm(`Delete ${dept} - ${section}?`)) return;

    try {
        const response = await fetch(
            `${API_BASE}/admin/academic-options?dept=${encodeURIComponent(dept)}&section=${encodeURIComponent(section)}&admin_email=${encodeURIComponent(currentUser.email)}`,
            { method: 'DELETE' }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to delete');

        showToast('✅ Department/Section deleted', 'success');
        loadAcademicStructure();
    } catch (error) {
        showToast(error.message || 'Failed to delete department/section', 'error');
    }
}

// ============== EDIT STUDENT ==============

let currentEditingStudent = { email: '' };

function openEditStudentModal(email, name, roll, dept, section, sem) {
    currentEditingStudent = { email };
    document.getElementById('editStudentName').value = name;
    document.getElementById('editStudentEmail').value = email;
    document.getElementById('editStudentRoll').value = roll;
    document.getElementById('editStudentDept').value = dept;
    document.getElementById('editStudentSection').value = section;
    document.getElementById('editStudentSem').value = sem;
    document.getElementById('editStudentModal')?.classList.remove('hidden');
}

function closeEditStudentModal() {
    document.getElementById('editStudentModal')?.classList.add('hidden');
    currentEditingStudent = { email: '' };
}

async function saveStudentEdit() {
    const payload = {
        name: (document.getElementById('editStudentName')?.value || '').trim(),
        email: (document.getElementById('editStudentEmail')?.value || '').trim().toLowerCase(),
        roll_number: (document.getElementById('editStudentRoll')?.value || '').trim().toUpperCase(),
        dept: (document.getElementById('editStudentDept')?.value || '').trim().toUpperCase(),
        section: (document.getElementById('editStudentSection')?.value || '').trim().toUpperCase(),
        sem: parseInt(document.getElementById('editStudentSem')?.value || '1', 10)
    };

    if (!payload.name || !payload.email || !payload.roll_number || !payload.dept || !payload.section || Number.isNaN(payload.sem)) {
        showToast('Fill all fields correctly', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/admin/students/${encodeURIComponent(currentEditingStudent.email)}?admin_email=${encodeURIComponent(currentUser.email)}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to update');

        showToast('✅ Student updated', 'success');
        closeEditStudentModal();
        await refreshAdminScopeOptions(payload.dept, payload.section);
        loadStudentsByScope();
    } catch (error) {
        showToast(error.message || 'Failed to update student', 'error');
    }
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

function resetBulkUploadView() {
    const summary = document.getElementById('bulkUploadSummary');
    const errorWrap = document.getElementById('bulkUploadErrorLinkWrap');
    const credentialsBody = document.getElementById('bulkUploadCredentialsBody');

    if (summary) {
        summary.classList.add('hidden');
        summary.innerHTML = '';
    }
    if (errorWrap) {
        errorWrap.classList.add('hidden');
    }
    if (credentialsBody) {
        credentialsBody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">No upload processed yet.</td></tr>';
    }
}

async function uploadBulkStudents() {
    const fileInput = document.getElementById('bulkStudentFileInput');
    const notifyToggle = document.getElementById('bulkNotifyStudents');
    const summary = document.getElementById('bulkUploadSummary');
    const errorWrap = document.getElementById('bulkUploadErrorLinkWrap');
    const errorLink = document.getElementById('bulkUploadErrorLink');
    const credentialsBody = document.getElementById('bulkUploadCredentialsBody');

    if (!fileInput || !fileInput.files.length) {
        showToast('Select a .csv or .xlsx file first', 'warning');
        return;
    }

    const selected = fileInput.files[0];
    const fileName = (selected.name || '').toLowerCase();
    if (!(fileName.endsWith('.csv') || fileName.endsWith('.xlsx'))) {
        showToast('Only .csv and .xlsx files are allowed', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('admin_email', currentUser.email);
    formData.append('send_notifications', String(Boolean(notifyToggle?.checked)));
    formData.append('file', selected);

    try {
        const response = await fetch(`${API_BASE}/admin/students/bulk-upload`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || 'Bulk upload failed');
        }

        const created = result.created_count || 0;
        const failed = result.failed_count || 0;

        if (summary) {
            summary.classList.remove('hidden');
            summary.innerHTML = `
                <p class="font-semibold text-gray-800 mb-2">Upload Result</p>
                <p>Accounts created: <strong>${created}</strong></p>
                <p>Rows failed: <strong>${failed}</strong></p>
                <p>Notifications sent: <strong>${result.notifications_sent || 0}</strong></p>
            `;
        }

        if (errorWrap && errorLink && result.error_report_download_url) {
            errorWrap.classList.remove('hidden');
            errorLink.href = `${API_BASE}${result.error_report_download_url}`;
        } else if (errorWrap) {
            errorWrap.classList.add('hidden');
        }

        if (credentialsBody) {
            const credentials = Array.isArray(result.credentials) ? result.credentials : [];
            if (!credentials.length) {
                credentialsBody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-400">No credentials generated.</td></tr>';
            } else {
                credentialsBody.innerHTML = credentials.map((entry) => `
                    <tr>
                        <td class="px-4 py-3 text-gray-700">${entry.name || '-'}</td>
                        <td class="px-4 py-3 text-gray-700">${entry.email || '-'}</td>
                        <td class="px-4 py-3 text-gray-700 font-medium">${entry.username || '-'}</td>
                        <td class="px-4 py-3 text-gray-700 font-mono">${entry.password || '-'}</td>
                    </tr>
                `).join('');
            }
        }

        showToast(`Bulk upload complete. Created: ${created}, Failed: ${failed}`, failed > 0 ? 'warning' : 'success');
        fileInput.value = '';
    } catch (error) {
        showToast(error.message || 'Failed to upload students', 'error');
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

// Close unterminated block from previous section.
}
