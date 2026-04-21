/**
 * Student Management Portal - Chat Integration
 * Firebase Chat Operations with Login System
 */

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

    if (!email || !password) {
      showToast('Please enter email and password', 'error');
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
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainDashboard').classList.remove('hidden');

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
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('mainDashboard').classList.add('hidden');

    // Clear form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    console.log('✓ User logged out');
    showToast('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============== CHAT LIST FUNCTIONS ==============

/**
 * Load and display all user chats
 */
async function loadUserChats() {
  try {
    if (!currentUser) throw new Error('User not logged in');

    const chats = await getUserChats(currentUser.email);

    const chatListContainer = document.getElementById('chatList');
    if (!chatListContainer) {
      console.warn('Chat list container not found');
      return;
    }

    chatListContainer.innerHTML = '';

    if (chats.length === 0) {
      chatListContainer.innerHTML =
        '<div class="p-4 text-center text-gray-500">No chats yet. Create one!</div>';
      return;
    }

    chats.forEach((chat) => {
      const chatItem = document.createElement('div');
      chatItem.className =
        'p-3 mb-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition active:bg-blue-100';
      chatItem.innerHTML = `
        <h4 class="font-semibold text-gray-800">${escapeHtml(chat.title)}</h4>
        <p class="text-sm text-gray-600 truncate">${escapeHtml(
          chat.lastMessage || 'No messages'
        )}</p>
        <small class="text-gray-500">${formatDate(chat.lastMessageTime?.toDate?.())}</small>
      `;
      chatItem.onclick = () => openChat(chat.id);
      chatListContainer.appendChild(chatItem);
    });

    console.log(`✓ Loaded ${chats.length} chats`);
  } catch (error) {
    console.error('Error loading chats:', error);
    showToast('Could not load chats', 'error');
  }
}

/**
 * Create a new chat
 */
async function createNewChat() {
  try {
    if (!currentUser) throw new Error('User not logged in');

    const title = prompt('Enter chat title:');
    if (!title || !title.trim()) return;

    const chatId = await createChat(currentUser.email, title.trim());
    console.log('✓ Chat created:', chatId);

    // Reload and open
    await loadUserChats();
    openChat(chatId);
  } catch (error) {
    console.error('Error creating chat:', error);
    showToast('Could not create chat', 'error');
  }
}

// ============== CHAT VIEW FUNCTIONS ==============

/**
 * Open a specific chat with real-time messages
 */
async function openChat(chatId) {
  try {
    if (!currentUser) throw new Error('User not logged in');

    // Clean up previous listener
    if (messagesUnsubscriber) {
      messagesUnsubscriber();
    }

    currentChatId = chatId;

    // Update UI
    const chatTitle = document.getElementById('chatTitle');
    if (chatTitle) {
      chatTitle.textContent = `Chat: ${chatId.substring(0, 8)}...`;
    }

    // Set up real-time listener
    messagesUnsubscriber = onMessagesUpdate(
      currentUser.email,
      chatId,
      (messages) => {
        renderMessages(messages);
      }
    );

    console.log(`✓ Chat opened: ${chatId}`);
  } catch (error) {
    console.error('Error opening chat:', error);
    showToast('Could not open chat', 'error');
  }
}

/**
 * Render messages in UI
 */
function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) {
    console.warn('Messages container not found');
    return;
  }

  container.innerHTML = '';

  messages.forEach((msg) => {
    const messageEl = document.createElement('div');
    messageEl.className =
      msg.sender === 'user'
        ? 'mb-3 flex justify-end'
        : 'mb-3 flex justify-start';

    messageEl.innerHTML = `
      <div class="${
        msg.sender === 'user'
          ? 'bg-blue-500 text-white rounded-lg rounded-br-none'
          : 'bg-gray-200 text-gray-800 rounded-lg rounded-bl-none'
      } max-w-xs px-4 py-2 break-words">
        <p>${escapeHtml(msg.text)}</p>
        <small class="opacity-70 text-xs">${formatTime(msg.timestamp)}</small>
      </div>
    `;
    container.appendChild(messageEl);
  });

  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
}

/**
 * Send a message
 */
async function sendMessage() {
  try {
    if (!currentUser || !currentChatId) {
      showToast('Please open a chat first', 'error');
      return;
    }

    const input = document.getElementById('messageInput');
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
      const botResponse = `Echo: ${text}`;
      await addMessage(currentUser.email, currentChatId, 'bot', botResponse);
    }, 500);
  } catch (error) {
    console.error('Error sending message:', error);
    showToast('Could not send message', 'error');
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
 * Format date for display
 */
function formatDate(date) {
  if (!date) return 'Unknown';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format time for display
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============== EVENT LISTENERS ==============

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Login button
  document.getElementById('loginButton')?.addEventListener('click', login);

  // Create chat button
  document.getElementById('newChatBtn')?.addEventListener('click', createNewChat);

  // Send button
  document.getElementById('sendBtn')?.addEventListener('click', sendMessage);

  // Message input Enter key
  document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  console.log('✓ Event listeners setup complete');
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
  loadUserChats,
  createNewChat,
  openChat,
  sendMessage
};
