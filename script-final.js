/**
 * Student Management Portal - Chat Integration
 * Firebase Chat Operations with Login System
 * Updated to match existing HTML element IDs
 */

// ============== IMPORTS ==============
import { db, auth } from './firebase.js';
import {
  initializeUserSession,
  createChat,
  getUserChats,
  addMessage,
  onMessagesUpdate
} from './firebase-chat-operations.js';

// ============== GLOBAL STATE ==============
let currentUser = null;
let currentChatId = null;
let messagesUnsubscriber = null;

// ============== LOGIN FUNCTIONS ==============

/**
 * Handle user login
 */
async function login() {
  try {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value?.trim();

    if (!email) {
      showToast('Please enter email', 'error');
      return;
    }

    console.log('🔐 Logging in:', email);

    // Extract name from email (for demo purposes)
    const name = email.split('@')[0];

    // Initialize user session
    const userProfile = await initializeUserSession(email, name);

    currentUser = {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role
    };

    console.log('✓ User logged in:', currentUser);
    showToast(`Welcome, ${currentUser.name}!`, 'success');

    // Hide login, show dashboard
    const loginSection = document.getElementById('loginSection');
    const mainDashboard = document.getElementById('mainDashboard');
    if (loginSection) loginSection.classList.add('hidden');
    if (mainDashboard) mainDashboard.classList.remove('hidden');

    // Show chat widget
    const chatWidget = document.getElementById('chatWidget');
    if (chatWidget) chatWidget.classList.remove('hidden');

    // Load user's chats
    await loadUserChats();
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed: ' + error.message, 'error');
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

document.addEventListener('DOMContentLoaded', () => {
  // Login button
  document.getElementById('loginButton')?.addEventListener('click', login);

  // Login Enter key
  document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
  });

  // Chat send button
  document.getElementById('chatSendBtn')?.addEventListener('click', sendChatMessage);

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  console.log('✓ Chat system initialized');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (messagesUnsubscriber) {
    messagesUnsubscriber();
  }
});

// ============== EXPORTS ==============
export {
  login,
  logout,
  handleLoginKeypress,
  toggleChatbox,
  loadUserChats,
  openChat,
  sendChatMessage,
  handleChatKeypress
};
