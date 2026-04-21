/**
 * Student Management Portal - FastAPI Backend Integration
 * Simple working version for login and dashboard
 */

console.log('🚀 Script.js loading...');

// ============== API CONFIGURATION ==============
const API_BASE = window.location.origin;
console.log('📍 API BASE:', API_BASE);

// ============== GLOBAL STATE ==============
let currentUser = null;

// ============== UTILITY FUNCTION ==============
function showToast(message, type = 'info') {
  console.log(`[${type.toUpperCase()}]`, message);
  
  const toast = document.createElement('div');
  const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6';
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    background-color: ${bgColor};
    color: white;
    border-radius: 8px;
    z-index: 9999;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// ============== AUTHENTICATION ==============

async function login() {
  console.log('🔐 LOGIN CLICKED');
  
  try {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
      showToast('Form elements not found', 'error');
      return;
    }
    
    const email = emailInput.value?.trim();
    const password = passwordInput.value?.trim();

    console.log('📝 Form values - Email:', email);

    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }

    const loginUrl = `${API_BASE}/login`;
    console.log(`🔐 Sending to: ${loginUrl}`);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    console.log('📤 Response status:', response.status);
    
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      showToast(data.detail || 'Login failed', 'error');
      return;
    }

    // Success!
    currentUser = data;
    console.log('✅ Login successful:', currentUser);
    
    showToast(`Welcome ${currentUser.name}!`, 'success');

    // Clear password
    passwordInput.value = '';

    // Update UI
    updateUIAfterLogin();
    
  } catch (error) {
    console.error('❌ Error:', error);
    showToast('Login error: ' + error.message, 'error');
  }
}

function updateUIAfterLogin() {
  // Hide login section
  const loginSection = document.getElementById('loginSection');
  if (loginSection) loginSection.classList.add('hidden');
  
  // Show dashboard
  const mainDashboard = document.getElementById('mainDashboard');
  if (mainDashboard) mainDashboard.classList.remove('hidden');
  
  // Update user name in sidebar
  const sidebarUserName = document.getElementById('sidebarUserName');
  if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
  
  const sidebarUserRole = document.getElementById('sidebarUserRole');
  if (sidebarUserRole) sidebarUserRole.textContent = currentUser.role;
  
  // Show admin section if admin
  const adminSection = document.getElementById('adminSection');
  if (adminSection) {
    if (currentUser.role === 'ADMIN') {
      adminSection.classList.remove('hidden');
    } else {
      adminSection.classList.add('hidden');
    }
  }

  console.log('✅ UI updated');
}

function logout() {
  console.log('🚪 Logout clicked');
  currentUser = null;
  
  // Clear inputs
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  
  // Show login
  const loginSection = document.getElementById('loginSection');
  if (loginSection) loginSection.classList.remove('hidden');
  
  // Hide dashboard
  const mainDashboard = document.getElementById('mainDashboard');
  if (mainDashboard) mainDashboard.classList.add('hidden');
  
  showToast('Logged out', 'success');
}

function handleLoginKeypress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

// ============== PAGE LOAD ==============
console.log('✅ Script.js loaded successfully');
