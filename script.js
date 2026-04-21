/**
 * Student Management Portal - Chat Integration
 * Firebase Chat Operations with Login System
 * Updated to match existing HTML element IDs
 */

console.log('🚀 Script.js loading...');

// ============== IMPORTS ==============
import { db, auth } from './firebase.js';
import {
  initializeUserSession,
  createChat,
  getUserChats,
  getMessages,
  addMessage,
  onMessagesUpdate
} from './firebase-chat-operations.js';

// Import Firestore functions once (not in every function)
import {
  getDocs,
  collection,
  query,
  limit,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

console.log('✓ Firebase imports successful');
console.log('✓ Firebase-chat-operations imports successful');
console.log('✓ Firestore functions pre-imported for performance');

// Make imported functions globally accessible for console testing
window.initializeUserSession = initializeUserSession;
window.createChat = createChat;
window.getUserChats = getUserChats;
window.getMessages = getMessages;
window.addMessage = addMessage;
window.onMessagesUpdate = onMessagesUpdate;

console.log('✓ Functions exposed to window object');

// ============== GLOBAL STATE ==============
let currentUser = null;
let currentChatId = null;
let messagesUnsubscriber = null;

// ============== LOGIN FUNCTIONS ==============

/**
 * Handle user login
 */
async function login() {
  console.log('🔐 LOGIN CLICKED');
  try {
    const emailInput = document.getElementById('loginEmail');
    const email = emailInput?.value?.trim();

    console.log('Email input element:', emailInput);
    console.log('Email value:', email);

    if (!email) {
      console.warn('No email provided');
      showToast('Please enter email', 'error');
      return;
    }

    console.log('🔐 Logging in with email:', email);

    // Extract name from email (for demo purposes)
    const name = email.split('@')[0];
    console.log('Extracted name:', name);

    // Check if initializeUserSession exists
    if (typeof initializeUserSession !== 'function') {
      console.error('ERROR: initializeUserSession is not a function');
      showToast('System error: Firebase functions not loaded', 'error');
      return;
    }

    console.log('Calling initializeUserSession...');
    
    // Initialize user session
    const userProfile = await initializeUserSession(email, name);
    
    console.log('✓ User profile received:', userProfile);

    currentUser = {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role || 'STUDENT'
    };

    console.log('✓ User logged in:', currentUser);
    console.log('🔐 User Role:', currentUser.role);
    console.log('🔐 Is Admin?', currentUser.role === 'ADMIN');
    showToast(`Welcome, ${currentUser.name}! (${currentUser.role})`, 'success');

    // Show admin menu if user is admin
    const adminSection = document.getElementById('adminSection');
    const adminScopeBtn = document.getElementById('adminScopeBtn');
    if (adminSection) {
      if (currentUser.role === 'ADMIN') {
        adminSection.classList.remove('hidden');
        if (adminScopeBtn) adminScopeBtn.classList.remove('hidden');
        console.log('✓ Admin menu shown');
      } else {
        adminSection.classList.add('hidden');
        if (adminScopeBtn) adminScopeBtn.classList.add('hidden');
        console.log('✗ Admin menu hidden (not admin)');
      }
    } else {
      console.error('❌ Admin section element not found!');
    }

    // Update sidebar user name
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
    if (sidebarUserRole) sidebarUserRole.textContent = currentUser.role;

    // Hide login, show dashboard
    const loginSection = document.getElementById('loginSection');
    const mainDashboard = document.getElementById('mainDashboard');
    
    console.log('Login section:', loginSection);
    console.log('Main dashboard:', mainDashboard);
    
    if (loginSection) {
      loginSection.classList.add('hidden');
      console.log('✓ Login section hidden');
    }
    if (mainDashboard) {
      mainDashboard.classList.remove('hidden');
      console.log('✓ Dashboard shown');
    }

    // Show chat widget
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) {
      chatWidget.classList.remove('hidden');
      console.log('✓ Chat widget shown');
    }

    // Load user's chats (but don't wait for it - lazy load in background)
    console.log('Loading user chats (in background)...');
    // Don't await - load chats asynchronously so login completes faster
    loadUserChats().catch(err => console.error('Chat loading error:', err));
    console.log('✓ Login complete');
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    const msg = 'Login failed: ' + (error.message || error);
    console.log('Showing toast:', msg);
    showToast(msg, 'error');
  }
}

/**
 * Handle login keypress (Enter key)
 */
function handleLoginKeypress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

/**
 * Logout user
 */
function logout() {
  try {
    // Clean up real-time listener
    if (messagesUnsubscriber) {
      messagesUnsubscriber();
      messagesUnsubscriber = null;
    }

    // Clear state
    currentUser = null;
    currentChatId = null;

    // Show login, hide dashboard
    const loginSection = document.getElementById('loginSection');
    const mainDashboard = document.getElementById('mainDashboard');
    if (loginSection) loginSection.classList.remove('hidden');
    if (mainDashboard) mainDashboard.classList.add('hidden');

    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) chatWidget.classList.add('hidden');

    // Clear form
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';

    console.log('✓ User logged out');
    showToast('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============== CHAT WIDGET FUNCTIONS ==============

/**
 * Toggle chat widget visibility
 */
function toggleChatbox() {
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    chatContainer.classList.toggle('hidden');
    if (!chatContainer.classList.contains('hidden')) {
      loadUserChats();
    }
  }
}

/**
 * Load and display all user chats
 */
async function loadUserChats() {
  try {
    if (!currentUser) {
      console.warn('No user logged in');
      return;
    }

    const chats = await getUserChats(currentUser.email);

    const chatListContainer = document.getElementById('chatMessages');
    if (!chatListContainer) {
      console.warn('Chat messages container not found');
      return;
    }

    chatListContainer.innerHTML = '';

    if (chats.length === 0) {
      chatListContainer.innerHTML =
        '<div class="text-center text-gray-500 text-sm py-4">No chats yet.<br>Start a conversation!</div>';
      return;
    }

    chats.forEach((chat) => {
      const chatItem = document.createElement('div');
      chatItem.className =
        'p-2 mb-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition text-sm';
      chatItem.innerHTML = `
        <h4 class="font-semibold text-gray-800 truncate">${escapeHtml(chat.title)}</h4>
        <p class="text-xs text-gray-600 truncate">${escapeHtml(
          chat.lastMessage || 'No messages'
        )}</p>
      `;
      chatItem.onclick = () => openChat(chat.id);
      chatListContainer.appendChild(chatItem);
    });

    console.log(`✓ Loaded ${chats.length} chats`);
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

/**
 * Open a specific chat
 */
async function openChat(chatId) {
  try {
    if (!currentUser) {
      showToast('Please login first', 'error');
      return;
    }

    // Clean up previous listener
    if (messagesUnsubscriber) {
      messagesUnsubscriber();
    }

    currentChatId = chatId;
    console.log(`✓ Chat opened: ${chatId}`);

    // Clear previous messages
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) chatMessages.innerHTML = '<div class="text-sm text-gray-500">Loading messages...</div>';

    // Set up real-time listener
    messagesUnsubscriber = onMessagesUpdate(
      currentUser.email,
      chatId,
      (messages) => {
        renderMessages(messages);
      }
    );
  } catch (error) {
    console.error('Error opening chat:', error);
    showToast('Could not open chat', 'error');
  }
}

/**
 * Render messages in chat widget
 */
function renderMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  container.innerHTML = '';

  if (messages.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 text-sm py-4">No messages yet</div>';
    return;
  }

  messages.forEach((msg) => {
    const messageEl = document.createElement('div');
    messageEl.className = `mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-xs px-3 py-1 rounded text-sm ${
      msg.sender === 'user'
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-gray-200 text-gray-800 rounded-bl-none'
    }`;

    bubble.innerHTML = `${escapeHtml(msg.text)}<br><small class="opacity-70 text-xs">${formatTime(msg.timestamp)}</small>`;
    messageEl.appendChild(bubble);
    container.appendChild(messageEl);
  });

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/**
 * Send a message from chat widget
 */
async function sendChatMessage() {
  try {
    if (!currentUser || !currentChatId) {
      showToast('Open a chat first', 'error');
      return;
    }

    const input = document.getElementById('chatInput');
    const text = input?.value?.trim();

    if (!text) {
      showToast('Message cannot be empty', 'error');
      return;
    }

    // Add user message
    await addMessage(currentUser.email, currentChatId, 'user', text);
    console.log('✓ Message sent');

    // Clear input
    if (input) input.value = '';

    // Simulate bot response
    setTimeout(async () => {
      const botResponse = `Echo: ${text} (from bot)`;
      await addMessage(currentUser.email, currentChatId, 'bot', botResponse);
    }, 500);
  } catch (error) {
    console.error('Error sending message:', error);
    showToast('Could not send message', 'error');
  }
}

/**
 * Handle chat input keypress
 */
function handleChatKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format time for display
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

/**
 * Show toast notification
 */
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

// ============== EVENT LISTENERS ==============

console.log('Script loading... setting up event listeners');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ DOMContentLoaded fired');
  
  // Login button
  const loginButton = document.getElementById('loginButton');
  console.log('Login button element:', loginButton);
  
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      console.log('Login button click event fired');
      login();
    });
    console.log('✓ Login button click listener attached');
  } else {
    console.error('❌ Login button not found in DOM');
  }

  // Login Enter key
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('Enter key pressed on password field');
        login();
      }
    });
    console.log('✓ Password Enter key listener attached');
  }

  // Chat send button
  const chatSendBtn = document.getElementById('chatSendBtn');
  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
    console.log('✓ Chat send button listener attached');
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
    console.log('✓ Logout button listener attached');
  }

  console.log('✓ Chat system initialized - All event listeners ready');
});

// Test function - call from console
window.testLogin = async function() {
  console.log('Testing login function...');
  console.log('currentUser:', currentUser);
  console.log('initializeUserSession available:', typeof initializeUserSession);
  try {
    const userProfile = await initializeUserSession('test@college.edu', 'Test');
    console.log('Test user created:', userProfile);
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Test function - call from console
window.testChatSystem = function() {
  console.log('=== CHAT SYSTEM TEST ===');
  console.log('Firebase db:', typeof db);
  console.log('Firebase auth:', typeof auth);
  console.log('initializeUserSession:', typeof initializeUserSession);
  console.log('createChat:', typeof createChat);
  console.log('getUserChats:', typeof getUserChats);
  console.log('addMessage:', typeof addMessage);
  console.log('onMessagesUpdate:', typeof onMessagesUpdate);
  console.log('=== END TEST ===');
};

console.log('✓ External test functions available:');
console.log('  - window.testLogin()');
console.log('  - window.testChatSystem()');

// ============== DASHBOARD VIEW FUNCTIONS ==============

/**
 * Switch between different dashboard views
 */
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
    'manage-users': { title: 'Manage Users', subtitle: 'Manage all users' },
    'manage-academic-structure': { title: 'Manage Dept/Section', subtitle: 'Manage academic structure' },
    'manage-students': { title: 'Manage Students', subtitle: 'Manage student records' }
  };
  
  const viewInfo = titles[viewName] || { title: viewName, subtitle: '' };
  document.getElementById('pageTitle').textContent = viewInfo.title;
  document.getElementById('pageSubtitle').textContent = viewInfo.subtitle;
  
  // Load view-specific data
  if (viewName === 'dashboard') loadDashboardData();
  else if (viewName === 'attendance') loadAttendanceData();
  else if (viewName === 'schedule') loadScheduleData();
  else if (viewName === 'announcements') loadAnnouncementsData();
  else if (viewName === 'resources') loadResourcesData();
}

/**
 * Load dashboard statistics
 */
async function loadDashboardData() {
  console.log('Loading dashboard data...');
  try {
    // Firestore functions already imported at module level - no delay
    
    // Load stats with LIMITS for performance (fetch only recent records)
    const announcementsSnap = await getDocs(
      query(collection(db, 'announcements'), 
        orderBy('createdAt', 'desc'),
        limit(5))
    );
    const timetableSnap = await getDocs(
      query(collection(db, 'timetable'), 
        limit(10))
    );
    const usersSnap = await getDocs(
      query(collection(db, 'users'), 
        limit(10))
    );
    
    // Update dashboard stats
    document.getElementById('overallAttendance').textContent = '92%';
    
    console.log(`✓ Dashboard stats loaded (performance optimized):`);
    console.log(`  - Recent Announcements: ${announcementsSnap.size} (limit: 5)`);
    console.log(`  - Timetable entries: ${timetableSnap.size} (limit: 10)`);
    console.log(`  - Users: ${usersSnap.size} (limit: 10)`);
    
    showToast('✓ Dashboard loaded quickly', 'success');
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Dashboard error', 'error');
  }
}

/**
 * Load attendance data
 */
async function loadAttendanceData() {
  console.log('Loading attendance data...');
  try {
    const contentContainer = document.getElementById('subjectAttendanceContent');
    if (!contentContainer) return;
    
    // Show loading
    contentContainer.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-blue-400 mb-2"></i><p class="text-gray-400">Loading attendance data...</p></div>';
    
    // Fetch attendance records (max 50, most recent first)
    const querySnapshot = await getDocs(
      query(collection(db, 'attendance'),
        orderBy('createdAt', 'desc'),
        limit(50))
    );
    
    // Calculate overall attendance
    let totalClasses = 0;
    let presentCount = 0;
    const subjectData = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const subject = data.subject || 'General';
      const status = data.status || 'absent';
      
      if (!subjectData[subject]) {
        subjectData[subject] = { total: 0, present: 0 };
      }
      
      subjectData[subject].total++;
      totalClasses++;
      
      if (status.toLowerCase() === 'present') {
        subjectData[subject].present++;
        presentCount++;
      }
    });
    
    // Update overall attendance circle
    const overallPercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    const circlePercentage = document.getElementById('circlePercentage');
    const progressCircle = document.getElementById('progressCircle');
    
    if (circlePercentage) circlePercentage.textContent = overallPercentage + '%';
    if (progressCircle) {
      const circumference = 2 * 3.14159 * 40; // 2πr
      const offset = circumference - (overallPercentage / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }
    
    const badgeElement = document.getElementById('overallStatusBadge');
    if (badgeElement) {
      if (overallPercentage >= 75) {
        badgeElement.textContent = 'SAFE';
        badgeElement.className = 'px-4 py-2 rounded-xl text-white font-semibold bg-green-500';
      } else if (overallPercentage >= 60) {
        badgeElement.textContent = 'WARNING';
        badgeElement.className = 'px-4 py-2 rounded-xl text-white font-semibold bg-yellow-500';
      } else {
        badgeElement.textContent = 'RISK';
        badgeElement.className = 'px-4 py-2 rounded-xl text-white font-semibold bg-red-500';
      }
    }
    
    // Display subject-wise breakdown
    if (Object.keys(subjectData).length === 0) {
      contentContainer.innerHTML = '<div class="text-center py-8 text-gray-400"><p>No attendance data available</p></div>';
      return;
    }
    
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    
    Object.entries(subjectData).forEach(([subject, data]) => {
      const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
      const color = percentage >= 75 ? 'bg-green-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100';
      const barColor = percentage >= 75 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
      
      html += `
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-gray-800 text-sm">${escapeHtml(subject)}</h4>
            <span class="text-xs font-bold text-gray-700">${data.present}/${data.total}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="${barColor} h-full rounded-full transition-all" style="width: ${percentage}%"></div>
          </div>
          <div class="text-xs text-gray-600 mt-2">${percentage}% attendance</div>
        </div>
      `;
    });
    
    html += '</div>';
    contentContainer.innerHTML = html;
    console.log(`✓ Loaded attendance for ${Object.keys(subjectData).length} subjects`);
  } catch (error) {
    console.error('Error loading attendance:', error);
    showToast('Error loading attendance', 'error');
  }
}

/**
 * Create timetable entry and save to Firestore
 */
async function createTimetableEntry() {
  try {
    const day = document.getElementById('newTtDay')?.value;
    const time = document.getElementById('newTtTime')?.value;
    const subject = document.getElementById('newTtSubject')?.value;
    const room = document.getElementById('newTtRoom')?.value;
    const faculty = document.getElementById('newTtFaculty')?.value;
    const resource = document.getElementById('newTtResource')?.value;
    const dept = document.getElementById('newTtDept')?.value;
    const section = document.getElementById('newTtSection')?.value;
    const sem = document.getElementById('newTtSem')?.value;

    if (!day || !time || !subject || !room) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Firestore functions already imported - no dynamic import needed
    
    const entry = {
      day,
      time,
      subject,
      room,
      faculty: faculty || 'TBD',
      resource: resource || '',
      dept: dept || 'ALL',
      section: section || 'ALL',
      semester: sem ? parseInt(sem) : 0,
      createdAt: serverTimestamp(),
      createdBy: currentUser?.email || 'admin'
    };

    await addDoc(collection(db, 'timetable'), entry);
    console.log('✓ Timetable entry created:', entry);
    
    // Clear form
    document.getElementById('newTtTime').value = '';
    document.getElementById('newTtSubject').value = '';
    document.getElementById('newTtRoom').value = '';
    document.getElementById('newTtFaculty').value = '';
    document.getElementById('newTtResource').value = '';
    document.getElementById('newTtDept').value = '';
    document.getElementById('newTtSection').value = '';
    document.getElementById('newTtSem').value = '';

    showToast('✓ Timetable entry added to Firestore!', 'success');
    loadAllTimetable();
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

/**
 * Load all timetable entries from Firestore
 */
async function loadAllTimetable() {
  try {
    // Firestore functions already imported at module level
    
    // Show loading indicator
    const tbody = document.getElementById('timetableManagementBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center"><i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>Loading timetable...</td></tr>';
    
    // Load max 100 timetable entries (performance limit)
    const querySnapshot = await getDocs(
      query(collection(db, 'timetable'),
        orderBy('createdAt', 'desc'),
        limit(100))
    );
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (querySnapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No timetable entries yet</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.className = 'hover:bg-yellow-50 transition';
      row.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700 font-medium">${escapeHtml(data.day)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.time)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.subject)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.room)}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${data.resource ? escapeHtml(data.resource) : '<span class="text-gray-400">-</span>'}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.dept)}/${escapeHtml(data.section)}</td>
        <td class="px-4 py-3 text-sm">
          <button onclick="deleteTimetableEntry('${doc.id}')" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition duration-200 cursor-pointer">
            <i class="fas fa-trash mr-1"></i>Delete
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    console.log(`✓ Loaded ${querySnapshot.size} timetable entries (limit: 100)`);
  } catch (error) {
    console.error('Error loading timetable:', error);
  }
}

/**
 * Delete timetable entry
 */
async function deleteTimetableEntry(docId) {
  try {
    // Firestore functions already imported
    await deleteDoc(doc(db, 'timetable', docId));
    showToast('✓ Entry deleted', 'success');
    loadAllTimetable();
  } catch (error) {
    console.error('Error deleting entry:', error);
    showToast('Error deleting entry', 'error');
  }
}

/**
 * Create announcement and save to Firestore
 */
async function createAnnouncement() {
  try {
    const title = document.getElementById('newAnnTitle')?.value;
    const body = document.getElementById('newAnnBody')?.value;
    const image = document.getElementById('newAnnImage')?.value;
    const priority = document.getElementById('newAnnPriority')?.value;

    if (!title || !body) {
      showToast('Please fill in title and content', 'error');
      return;
    }

    // Firestore functions already imported
    
    const announcement = {
      title,
      body,
      image: image || '',
      priority: priority || 'normal',
      createdAt: serverTimestamp(),
      createdBy: currentUser?.email || 'admin'
    };

    await addDoc(collection(db, 'announcements'), announcement);
    console.log('✓ Announcement created:', announcement);
    
    // Clear form
    document.getElementById('newAnnTitle').value = '';
    document.getElementById('newAnnBody').value = '';
    document.getElementById('newAnnImage').value = '';
    document.getElementById('newAnnPriority').value = 'normal';

    showToast('✓ Announcement posted to Firestore!', 'success');
    loadAllAnnouncements();
  } catch (error) {
    console.error('Error creating announcement:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

/**
 * Load all announcements from Firestore (with limit for performance)
 */
async function loadAllAnnouncements() {
  try {
    // Firestore functions already imported at module level
    
    // Show loading indicator
    const grid = document.getElementById('announcementManagementGrid');
    if (grid) grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-spinner fa-spin text-2xl text-blue-400"></i><p class="text-gray-400 mt-2">Loading announcements...</p></div>';
    
    // Load max 100 announcements (performance: limit prevents loading thousands)
    const querySnapshot = await getDocs(
      query(collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(100))
    );
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (querySnapshot.empty) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-inbox text-3xl mb-2"></i><p>No announcements yet. Create one above!</p></div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement('div');
      const priorityColors = {
        'urgent': 'bg-red-50 border-red-200',
        'high': 'bg-orange-50 border-orange-200',
        'normal': 'bg-blue-50 border-blue-200'
      };
      const priorityBadgeColors = {
        'urgent': 'bg-red-100 text-red-700',
        'high': 'bg-orange-100 text-orange-700',
        'normal': 'bg-blue-100 text-blue-700'
      };
      const colorClass = priorityColors[data.priority] || priorityColors['normal'];
      const badgeClass = priorityBadgeColors[data.priority] || priorityBadgeColors['normal'];
      
      card.className = `${colorClass} rounded-xl p-4 border-2 hover:shadow-lg transition relative`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 text-base">${escapeHtml(data.title)}</h4>
            <p class="text-xs text-gray-500 mt-1">by ${escapeHtml(data.createdBy || 'Admin')}</p>
          </div>
          <button onclick="deleteAnnouncement('${doc.id}')" class="flex-shrink-0 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition cursor-pointer">
            <i class="fas fa-trash mr-1"></i>Delete
          </button>
        </div>
        <p class="text-sm text-gray-700 mb-3 line-clamp-2">${escapeHtml(data.body)}</p>
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 ${badgeClass} rounded-full text-xs font-semibold uppercase">
            <i class="fas fa-flag mr-1"></i>${data.priority}
          </span>
          <span class="text-xs text-gray-500">
            <i class="fas fa-calendar mr-1"></i>${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}
          </span>
        </div>
      `;
      grid.appendChild(card);
    });

    console.log(`✓ Loaded ${querySnapshot.size} announcements (limit: 100)`);
    showToast(`✓ ${querySnapshot.size} announcements loaded`, 'success');
  } catch (error) {
    console.error('Error loading announcements:', error);
    showToast('Error loading announcements', 'error');
  }
}

/**
 * Delete announcement
 */
async function deleteAnnouncement(docId) {
  try {
    // Firestore functions already imported
    await deleteDoc(doc(db, 'announcements', docId));
    showToast('✓ Announcement deleted', 'success');
    loadAllAnnouncements();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    showToast('Error deleting announcement', 'error');
  }
}

/**
 * Load schedule/timetable for students
 */
async function loadScheduleData() {
  console.log('Loading schedule data...');
  try {
    const table = document.getElementById('weeklyTimetable');
    if (!table) return;
    
    // Fetch timetable entries (max 100)
    const querySnapshot = await getDocs(
      query(collection(db, 'timetable'),
        orderBy('createdAt', 'desc'),
        limit(100))
    );
    
    if (querySnapshot.empty) {
      table.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">No timetable available</td></tr>';
      return;
    }

    // Group by time slots
    const timeSlots = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const time = data.time || 'Unknown';
      if (!timeSlots[time]) timeSlots[time] = {};
      timeSlots[time][data.day?.toLowerCase() || 'monday'] = data;
    });

    // Build table rows
    let html = '<thead><tr class="bg-gray-50"><th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>';
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      html += `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    Object.keys(timeSlots).sort().forEach(time => {
      html += `<tr class="border-t border-gray-100 hover:bg-gray-50">
        <td class="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">${escapeHtml(time)}</td>`;
      
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
        const entry = timeSlots[time][day];
        if (entry) {
          html += `<td class="px-4 py-3">
            <div class="text-sm font-semibold text-gray-800">${escapeHtml(entry.subject)}</div>
            <div class="text-xs text-gray-600"><i class="fas fa-door-open mr-1"></i>${escapeHtml(entry.room)}</div>
            <div class="text-xs text-gray-500">${entry.faculty ? escapeHtml(entry.faculty) : 'TBD'}</div>
          </td>`;
        } else {
          html += '<td class="px-4 py-3 text-gray-300 text-sm">-</td>';
        }
      });
      
      html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
    console.log(`✓ Loaded timetable for student`);
  } catch (error) {
    console.error('Error loading schedule:', error);
    showToast('Error loading schedule', 'error');
  }
}

/**
 * Load announcements for students
 */
async function loadAnnouncementsData() {
  console.log('Loading announcements for student...');
  try {
    const grid = document.getElementById('announcementsGrid');
    if (!grid) return;
    
    // Show loading
    grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-blue-400 mb-2"></i><p class="text-gray-400">Loading announcements...</p></div>';
    
    // Fetch announcements (max 50, most recent first)
    const querySnapshot = await getDocs(
      query(collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(50))
    );
    
    grid.innerHTML = '';
    
    if (querySnapshot.empty) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-inbox text-3xl mb-2"></i><p>No announcements yet</p></div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement('div');
      const priorityColors = {
        'urgent': 'bg-red-50 border-red-200',
        'high': 'bg-orange-50 border-orange-200',
        'normal': 'bg-blue-50 border-blue-200'
      };
      const priorityBadgeColors = {
        'urgent': 'bg-red-100 text-red-700',
        'high': 'bg-orange-100 text-orange-700',
        'normal': 'bg-blue-100 text-blue-700'
      };
      const colorClass = priorityColors[data.priority] || priorityColors['normal'];
      const badgeClass = priorityBadgeColors[data.priority] || priorityBadgeColors['normal'];
      
      card.className = `${colorClass} rounded-xl p-4 border-2 hover:shadow-lg transition cursor-pointer`;
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-gray-800 text-base">${escapeHtml(data.title)}</h3>
            <p class="text-xs text-gray-500 mt-1">by ${escapeHtml(data.createdBy || 'Admin')}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-3 line-clamp-3">${escapeHtml(data.body)}</p>
        <div class="flex items-center justify-between">
          <span class="px-3 py-1 ${badgeClass} rounded-full text-xs font-semibold uppercase">
            <i class="fas fa-flag mr-1"></i>${data.priority}
          </span>
          <span class="text-xs text-gray-500">
            <i class="fas fa-calendar mr-1"></i>${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}
          </span>
        </div>
      `;
      grid.appendChild(card);
    });

    console.log(`✓ Loaded ${querySnapshot.size} announcements for student`);
  } catch (error) {
    console.error('Error loading announcements:', error);
    showToast('Error loading announcements', 'error');
  }
}

/**
 * Load resources for students
 */
async function loadResourcesData() {
  console.log('Loading resources...');
  try {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;
    
    // Show loading
    grid.innerHTML = '<div class="col-span-full text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-blue-400 mb-2"></i><p class="text-gray-400">Loading resources...</p></div>';
    
    // Fetch resources (max 50)
    const querySnapshot = await getDocs(
      query(collection(db, 'resources'),
        orderBy('createdAt', 'desc'),
        limit(50))
    );
    
    grid.innerHTML = '';
    
    if (querySnapshot.empty) {
      grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400"><i class="fas fa-folder text-3xl mb-2"></i><p>No resources available yet</p></div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:shadow-lg transition';
      card.innerHTML = `
        <div class="flex items-start gap-3 mb-3">
          <i class="fas fa-file-pdf text-red-500 text-2xl mt-1"></i>
          <div class="flex-1">
            <h3 class="font-bold text-gray-800">${escapeHtml(data.title || 'Resource')}</h3>
            <p class="text-xs text-gray-500">by ${escapeHtml(data.createdBy || 'Admin')}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-3">${escapeHtml(data.description || 'Course material')}</p>
        <div class="text-xs text-gray-500">
          <i class="fas fa-calendar mr-1"></i>${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}
        </div>
      `;
      grid.appendChild(card);
    });

    console.log(`✓ Loaded ${querySnapshot.size} resources`);
  } catch (error) {
    console.error('Error loading resources:', error);
    showToast('Error loading resources', 'error');
  }
}

/**
 * Toggle sidebar on mobile
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
  if (overlay) {
    overlay.classList.toggle('hidden');
  }
}

/**
 * Quick sync function
 */
async function quickSync() {
  console.log('Quick sync triggered');
  showToast('Syncing data...', 'info');
  
  // Simulate sync
  await new Promise(r => setTimeout(r, 500));
  
  // Reload current view
  const currentView = Array.from(document.querySelectorAll('.view-content'))
    .find(el => !el.classList.contains('hidden'));
  
  if (currentView?.id === 'view-dashboard') loadDashboardData();
  else if (currentView?.id === 'view-attendance') loadAttendanceData();
  else if (currentView?.id === 'view-schedule') loadScheduleData();
  
  showToast('Data synced successfully', 'success');
}

/**
 * Open admin scope modal
 */
function openAdminScopeModal() {
  console.log('Opening admin scope modal');
  const modal = document.getElementById('adminScopeModal');
  if (modal) {
    modal.classList.remove('hidden');
    console.log('✓ Scope modal opened');
  }
}

/**
 * Close admin scope modal
 */
function closeAdminScopeModal() {
  console.log('Closing admin scope modal');
  const modal = document.getElementById('adminScopeModal');
  if (modal) {
    modal.classList.add('hidden');
    console.log('✓ Scope modal closed');
  }
}

/**
 * Save admin scope
 */
function saveAdminScope() {
  try {
    const depts = Array.from(document.getElementById('adminScopeDepts')?.selectedOptions || []).map(o => o.value);
    const sections = Array.from(document.getElementById('adminScopeSections')?.selectedOptions || []).map(o => o.value);
    const sems = Array.from(document.getElementById('adminScopeSems')?.selectedOptions || []).map(o => o.value);
    
    // Save to session
    sessionStorage.adminScope = JSON.stringify({
      depts: depts.length > 0 ? depts : ['ALL'],
      sections: sections.length > 0 ? sections : ['ALL'],
      sems: sems.length > 0 ? sems : ['ALL']
    });
    
    console.log('✓ Admin scope saved:', sessionStorage.adminScope);
    showToast(`✓ Scope set: Depts=${depts.length > 0 ? depts.join(',') : 'ALL'} | Sections=${sections.length > 0 ? sections.join(',') : 'ALL'} | Sems=${sems.length > 0 ? sems.join(',') : 'ALL'}`, 'success');
    
    closeAdminScopeModal();
  } catch (error) {
    console.error('Error saving scope:', error);
    showToast('Error saving scope', 'error');
  }
}

/**
 * Get current admin scope
 */
function getAdminScope() {
  try {
    const scope = JSON.parse(sessionStorage.adminScope || JSON.stringify({ depts: ['ALL'], sections: ['ALL'], sems: ['ALL'] }));
    return scope;
  } catch (error) {
    return { depts: ['ALL'], sections: ['ALL'], sems: ['ALL'] };
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (messagesUnsubscriber) {
    messagesUnsubscriber();
  }
});

// ============== UPLOAD FUNCTIONS (Placeholders) ==============

/**
 * Upload timetable from Excel file
 */
async function uploadTimetableExcel() {
  try {
    const fileInput = document.getElementById('timetableExcelInput');
    const file = fileInput?.files?.[0];
    
    if (!file) {
      showToast('Please select an Excel file', 'error');
      return;
    }

    showToast('⏳ Processing Excel file...', 'info');
    
    // Read the file
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          showToast('Excel file is empty', 'error');
          return;
        }

        // Validate and upload each row
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            // Validate required fields
            const day = row['Day'] || row['day'] || row['DAY'];
            const time = row['Time'] || row['time'] || row['TIME'];
            const subject = row['Subject'] || row['subject'] || row['SUBJECT'];
            const room = row['Room'] || row['room'] || row['ROOM'];

            if (!day || !time || !subject || !room) {
              errorCount++;
              errors.push(`Row ${i + 2}: Missing required fields (Day, Time, Subject, Room)`);
              continue;
            }

            // Prepare entry
            const entry = {
              day: String(day).trim(),
              time: String(time).trim(),
              subject: String(subject).trim(),
              room: String(room).trim(),
              faculty: String(row['Faculty'] || row['faculty'] || row['FACULTY'] || 'TBD').trim(),
              resource: String(row['Resource'] || row['resource'] || row['RESOURCE'] || '').trim(),
              dept: String(row['Dept'] || row['dept'] || row['DEPT'] || 'ALL').trim(),
              section: String(row['Section'] || row['section'] || row['SECTION'] || 'ALL').trim(),
              semester: parseInt(row['Semester'] || row['semester'] || row['SEMESTER'] || 0),
              createdAt: serverTimestamp(),
              createdBy: currentUser?.email || 'admin'
            };

            // Upload to Firestore
            await addDoc(collection(db, 'timetable'), entry);
            successCount++;
            console.log(`✓ Row ${i + 2}: ${subject} - ${time} uploaded`);
          } catch (rowError) {
            errorCount++;
            errors.push(`Row ${i + 2}: ${rowError.message}`);
          }
        }

        // Show results
        let message = `✓ Uploaded ${successCount} timetable entries`;
        if (errorCount > 0) {
          message += ` | ❌ ${errorCount} failed`;
          console.error('Errors:', errors);
        }
        
        showToast(message, successCount > 0 ? 'success' : 'error');
        
        // Reload timetable
        if (successCount > 0) {
          loadAllTimetable();
        }
        
        // Clear file input
        fileInput.value = '';
      } catch (error) {
        console.error('Error parsing Excel:', error);
        showToast('Error reading Excel file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error in uploadTimetableExcel:', error);
    showToast('Error uploading timetable: ' + error.message, 'error');
  }
}

/**
 * Upload announcements from Excel
 */
async function uploadAnnouncementsExcel() {
  try {
    const fileInput = document.getElementById('announcementExcelInput');
    if (!fileInput) {
      showToast('File input element not found', 'error');
      return;
    }
    
    const file = fileInput?.files?.[0];
    
    if (!file) {
      showToast('Please select an Excel file', 'error');
      return;
    }

    showToast('⏳ Processing Excel file...', 'info');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          showToast('Excel file is empty', 'error');
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const title = row['Title'] || row['title'] || row['TITLE'];
            const body = row['Body'] || row['body'] || row['BODY'] || row['Content'] || row['content'];

            if (!title || !body) {
              errorCount++;
              console.warn(`Row ${i + 2}: Missing Title or Body`);
              continue;
            }

            const announcement = {
              title: String(title).trim(),
              body: String(body).trim(),
              priority: String(row['Priority'] || row['priority'] || 'normal').toLowerCase(),
              image: String(row['Image'] || row['image'] || '').trim(),
              createdAt: serverTimestamp(),
              createdBy: currentUser?.email || 'admin'
            };

            await addDoc(collection(db, 'announcements'), announcement);
            successCount++;
            console.log(`✓ Row ${i + 2}: ${title} uploaded`);
          } catch (rowError) {
            errorCount++;
            console.error(`Row ${i + 2} error:`, rowError);
          }
        }

        let message = `✓ Uploaded ${successCount} announcements`;
        if (errorCount > 0) message += ` | ❌ ${errorCount} failed`;
        
        showToast(message, successCount > 0 ? 'success' : 'error');
        
        if (successCount > 0) {
          loadAllAnnouncements();
        }
        
        fileInput.value = '';
      } catch (error) {
        console.error('Error parsing Excel:', error);
        showToast('Error reading Excel file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error in uploadAnnouncementsExcel:', error);
    showToast('Error uploading announcements: ' + error.message, 'error');
  }
}

/**
 * Upload attendance from Excel
 */
async function uploadAttendanceExcel() {
  try {
    const fileInput = document.getElementById('attendanceExcelInput');
    if (!fileInput) {
      showToast('File input element not found', 'error');
      return;
    }
    
    const file = fileInput?.files?.[0];
    
    if (!file) {
      showToast('Please select an Excel file', 'error');
      return;
    }

    showToast('⏳ Processing Excel file...', 'info');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          showToast('Excel file is empty', 'error');
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          try {
            const email = row['Email'] || row['email'] || row['EMAIL'];
            const date = row['Date'] || row['date'] || row['DATE'];
            const subject = row['Subject'] || row['subject'] || row['SUBJECT'];
            const status = row['Status'] || row['status'] || row['STATUS'];

            if (!email || !date || !subject || !status) {
              errorCount++;
              console.warn(`Row ${i + 2}: Missing required fields`);
              continue;
            }

            const attendance = {
              email: String(email).toLowerCase().trim(),
              date: String(date).trim(),
              subject: String(subject).trim(),
              status: String(status).toLowerCase(),
              createdAt: serverTimestamp(),
              recordedBy: currentUser?.email || 'admin'
            };

            await addDoc(collection(db, 'attendance'), attendance);
            successCount++;
            console.log(`✓ Row ${i + 2}: ${email} - ${subject} uploaded`);
          } catch (rowError) {
            errorCount++;
            console.error(`Row ${i + 2} error:`, rowError);
          }
        }

        let message = `✓ Uploaded ${successCount} attendance records`;
        if (errorCount > 0) message += ` | ❌ ${errorCount} failed`;
        
        showToast(message, successCount > 0 ? 'success' : 'error');
        
        if (successCount > 0) {
          loadAllAttendance();
        }
        
        fileInput.value = '';
      } catch (error) {
        console.error('Error parsing Excel:', error);
        showToast('Error reading Excel file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error in uploadAttendanceExcel:', error);
    showToast('Error uploading attendance: ' + error.message, 'error');
  }
}

/**
 * Load all attendance records
 */
async function loadAllAttendance() {
  try {
    const container = document.getElementById('attendanceManagementBody');
    if (!container) return;
    
    // Show loading
    container.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center"><i class="fas fa-spinner fa-spin text-blue-400 mr-2"></i>Loading attendance records...</td></tr>';
    
    // Fetch attendance (max 100, most recent first)
    const querySnapshot = await getDocs(
      query(collection(db, 'attendance'),
        orderBy('createdAt', 'desc'),
        limit(100))
    );
    
    container.innerHTML = '';
    
    if (querySnapshot.empty) {
      container.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">No attendance records</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.className = 'border-t border-gray-100 hover:bg-gray-50';
      
      const statusColor = data.status?.toLowerCase() === 'present' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700';
      
      row.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.email)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${data.date}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHtml(data.subject)}</td>
        <td class="px-4 py-3 text-sm">
          <span class="px-3 py-1 ${statusColor} rounded-full text-xs font-semibold uppercase">
            ${data.status}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600">${escapeHtml(data.recordedBy || 'Admin')}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${new Date(data.createdAt?.seconds * 1000).toLocaleDateString()}</td>
        <td class="px-4 py-3 text-sm">
          <button onclick="deleteAttendanceRecord('${doc.id}')" class="text-red-500 hover:text-red-700 text-xs">Delete</button>
        </td>
      `;
      container.appendChild(row);
    });

    console.log(`✓ Loaded ${querySnapshot.size} attendance records`);
    showToast(`✓ ${querySnapshot.size} attendance records loaded`, 'success');
  } catch (error) {
    console.error('Error loading attendance:', error);
    showToast('Error loading attendance', 'error');
  }
}

/**
 * Delete attendance record
 */
async function deleteAttendanceRecord(docId) {
  try {
    await deleteDoc(doc(db, 'attendance', docId));
    showToast('✓ Record deleted', 'success');
    loadAllAttendance();
  } catch (error) {
    console.error('Error deleting record:', error);
    showToast('Error deleting record', 'error');
  }
}

// ============== MAKE FUNCTIONS GLOBALLY ACCESSIBLE ==============
// This allows HTML onclick attributes to work
window.login = login;
window.logout = logout;
window.handleLoginKeypress = handleLoginKeypress;
window.toggleChatbox = toggleChatbox;
window.loadUserChats = loadUserChats;
window.openChat = openChat;
window.sendChatMessage = sendChatMessage;
window.handleChatKeypress = handleChatKeypress;
window.switchView = switchView;
window.toggleSidebar = toggleSidebar;
window.quickSync = quickSync;
window.openAdminScopeModal = openAdminScopeModal;
window.createTimetableEntry = createTimetableEntry;
window.loadAllTimetable = loadAllTimetable;
window.deleteTimetableEntry = deleteTimetableEntry;
window.createAnnouncement = createAnnouncement;
window.loadAllAnnouncements = loadAllAnnouncements;
window.deleteAnnouncement = deleteAnnouncement;
window.uploadTimetableExcel = uploadTimetableExcel;
window.uploadAnnouncementsExcel = uploadAnnouncementsExcel;
window.uploadAttendanceExcel = uploadAttendanceExcel;
window.loadAllAttendance = loadAllAttendance;
window.openAdminScopeModal = openAdminScopeModal;
window.closeAdminScopeModal = closeAdminScopeModal;
window.saveAdminScope = saveAdminScope;
window.getAdminScope = getAdminScope;

// ============== EXPORTS ==============
export {
  login,
  logout,
  handleLoginKeypress,
  toggleChatbox,
  loadUserChats,
  openChat,
  sendChatMessage,
  handleChatKeypress,
  switchView,
  toggleSidebar,
  quickSync,
  openAdminScopeModal,
  closeAdminScopeModal,
  saveAdminScope,
  getAdminScope,
  createTimetableEntry,
  loadAllTimetable,
  deleteTimetableEntry,
  createAnnouncement,
  loadAllAnnouncements,
  deleteAnnouncement
};
