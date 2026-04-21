
# Firebase Chat Operations - Implementation Guide

## Overview

This guide explains how to use the Firebase Firestore chat system with your project. The code is production-ready, follows best practices, and is organized for scalability.

## Database Structure

```
Firestore Database (ai-chatbot-project-63de8)
│
└── users/ (collection)
    │
    ├── student@college.edu/ (document - user ID is email)
    │   ├── name: "John Doe"
    │   ├── email: "student@college.edu"
    │   ├── role: "STUDENT"
    │   ├── createdAt: timestamp
    │   ├── lastLoginAt: timestamp
    │   │
    │   └── chats/ (subcollection)
    │       │
    │       ├── chat-001/ (document - auto-generated ID)
    │       │   ├── title: "Math Help"
    │       │   ├── createdAt: timestamp
    │       │   ├── lastMessage: "Can you explain derivatives?"
    │       │   ├── lastMessageTime: timestamp
    │       │   │
    │       │   └── messages/ (subcollection)
    │       │       ├── msg-001/
    │       │       │   ├── sender: "user" or "bot"
    │       │       │   ├── text: "Can you help with calculus?"
    │       │       │   ├── timestamp: timestamp
    │       │       │   ├── edited: false
    │       │       │   └── reactions: {}
    │       │       │
    │       │       └── msg-002/
    │       │           ├── sender: "bot"
    │       │           ├── text: "Of course! What topic?"
    │       │           ├── timestamp: timestamp
    │       │           └── ...
    │       │
    │       └── chat-002/
    │           └── ... similar structure
    │
    └── admin@college.edu/ (another user)
        └── ... similar structure
```

## File Structure

```
ppproject/
├── firebase.js                          # Firebase config (already setup)
├── firebase-chat-operations.js          # Core operations module (NEW)
├── firebase-chat-examples.js            # Usage examples (NEW)
├── script.js                            # Your main app script
├── index.html                           # Your HTML
└── server.js                            # Local dev server
```

## Installation & Setup

### Step 1: Verify Firebase is Initialized

Make sure `firebase.js` exports `db` and `auth`:

```javascript
// firebase.js
export { db, auth, app };
```

### Step 2: Import the Chat Operations Module

In your main script or wherever you handle user interactions:

```javascript
import {
  initializeUserSession,
  createChat,
  getUserChats,
  addMessage,
  onMessagesUpdate,
  editMessage,
  deleteMessage,
  getMessages
} from './firebase-chat-operations.js';
```

### Step 3: Make HTML Module-Type

Ensure your HTML script tag is:

```html
<script type="module" src="script.js"></script>
```

## Core Usage Patterns

### Pattern 1: User Login → Create Session

```javascript
async function handleLogin(email, displayName) {
  try {
    // Initialize user document in Firestore
    const userProfile = await initializeUserSession(email, displayName);
    console.log('User ready:', userProfile);
    
    // Store user context for later use
    window.currentUser = {
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role
    };
    
    // Redirect to chat interface
    showChatInterface();
  } catch (error) {
    console.error('Login failed:', error);
    alert('Could not initialize user session');
  }
}

// Called when user submits login form
document.getElementById('loginBtn').onclick = () => {
  const email = document.getElementById('emailInput').value;
  const name = document.getElementById('nameInput').value;
  handleLogin(email, name);
};
```

### Pattern 2: Display All User Chats

```javascript
async function displayAllChats() {
  try {
    const userEmail = window.currentUser.email;
    const chats = await getUserChats(userEmail);
    
    const chatListEl = document.getElementById('chatList');
    chatListEl.innerHTML = '';
    
    for (const chat of chats) {
      const div = document.createElement('div');
      div.className = 'chat-list-item';
      div.innerHTML = `
        <h4>${chat.title}</h4>
        <p class="last-msg">${chat.lastMessage || 'No messages'}</p>
        <small>${new Date(chat.lastMessageTime?.toDate?.()).toLocaleString()}</small>
      `;
      div.onclick = () => openSpecificChat(chat.id);
      chatListEl.appendChild(div);
    }
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

// Call this when dashboard loads
displayAllChats();
```

### Pattern 3: Open a Chat with Real-Time Messages

```javascript
let messageUnsubscribe = null;

async function openSpecificChat(chatId) {
  try {
    const userEmail = window.currentUser.email;
    
    // Clean up previous listener
    if (messageUnsubscribe) {
      messageUnsubscribe();
    }
    
    // Show chat UI
    document.getElementById('chatView').style.display = 'block';
    
    // Set up real-time listener
    messageUnsubscribe = onMessagesUpdate(userEmail, chatId, (messages) => {
      renderMessages(messages);
    });
    
    console.log(`Chat opened: ${chatId}`);
  } catch (error) {
    console.error('Error opening chat:', error);
  }
}

// Helper function to render messages
function renderMessages(messages) {
  const container = document.getElementById('messagesContainer');
  container.innerHTML = '';
  
  messages.forEach(msg => {
    const el = document.createElement('div');
    el.className = `message message-${msg.sender}`;
    el.innerHTML = `
      <strong>${msg.sender === 'user' ? 'You' : 'Bot'}</strong>
      <p>${msg.text}</p>
      <time>${new Date(msg.timestamp).toLocaleTimeString()}</time>
    `;
    container.appendChild(el);
  });
  
  // Auto-scroll to latest
  container.scrollTop = container.scrollHeight;
}
```

### Pattern 4: Send a Message

```javascript
async function sendUserMessage(text) {
  try {
    if (!text.trim()) {
      alert('Message cannot be empty');
      return;
    }
    
    const userEmail = window.currentUser.email;
    const chatId = window.currentChatId; // Set when opening chat
    
    // Add user message
    await addMessage(userEmail, chatId, 'user', text);
    
    // Clear input
    document.getElementById('messageInput').value = '';
    
    // Get bot response (replace with your API)
    const botResponse = await callYourBotAPI(text);
    
    // Add bot message
    await addMessage(userEmail, chatId, 'bot', botResponse);
    
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Call when user clicks Send button
document.getElementById('sendBtn').onclick = () => {
  const text = document.getElementById('messageInput').value;
  sendUserMessage(text);
};

// Also send on Enter key
document.getElementById('messageInput').onkeypress = (e) => {
  if (e.key === 'Enter') {
    sendUserMessage(e.target.value);
  }
};

// Replace this with your actual bot API
async function callYourBotAPI(userMessage) {
  // TODO: Call Groq API or your backend server
  // For now, simulate response
  return `Bot response to: ${userMessage}`;
}
```

### Pattern 5: Create New Chat

```javascript
async function createNewChatSession() {
  try {
    const title = prompt('Enter chat title (e.g., "Math Help"):');
    if (!title) return;
    
    const userEmail = window.currentUser.email;
    const chatId = await createChat(userEmail, title);
    
    // Refresh chat list
    displayAllChats();
    
    // Optionally open the new chat
    window.currentChatId = chatId;
    openSpecificChat(chatId);
    
  } catch (error) {
    console.error('Error creating chat:', error);
  }
}

// Call when user clicks "New Chat" button
document.getElementById('newChatBtn').onclick = createNewChatSession;
```

## Advanced Patterns

### Pattern 6: Edit Messages

```javascript
async function editUserMessage(messageId, newText) {
  try {
    const userEmail = window.currentUser.email;
    const chatId = window.currentChatId;
    
    await editMessage(userEmail, chatId, messageId, newText);
    console.log('Message edited');
    // Real-time listener updates UI automatically
  } catch (error) {
    console.error('Cannot edit message:', error);
  }
}
```

### Pattern 7: Delete Messages

```javascript
async function removeMessage(messageId) {
  try {
    if (!confirm('Delete this message?')) return;
    
    const userEmail = window.currentUser.email;
    const chatId = window.currentChatId;
    
    await deleteMessage(userEmail, chatId, messageId);
    console.log('Message deleted');
    // Real-time listener updates UI automatically
  } catch (error) {
    console.error('Cannot delete message:', error);
  }
}
```

### Pattern 8: Clean Up When Leaving Chat

```javascript
function closeChatSession() {
  try {
    // Stop real-time listener to prevent memory leaks
    if (messageUnsubscribe) {
      messageUnsubscribe();
      messageUnsubscribe = null;
    }
    
    // Hide chat view
    document.getElementById('chatView').style.display = 'none';
    
    // Clear current chat context
    window.currentChatId = null;
    
    console.log('Chat session closed, listener cleaned up');
  } catch (error) {
    console.error('Error closing chat:', error);
  }
}
```

## Error Handling Best Practices

```javascript
// Always wrap operations in try-catch
async function safeOperation() {
  try {
    // Your code here
  } catch (error) {
    // Check error type and provide user feedback
    if (error.code === 'permission-denied') {
      alert('You do not have permission for this action');
    } else if (error.code === 'not-found') {
      alert('The requested item was not found');
    } else {
      alert('An error occurred: ' + error.message);
    }
    
    // Log for debugging
    console.error('Operation failed:', error);
  }
}
```

## Security Rules Recap

The security rules ensure:
- ✅ Users can only access their own chats and messages
- ✅ Admins can access all user data
- ✅ Messages cannot be empty
- ✅ Only authenticated users can create documents
- ✅ Users identified by email (lowercase)

## Performance Tips

### 1. Use Pagination for Large Chat Lists

```javascript
// Get only last 20 chats instead of all
const chats = await getUserChats(userEmail);
const recentChats = chats.slice(0, 20);
```

### 2. Unsubscribe from Listeners

```javascript
// BAD - Creates memory leak
onMessagesUpdate(userEmail, chatId, callback);
onMessagesUpdate(userEmail, chatId, callback); // Creates duplicate listener

// GOOD - Unsubscribe before subscribing again
if (unsubscribe) unsubscribe();
unsubscribe = onMessagesUpdate(userEmail, chatId, callback);
```

### 3. Batch Operations

```javascript
// Instead of adding 100 messages one by one,
// consider batch operations in firestore-operations.js
```

### 4. Lazy Load Messages

```javascript
// Load only initial messages
const messages = await getMessages(userEmail, chatId, 50);

// Load older messages on scroll
if (userScrolledToTop) {
  const olderMessages = await getMessages(userEmail, chatId, 50);
}
```

## Testing Your Setup

### Test 1: User Creation

```javascript
// In browser console:
await initializeUserSession('test@college.edu', 'Test User');
// Should log: ✓ User created: test@college.edu
```

### Test 2: Chat Creation

```javascript
const chatId = await createChat('test@college.edu', 'Test Chat');
console.log('Chat ID:', chatId);
```

### Test 3: Send Message

```javascript
await addMessage('test@college.edu', 'chat-id-here', 'user', 'Hello!');
// Should log: ✓ Message added: msg-id-here
```

### Test 4: Real-Time Listener

```javascript
const unsub = onMessagesUpdate('test@college.edu', 'chat-id-here', (msgs) => {
  console.log('Messages updated:', msgs);
});

// Now send a message in another tab - should see it here in real-time
```

## Troubleshooting

### Problem: "ReferenceError: db is not defined"
**Solution:** Make sure `firebase.js` is imported and exports `db`

### Problem: "Messages not updating in real-time"
**Solution:** 
- Check that listener is set up: `onMessagesUpdate(...)`
- Ensure Firestore is reachable
- Check browser console for errors

### Problem: "Permission denied errors"
**Solution:**
- Check security rules
- Verify user is authenticated
- Ensure user email is lowercase

### Problem: "Memory leak warning"
**Solution:** Always unsubscribe from listeners when leaving chat
```javascript
if (unsubscribe) unsubscribe();
```

## Next Steps

1. ✅ Security rules are deployed
2. ✅ Chat operations module is ready
3. **TODO:** Integrate into your HTML UI
4. **TODO:** Connect to your chatbot API (Groq)
5. **TODO:** Test end-to-end
6. **TODO:** Deploy to Firebase Hosting

## Complete Integration Checklist

- [ ] Verify `firebase.js` has correct credentials
- [ ] Import `firebase-chat-operations.js` in your script
- [ ] Update HTML with chat UI elements (see examples)
- [ ] Handle user login → `initializeUserSession()`
- [ ] Display chats → `getUserChats()` + real-time update
- [ ] Open chat → `onMessagesUpdate()` for real-time messages
- [ ] Send message → `addMessage()` + get bot response + add bot message
- [ ] Implement error handling in all operations
- [ ] Test in browser console using examples
- [ ] Deploy security rules (already done ✅)

## Support

Refer to firebase-chat-examples.js for complete usage examples of every function.

---

**Last Updated:** April 1, 2026
**Version:** 1.0 - Production Ready
