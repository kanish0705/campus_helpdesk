/**
 * Firebase Firestore Chat Operations Module
 * Handles user accounts, chats, and messaging with real-time listeners
 * 
 * Database Structure:
 * /users/{email}
 *   - name
 *   - email
 *   - role
 *   - createdAt
 *   /chats/{chatId}
 *     - title
 *     - createdAt
 *     - lastMessage
 *     /messages/{messageId}
 *       - sender (user or bot)
 *       - text
 *       - timestamp
 */

import { db, auth } from './firebase.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  addDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ==================== USER OPERATIONS ====================

/**
 * Create a new user document in Firestore
 * Called after successful authentication
 * 
 * @param {string} email - User email (document ID)
 * @param {string} name - User full name
 * @param {string} role - User role ('ADMIN' or 'STUDENT')
 * @returns {Promise<void>}
 */
export const createUserDocument = async (email, name, role = 'STUDENT') => {
  try {
    const userRef = doc(db, 'users', email.toLowerCase());
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log(`User ${email} already exists`);
      return;
    }

    // Create user document
    await setDoc(userRef, {
      email: email.toLowerCase(),
      name: name,
      role: role,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    console.log(`✓ User created: ${email}`);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * 
 * @param {string} email - User email
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (email) => {
  try {
    const userRef = doc(db, 'users', email.toLowerCase());
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn(`User ${email} not found`);
      return null;
    }

    return { id: userSnap.id, ...userSnap.data() };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * 
 * @param {string} email - User email
 * @param {Object} updates - Fields to update {name, role, etc}
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (email, updates) => {
  try {
    const userRef = doc(db, 'users', email.toLowerCase());
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log(`✓ User profile updated: ${email}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ==================== CHAT OPERATIONS ====================

/**
 * Create a new chat for the user
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatTitle - Title/name of the chat (e.g., "Math Help", "General Chat")
 * @returns {Promise<string>} Chat ID
 */
export const createChat = async (userEmail, chatTitle = 'New Chat') => {
  try {
    const userRef = doc(db, 'users', userEmail.toLowerCase());
    const chatsRef = collection(userRef, 'chats');

    const newChat = {
      title: chatTitle,
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      messageCount: 0
    };

    const docRef = await addDoc(chatsRef, newChat);
    console.log(`✓ Chat created: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

/**
 * Get all chats for a user
 * 
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of chat objects
 */
export const getUserChats = async (userEmail) => {
  try {
    const userRef = doc(db, 'users', userEmail.toLowerCase());
    const chatsRef = collection(userRef, 'chats');
    // Add limit(20) to load only recent 20 chats for better performance
    const chatsQuery = query(chatsRef, orderBy('lastMessageTime', 'desc'), limit(20));

    const snapshot = await getDocs(chatsQuery);
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

/**
 * Get a specific chat
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @returns {Promise<Object>} Chat object
 */
export const getChat = async (userEmail, chatId) => {
  try {
    const chatRef = doc(db, 'users', userEmail.toLowerCase(), 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      console.warn(`Chat ${chatId} not found`);
      return null;
    }

    return { id: chatSnap.id, ...chatSnap.data() };
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
};

/**
 * Update chat title or metadata
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {Object} updates - Fields to update {title, etc}
 * @returns {Promise<void>}
 */
export const updateChat = async (userEmail, chatId, updates) => {
  try {
    const chatRef = doc(db, 'users', userEmail.toLowerCase(), 'chats', chatId);
    await updateDoc(chatRef, {
      ...updates,
      lastModified: serverTimestamp()
    });
    console.log(`✓ Chat updated: ${chatId}`);
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
};

/**
 * Delete a chat and all its messages
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @returns {Promise<void>}
 */
export const deleteChat = async (userEmail, chatId) => {
  try {
    // Delete all messages first
    const messagesRef = collection(db, 'users', userEmail.toLowerCase(), 'chats', chatId, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    
    for (const messageDoc of messagesSnapshot.docs) {
      await deleteDoc(messageDoc.ref);
    }

    // Delete the chat document
    const chatRef = doc(db, 'users', userEmail.toLowerCase(), 'chats', chatId);
    await deleteDoc(chatRef);
    console.log(`✓ Chat deleted: ${chatId}`);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// ==================== MESSAGE OPERATIONS ====================

/**
 * Add a message to a chat
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {string} sender - Sender type ('user' or 'bot')
 * @param {string} text - Message content
 * @returns {Promise<string>} Message ID
 */
export const addMessage = async (userEmail, chatId, sender, text) => {
  try {
    if (!['user', 'bot'].includes(sender)) {
      throw new Error('Sender must be "user" or "bot"');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    const messagesRef = collection(
      db,
      'users',
      userEmail.toLowerCase(),
      'chats',
      chatId,
      'messages'
    );

    const newMessage = {
      sender: sender,
      text: text.trim(),
      timestamp: serverTimestamp(),
      edited: false,
      reactions: {}
    };

    const docRef = await addDoc(messagesRef, newMessage);

    // Update chat's last message
    const chatRef = doc(db, 'users', userEmail.toLowerCase(), 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageTime: serverTimestamp(),
      messageCount: Timestamp.now()
    });

    console.log(`✓ Message added: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

/**
 * Get all messages for a chat (offline)
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {number} limitCount - Maximum number of messages to fetch (default 50)
 * @returns {Promise<Array>} Array of message objects
 */
export const getMessages = async (userEmail, chatId, limitCount = 50) => {
  try {
    const messagesRef = collection(
      db,
      'users',
      userEmail.toLowerCase(),
      'chats',
      chatId,
      'messages'
    );

    const messagesQuery = query(
      messagesRef,
      orderBy('timestamp', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }));

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Real-time listener for chat messages
 * Returns unsubscribe function to stop listening
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {Function} callback - Function to call when messages update (messages array)
 * @returns {Function} Unsubscribe function
 */
export const onMessagesUpdate = (userEmail, chatId, callback) => {
  try {
    const messagesRef = collection(
      db,
      'users',
      userEmail.toLowerCase(),
      'chats',
      chatId,
      'messages'
    );

    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'), limit(50));

    // Set up real-time listener (limit to 50 most recent messages for performance)
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));
        callback(messages);
      },
      (error) => {
        console.error('Error in real-time listener:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    throw error;
  }
};

/**
 * Update a message (edit)
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @param {string} newText - Updated message text
 * @returns {Promise<void>}
 */
export const editMessage = async (userEmail, chatId, messageId, newText) => {
  try {
    if (!newText || newText.trim().length === 0) {
      throw new Error('Message text cannot be empty');
    }

    const messageRef = doc(
      db,
      'users',
      userEmail.toLowerCase(),
      'chats',
      chatId,
      'messages',
      messageId
    );

    await updateDoc(messageRef, {
      text: newText.trim(),
      edited: true,
      editedAt: serverTimestamp()
    });

    console.log(`✓ Message edited: ${messageId}`);
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (userEmail, chatId, messageId) => {
  try {
    const messageRef = doc(
      db,
      'users',
      userEmail.toLowerCase(),
      'chats',
      chatId,
      'messages',
      messageId
    );

    await deleteDoc(messageRef);
    console.log(`✓ Message deleted: ${messageId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Search chats by title
 * 
 * @param {string} userEmail - User's email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching chats
 */
export const searchChats = async (userEmail, searchTerm) => {
  try {
    const chats = await getUserChats(userEmail);
    const filtered = chats.filter(chat =>
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  } catch (error) {
    console.error('Error searching chats:', error);
    throw error;
  }
};

/**
 * Get message statistics for a chat
 * 
 * @param {string} userEmail - User's email
 * @param {string} chatId - Chat ID
 * @returns {Promise<Object>} Statistics {totalMessages, userMessages, botMessages}
 */
export const getChatStats = async (userEmail, chatId) => {
  try {
    const messages = await getMessages(userEmail, chatId, 1000);
    
    const stats = {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.sender === 'user').length,
      botMessages: messages.filter(m => m.sender === 'bot').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    throw error;
  }
};

/**
 * Export all chats and messages as JSON
 * 
 * @param {string} userEmail - User's email
 * @returns {Promise<Object>} Exported data
 */
export const exportChatData = async (userEmail) => {
  try {
    const chats = await getUserChats(userEmail);
    const exportData = {
      user: userEmail,
      exportedAt: new Date().toISOString(),
      chats: []
    };

    for (const chat of chats) {
      const messages = await getMessages(userEmail, chat.id, 1000);
      exportData.chats.push({
        ...chat,
        messages: messages
      });
    }

    return exportData;
  } catch (error) {
    console.error('Error exporting chat data:', error);
    throw error;
  }
};

// ==================== INITIALIZATION ====================

/**
 * Initialize user session after login
 * Creates user document if it doesn't exist
 * 
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<Object>} User profile
 */
export const initializeUserSession = async (email, name) => {
  try {
    const userEmail = email.toLowerCase();
    
    // Check if user exists
    let userProfile = await getUserProfile(userEmail);
    
    if (!userProfile) {
      // Create new user with correct role
      const isAdmin = userEmail === 'admin@college.edu' || userEmail.includes('admin');
      const role = isAdmin ? 'ADMIN' : 'STUDENT';
      await createUserDocument(userEmail, name, role);
      console.log(`✓ User created with role: ${role}`);
      // Return immediately with known data instead of fetching again
      return { email: userEmail, name, role };
    } else {
      // User exists - check if admin role needs to be applied
      const isAdmin = userEmail === 'admin@college.edu' || userEmail.includes('admin');
      const shouldBeAdmin = isAdmin && userProfile.role !== 'ADMIN';
      
      if (shouldBeAdmin) {
        console.log(`⚠️  Upgrading ${userEmail} from ${userProfile.role} to ADMIN`);
        // Update user role to ADMIN
        await updateDoc(doc(db, 'users', userEmail), { role: 'ADMIN' });
        console.log(`✓ User role updated to ADMIN`);
        // Update local profile object
        userProfile.role = 'ADMIN';
      }
    }

    console.log(`✓ User session initialized: ${userEmail}`);
    console.log(`✓ User role: ${userProfile?.role || 'STUDENT'}`);
    return userProfile;
  } catch (error) {
    console.error('Error initializing user session:', error);
    throw error;
  }
};

export default {
  // User Operations
  createUserDocument,
  getUserProfile,
  updateUserProfile,

  // Chat Operations
  createChat,
  getUserChats,
  getChat,
  updateChat,
  deleteChat,

  // Message Operations
  addMessage,
  getMessages,
  onMessagesUpdate,
  editMessage,
  deleteMessage,

  // Helper Functions
  searchChats,
  getChatStats,
  exportChatData,

  // Initialization
  initializeUserSession
};
