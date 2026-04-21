/**
 * Script.js Integration Template
 * 
 * This shows how to integrate firebase-chat-operations.js into your existing script.js
 * Copy the relevant parts into your main script file.
 */

// ============================================================
// 1. AT THE TOP OF script.js - ADD IMPORTS
// ============================================================

import { db, auth, app } from './firebase.js';
import {
  initializeUserSession,
  createChat,
  getUserChats,
  getChat,
  addMessage,
  onMessagesUpdate,
  editMessage,
  deleteMessage,
  getMessages,
  getChatStats
} from './firebase-chat-operations.js';

// ============================================================
// 2. GLOBAL STATE - Track current user and chat
// ============================================================

let currentUser = null;
let currentChatId = null;
let messagesUnsubscriber = null;

// ============================================================
// 3. LOGIN / AUTHENTICATION SECTION
// ============================================================

/**
 * Handle user login
 * Call this when user submits login form
 */
async function handleUserLogin(email, displayName) {
  try {
    // Initialize user in Firestore
    const userProfile = await initializeUserSession(email, displayName);
    
    // Store user context
    currentUser = {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role
    };
    
    console.log('✓ User logged in:', currentUser);
    
    // Show chat interface
    switchView('chat');
    
    // Load user's chats
    await loadUserChats();
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
}

// Update your login button handler
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('emailInput')?.value;
  const name = document.getElementById('nameInput')?.value;
  
  if (!email || !name) {
    alert('Please enter email and name');
    return;
  }
  
  await handleUserLogin(email, name);
});

// ============================================================
// 4. CHAT LIST SECTION
// ============================================================

/**
 * Load and display all user chats
 */
async function loadUserChats() {
  try {
    if (!currentUser) throw new Error('User not logged in');
    
    const chats = await getUserChats(currentUser.email);
    
    const chatListContainer = document.getElementById('chatList');
    if (!chatListContainer) {
      console.warn('Chat list container not found in HTML');
      return;
    }
    
    chatListContainer.innerHTML = '';
    
    if (chats.length === 0) {
      chatListContainer.innerHTML = '<p class="empty-state">No chats yet. Create one!</p>';
      return;
    }
    
    chats.forEach(chat => {
      const chatItem = document.createElement('div');
      chatItem.className = 'chat-list-item';
      chatItem.innerHTML = `
        <div class="chat-item-header">
          <h4>${escapeHtml(chat.title)}</h4>
        </div>
        <div class="chat-item-preview">
          <p>${escapeHtml(chat.lastMessage || 'No messages yet')}</p>
        </div>
        <div class="chat-item-footer">
          <small>${formatDate(chat.lastMessageTime?.toDate?.())}</small>
        </div>
      `;
      chatItem.onclick = () => openChat(chat.id);
      chatListContainer.appendChild(chatItem);
    });
    
    console.log(`✓ Loaded ${chats.length} chats`);
    
  } catch (error) {
    console.error('Error loading chats:', error);
    alert('Could not load chats');
  }
}

/**
 * Create new chat
 */
async function createNewChat() {
  try {
    if (!currentUser) throw new Error('User not logged in');
    
    const title = prompt('Enter chat title:');
    if (!title || !title.trim()) return;
    
    const chatId = await createChat(currentUser.email, title.trim());
    console.log('✓ Chat created:', chatId);
    
    // Reload chat list
    await loadUserChats();
    
    // Open the new chat
    openChat(chatId);
    
  } catch (error) {
    console.error('Error creating chat:', error);
    alert('Could not create chat');
  }
}

// Wire up create chat button
document.getElementById('newChatBtn')?.addEventListener('click', createNewChat);

// ============================================================
// 5. CHAT VIEW SECTION
// ============================================================

/**
 * Open a specific chat and listen to messages in real-time
 */
async function openChat(chatId) {
  try {
    if (!currentUser) throw new Error('User not logged in');
    
    // Clean up previous listener
    if (messagesUnsubscriber) {
      messagesUnsubscriber();
    }
    
    currentChatId = chatId;
    
    // Get chat details
    const chat = await getChat(currentUser.email, chatId);
    if (!chat) {
      alert('Chat not found');
      return;
    }
    
    // Update UI with chat title
    const chatTitle = document.getElementById('chatTitle');
    if (chatTitle) {
      chatTitle.textContent = chat.title;
    }
    
    // Set up real-time listener for messages
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
    alert('Could not open chat');
  }
}

/**
 * Render messages in the UI
 * Called automatically by real-time listener
 */
function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  if (!container) {
    console.warn('Messages container not found in HTML');
    return;
  }
  
  container.innerHTML = '';
  
  messages.forEach(msg => {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${msg.sender}`;
    messageEl.innerHTML = `
      <div class="message-bubble">
        <span class="sender-badge">${msg.sender === 'user' ? 'You' : 'Bot'}</span>
        <p class="message-text">${escapeHtml(msg.text)}</p>
        <time class="message-time">${formatTime(msg.timestamp)}</time>
        ${msg.edited ? '<span class="edited-badge">(edited)</span>' : ''}
      </div>
      ${msg.sender === 'user' ? `
        <div class="message-actions">
          <button onclick="editMsg('${msg.id}')" title="Edit">✎</button>
          <button onclick="deleteMsg('${msg.id}')" title="Delete">✕</button>
        </div>
      ` : ''}
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
      alert('Please open a chat first');
      return;
    }
    
    const input = document.getElementById('messageInput');
    const text = input?.value?.trim();
    
    if (!text) {
      alert('Message cannot be empty');
      return;
    }
    
    // Add user message
    await addMessage(currentUser.email, currentChatId, 'user', text);
    console.log('✓ Message sent');
    
    // Clear input
    if (input) input.value = '';
    
    // Get bot response (this is where you integrate with your chatbot API)
    const botResponse = await getBotResponse(text);
    
    // Add bot message
    await addMessage(currentUser.email, currentChatId, 'bot', botResponse);
    
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Could not send message');
  }
}

/**
 * Get bot response - REPLACE WITH YOUR API
 * This should call your backend or Groq API
 */
async function getBotResponse(userMessage) {
  try {
    // TODO: Replace this with actual API call
    // Example with fetch to your backend:
    // const response = await fetch('/api/chat/respond', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message: userMessage, email: currentUser.email })
    // });
    // const data = await response.json();
    // return data.reply;
    
    // For now, return a placeholder
    return `I received: "${userMessage}". [This is a placeholder - integrate your API here]`;
  } catch (error) {
    console.error('Error getting bot response:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

/**
 * Edit message
 */
async function editMsg(messageId) {
  try {
    if (!currentUser || !currentChatId) return;
    
    const newText = prompt('Edit message:');
    if (!newText || !newText.trim()) return;
    
    await editMessage(currentUser.email, currentChatId, messageId, newText.trim());
    console.log('✓ Message edited');
    // Real-time listener automatically updates UI
    
  } catch (error) {
    console.error('Error editing message:', error);
    alert('Could not edit message');
  }
}

/**
 * Delete message
 */
async function deleteMsg(messageId) {
  try {
    if (!currentUser || !currentChatId) return;
    
    if (!confirm('Delete this message?')) return;
    
    await deleteMessage(currentUser.email, currentChatId, messageId);
    console.log('✓ Message deleted');
    // Real-time listener automatically updates UI
    
  } catch (error) {
    console.error('Error deleting message:', error);
    alert('Could not delete message');
  }
}

// Wire up send button and Enter key
document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ============================================================
// 6. CLEANUP / LOGOUT
// ============================================================

/**
 * Clean up when user leaves or logs out
 */
function handleLogout() {
  try {
    // Clean up real-time listener
    if (messagesUnsubscriber) {
      messagesUnsubscriber();
      messagesUnsubscriber = null;
    }
    
    // Clear state
    currentUser = null;
    currentChatId = null;
    
    // Show login screen
    switchView('login');
    
    console.log('✓ User logged out');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Wire up logout button
document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
  if (messagesUnsubscriber) {
    messagesUnsubscriber();
  }
});

// ============================================================
// 7. HELPER FUNCTIONS
// ============================================================

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
 * Switch view (login, chat, etc)
 */
function switchView(viewName) {
  document.querySelectorAll('[class*="-view"]').forEach(el => {
    el.style.display = 'none';
  });
  const view = document.getElementById(`${viewName}-view`);
  if (view) view.style.display = 'block';
}

// ============================================================
// 8. REQUIRED HTML STRUCTURE
// ============================================================

/*
You need these HTML elements in your index.html:

<div id="login-view" class="view">
  <h2>Login</h2>
  <input type="email" id="emailInput" placeholder="Email">
  <input type="text" id="nameInput" placeholder="Full Name">
  <button id="loginBtn">Login</button>
</div>

<div id="chat-view" class="view" style="display: none;">
  <!-- Sidebar -->
  <div class="sidebar">
    <button id="newChatBtn">+ New Chat</button>
    <div id="chatList" class="chat-list"></div>
  </div>
  
  <!-- Main chat area -->
  <div class="main-chat-area">
    <div class="chat-header">
      <h2 id="chatTitle">Select a chat</h2>
      <button id="logoutBtn">Logout</button>
    </div>
    
    <div id="messagesContainer" class="messages"></div>
    
    <div class="input-area">
      <input 
        type="text" 
        id="messageInput" 
        placeholder="Type your message..."
      >
      <button id="sendBtn">Send</button>
    </div>
  </div>
</div>

CSS:
.sidebar { width: 250px; border-right: 1px solid #ddd; }
.chat-list { overflow-y: auto; }
.chat-list-item { padding: 15px; cursor: pointer; border-bottom: 1px solid #eee; }
.chat-list-item:hover { background: #f5f5f5; }
.message { margin: 10px 0; padding: 10px; border-radius: 8px; }
.message-user { background: #c8e6c9; }
.message-bot { background: #e3f2fd; }
*/

// ============================================================
// INTEGRATION CHECKLIST
// ============================================================

/*
✅ Steps to integrate into your project:

1. Update your HTML with the structure above
2. Copy all functions from this file into script.js
3. Make sure script.js has type="module"
4. Import firebase-chat-operations.js at the top
5. Test login with: handleUserLogin('test@college.edu', 'Test User')
6. Update getBotResponse() to call your actual chatbot API
7. Test creating chats and sending messages
8. Deploy security rules (already done ✅)
9. Monitor browser console for errors
10. Deploy to Firebase Hosting when ready

IMPORTANT:
- Replace getBotResponse() with your actual API
- Keep messagesUnsubscriber cleanup to prevent memory leaks
- Always use try-catch for error handling
- Test thoroughly before production
*/

export {
  handleUserLogin,
  loadUserChats,
  createNewChat,
  openChat,
  sendMessage,
  editMsg,
  deleteMsg,
  handleLogout
};
