/**
 * Firebase Chat Operations - Usage Examples
 * 
 * This file demonstrates how to use the firebase-chat-operations.js module
 * in your application with real-world scenarios.
 */

import {
  initializeUserSession,
  createChat,
  getUserChats,
  getMessages,
  addMessage,
  onMessagesUpdate,
  editMessage,
  deleteMessage,
  getChatStats,
  exportChatData
} from './firebase-chat-operations.js';

// ========== EXAMPLE 1: Initialize User Session ==========
// Call this after successful login

async function handleUserLogin(email, name) {
  try {
    const userProfile = await initializeUserSession(email, name);
    console.log('User logged in:', userProfile);
    // Navigate to dashboard
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Usage: handleUserLogin('student@college.edu', 'John Doe');

// ========== EXAMPLE 2: Create and List Chats ==========

async function loadUserChats(userEmail) {
  try {
    const chats = await getUserChats(userEmail);
    console.log('User chats:', chats);

    // Display chats in UI
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    for (const chat of chats) {
      const chatItem = document.createElement('div');
      chatItem.className = 'chat-item';
      chatItem.innerHTML = `
        <h3>${chat.title}</h3>
        <p>${chat.lastMessage || 'No messages yet'}</p>
        <small>${new Date(chat.lastMessageTime?.toDate?.()).toLocaleString()}</small>
      `;
      chatItem.onclick = () => openChat(userEmail, chat.id);
      chatList.appendChild(chatItem);
    }
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

// Usage: loadUserChats('student@college.edu');

// ========== EXAMPLE 3: Create New Chat ==========

async function createNewChat(userEmail) {
  try {
    const title = prompt('Enter chat title:');
    if (!title) return;

    const chatId = await createChat(userEmail, title);
    console.log('New chat created:', chatId);

    // Reload chat list
    await loadUserChats(userEmail);
  } catch (error) {
    console.error('Error creating chat:', error);
  }
}

// Usage: createNewChat('student@college.edu');

// ========== EXAMPLE 4: Send and Receive Messages (Most Important) ==========

let currentUserEmail = 'student@college.edu';
let currentChatId = null;
let messagesUnsubscribe = null;

async function openChat(userEmail, chatId) {
  try {
    // Store current chat context
    currentUserEmail = userEmail;
    currentChatId = chatId;

    // Stop previous listener if any
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
    }

    // Get initial messages
    const initialMessages = await getMessages(userEmail, chatId, 50);
    displayMessages(initialMessages);

    // Set up real-time listener for new messages
    messagesUnsubscribe = onMessagesUpdate(userEmail, chatId, (messages) => {
      displayMessages(messages);
    });

    console.log(`Opened chat: ${chatId}`);
  } catch (error) {
    console.error('Error opening chat:', error);
  }
}

// Display messages in the UI
function displayMessages(messages) {
  const messageContainer = document.getElementById('messagesContainer');
  messageContainer.innerHTML = '';

  for (const msg of messages) {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${msg.sender}`;
    messageEl.innerHTML = `
      <div class="message-inner">
        <span class="sender">${msg.sender === 'user' ? 'You' : 'Bot'}</span>
        <p>${msg.text}</p>
        <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
        ${msg.edited ? '<small class="edited">(edited)</small>' : ''}
      </div>
      <div class="message-actions">
        ${msg.sender === 'user' ? `
          <button onclick="editMsg('${msg.id}')">Edit</button>
          <button onclick="deleteMsg('${msg.id}')">Delete</button>
        ` : ''}
      </div>
    `;
    messageContainer.appendChild(messageEl);
  }

  // Scroll to bottom
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// ========== EXAMPLE 5: Send User Message ==========

async function sendMessage(text) {
  try {
    if (!text.trim()) {
      alert('Message cannot be empty');
      return;
    }

    if (!currentChatId) {
      alert('Please open a chat first');
      return;
    }

    // Add user message
    const userMsgId = await addMessage(currentUserEmail, currentChatId, 'user', text);
    console.log('User message sent:', userMsgId);

    // Clear input
    document.getElementById('messageInput').value = '';

    // Simulate bot response (replace with actual API call)
    setTimeout(async () => {
      const botResponse = await getBotResponse(text);
      await addMessage(currentUserEmail, currentChatId, 'bot', botResponse);
    }, 1000);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Simulate bot response (integrate with your API here)
async function getBotResponse(userMessage) {
  // TODO: Replace with actual API call to Groq or your chatbot backend
  return `I received your message: "${userMessage}". This is a bot response.`;
}

// Usage: sendMessage('Hello, how are you?');

// ========== EXAMPLE 6: Edit Message ==========

async function editMsg(messageId) {
  try {
    const newText = prompt('Edit message:');
    if (!newText) return;

    await editMessage(currentUserEmail, currentChatId, messageId, newText);
    console.log('Message edited');
    // Real-time listener will automatically update the UI
  } catch (error) {
    console.error('Error editing message:', error);
  }
}

// ========== EXAMPLE 7: Delete Message ==========

async function deleteMsg(messageId) {
  try {
    if (!confirm('Delete this message?')) return;

    await deleteMessage(currentUserEmail, currentChatId, messageId);
    console.log('Message deleted');
    // Real-time listener will automatically update the UI
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}

// ========== EXAMPLE 8: Get Chat Statistics ==========

async function showChatStats(userEmail, chatId) {
  try {
    const stats = await getChatStats(userEmail, chatId);
    console.log('Chat Statistics:', stats);

    alert(`
      Total Messages: ${stats.totalMessages}
      User Messages: ${stats.userMessages}
      Bot Messages: ${stats.botMessages}
    `);
  } catch (error) {
    console.error('Error getting chat stats:', error);
  }
}

// Usage: showChatStats('student@college.edu', 'chat-id-here');

// ========== EXAMPLE 9: Export Data ==========

async function exportUserData(userEmail) {
  try {
    const data = await exportChatData(userEmail);
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    console.log('Data exported successfully');
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

// Usage: exportUserData('student@college.edu');

// ========== EXAMPLE 10: HTML Template Integration ==========

/*
<div class="chat-interface">
  <!-- Chat List Sidebar -->
  <div class="sidebar">
    <button onclick="createNewChat('student@college.edu')">+ New Chat</button>
    <div id="chatList"></div>
  </div>

  <!-- Chat View -->
  <div class="main-chat">
    <!-- Messages Container -->
    <div id="messagesContainer" class="messages"></div>

    <!-- Message Input -->
    <div class="input-area">
      <input 
        type="text" 
        id="messageInput" 
        placeholder="Type your message..." 
        onkeypress="event.key === 'Enter' && sendMessage(this.value)"
      />
      <button onclick="sendMessage(document.getElementById('messageInput').value)">
        Send
      </button>
    </div>
  </div>
</div>

<style>
  .chat-interface {
    display: flex;
    height: 100vh;
  }

  .sidebar {
    width: 250px;
    border-right: 1px solid #ddd;
    padding: 10px;
    overflow-y: auto;
  }

  .chat-item {
    padding: 10px;
    margin: 5px 0;
    border-radius: 5px;
    cursor: pointer;
    background-color: #f0f0f0;
  }

  .chat-item:hover {
    background-color: #e0e0e0;
  }

  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
  }

  .message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
  }

  .message-bot {
    background-color: #e3f2fd;
    align-self: flex-start;
  }

  .message-user {
    background-color: #c8e6c9;
    align-self: flex-end;
    text-align: right;
  }

  .input-area {
    padding: 15px;
    border-top: 1px solid #ddd;
    display: flex;
    gap: 10px;
  }

  .input-area input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .input-area button {
    padding: 10px 20px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .input-area button:hover {
    background-color: #1976D2;
  }

  .edited {
    color: #999;
    font-size: 0.8em;
  }
</style>
*/

// ========== SETUP INSTRUCTIONS ==========

/*
1. Import in your main script.js:
   import * as chatOps from './firebase-chat-operations.js';

2. Initialize when user logs in:
   await chatOps.initializeUserSession(email, name);

3. Load chats on dashboard:
   await chatOps.getUserChats(userEmail);

4. Listen to messages in real-time:
   const unsubscribe = chatOps.onMessagesUpdate(userEmail, chatId, (messages) => {
     // Update UI with new messages
   });

5. Clean up listener when leaving chat:
   unsubscribe();
*/

export {
  handleUserLogin,
  loadUserChats,
  createNewChat,
  openChat,
  displayMessages,
  sendMessage,
  getBotResponse,
  editMsg,
  deleteMsg,
  showChatStats,
  exportUserData
};
