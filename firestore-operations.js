/**
 * Firestore Operations Module
 * Complete CRUD operations for Student Management Portal
 * 
 * Exports all database functions for:
 * - Users
 * - Timetable
 * - Attendance
 * - Announcements
 * - Resources
 * - Academic Units
 * - Chats & Messages
 */

import { db } from "./firebase.js";
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
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  onSnapshot,
  addDoc,
  Timestamp
} from "firebase/firestore";

// ============ USERS OPERATIONS ============

/**
 * Create a new user document
 * @param {string} userId - Email address (used as document ID)
 * @param {object} userData - User information
 */
export async function createUser(userId, userData) {
  try {
    const userRef = doc(db, "users", userId.toLowerCase());
    
    const userDoc = {
      ...userData,
      email: userId.toLowerCase(),
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "active",
      academics: {
        dept: userData.dept || "",
        section: userData.section || "",
        sem: userData.sem || 1
      },
      settings: {
        theme: "light",
        notifications: true,
        language: "en"
      }
    };
    
    await setDoc(userRef, userDoc);
    console.log("✓ User created:", userId);
    return userDoc;
  } catch (error) {
    console.error("✗ Error creating user:", error);
    throw error;
  }
}

/**
 * Get user document by ID
 * @param {string} userId - Email address
 */
export async function getUser(userId) {
  try {
    const userRef = doc(db, "users", userId.toLowerCase());
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn("⚠ User not found:", userId);
      return null;
    }
    
    return { id: userSnap.id, ...userSnap.data() };
  } catch (error) {
    console.error("✗ Error getting user:", error);
    throw error;
  }
}

/**
 * Update user information
 * @param {string} userId - Email address
 * @param {object} updates - Fields to update
 */
export async function updateUser(userId, updates) {
  try {
    const userRef = doc(db, "users", userId.toLowerCase());
    await updateDoc(userRef, {
      ...updates,
      lastLogin: serverTimestamp()
    });
    console.log("✓ User updated:", userId);
  } catch (error) {
    console.error("✗ Error updating user:", error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 * @param {string} role - Filter by role (ADMIN, STUDENT, or 'ALL')
 */
export async function getAllUsers(role = 'ALL') {
  try {
    let q;
    if (role === 'ALL') {
      q = query(collection(db, "users"));
    } else {
      q = query(collection(db, "users"), where("role", "==", role));
    }
    
    const snapshot = await getDocs(q);
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${users.length} users`);
    return users;
  } catch (error) {
    console.error("✗ Error getting users:", error);
    throw error;
  }
}

// ============ TIMETABLE OPERATIONS ============

/**
 * Create a timetable entry
 * @param {object} timetableData - Timetable information
 */
export async function createTimetableEntry(timetableData) {
  try {
    const docRef = await addDoc(collection(db, "timetable"), {
      ...timetableData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✓ Timetable entry created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error creating timetable entry:", error);
    throw error;
  }
}

/**
 * Get timetable for a specific dept/section/semester
 * @param {string} dept - Department
 * @param {string} section - Section
 * @param {number} sem - Semester
 */
export async function getTimetable(dept, section, sem) {
  try {
    const q = query(
      collection(db, "timetable"),
      where("academicInfo.dept", "==", dept),
      where("academicInfo.section", "==", section),
      where("academicInfo.sem", "==", sem),
      orderBy("dayOfWeek"),
      orderBy("periodSlots")
    );
    
    const snapshot = await getDocs(q);
    const timetable = [];
    snapshot.forEach(doc => {
      timetable.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${timetable.length} timetable entries`);
    return timetable;
  } catch (error) {
    console.error("✗ Error getting timetable:", error);
    throw error;
  }
}

/**
 * Update timetable entry
 * @param {string} entryId - Timetable entry ID
 * @param {object} updates - Fields to update
 */
export async function updateTimetableEntry(entryId, updates) {
  try {
    const entryRef = doc(db, "timetable", entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log("✓ Timetable entry updated:", entryId);
  } catch (error) {
    console.error("✗ Error updating timetable entry:", error);
    throw error;
  }
}

/**
 * Delete timetable entry
 * @param {string} entryId - Timetable entry ID
 */
export async function deleteTimetableEntry(entryId) {
  try {
    await deleteDoc(doc(db, "timetable", entryId));
    console.log("✓ Timetable entry deleted:", entryId);
  } catch (error) {
    console.error("✗ Error deleting timetable entry:", error);
    throw error;
  }
}

// ============ ATTENDANCE OPERATIONS ============

/**
 * Record attendance for a student
 * @param {object} attendanceData - Attendance information
 */
export async function recordAttendance(attendanceData) {
  try {
    const docRef = await addDoc(collection(db, "attendance"), {
      ...attendanceData,
      recordedAt: serverTimestamp()
    });
    
    // Update attendance summary
    await updateAttendanceSummary(attendanceData);
    
    console.log("✓ Attendance recorded:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error recording attendance:", error);
    throw error;
  }
}

/**
 * Get attendance records for a student
 * @param {string} studentEmail - Student email
 * @param {string} subjectName - Subject name (optional)
 */
export async function getAttendanceRecords(studentEmail, subjectName = null) {
  try {
    let q;
    if (subjectName) {
      q = query(
        collection(db, "attendance"),
        where("studentEmail", "==", studentEmail),
        where("subjectName", "==", subjectName),
        orderBy("date", "desc")
      );
    } else {
      q = query(
        collection(db, "attendance"),
        where("studentEmail", "==", studentEmail),
        orderBy("date", "desc")
      );
    }
    
    const snapshot = await getDocs(q);
    const records = [];
    snapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${records.length} attendance records`);
    return records;
  } catch (error) {
    console.error("✗ Error getting attendance records:", error);
    throw error;
  }
}

/**
 * Update attendance summary (called after recording attendance)
 * @param {object} attendanceData - Attendance information
 */
async function updateAttendanceSummary(attendanceData) {
  try {
    const q = query(
      collection(db, "attendance_summary"),
      where("studentEmail", "==", attendanceData.studentEmail),
      where("subjectName", "==", attendanceData.subjectName)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create new summary
      await addDoc(collection(db, "attendance_summary"), {
        studentEmail: attendanceData.studentEmail,
        subjectName: attendanceData.subjectName,
        attended: attendanceData.status === "PRESENT" ? 1 : 0,
        total: 1,
        thresholdTarget: 75.0,
        percentage: attendanceData.status === "PRESENT" ? 100 : 0,
        academicInfo: attendanceData.academicInfo,
        lastUpdated: serverTimestamp()
      });
    } else {
      // Update existing summary
      const summaryId = snapshot.docs[0].id;
      const summaryRef = doc(db, "attendance_summary", summaryId);
      
      const increment_attended = attendanceData.status === "PRESENT" ? 1 : 0;
      const currentData = snapshot.docs[0].data();
      const newAttended = currentData.attended + increment_attended;
      const newTotal = currentData.total + 1;
      const newPercentage = (newAttended / newTotal) * 100;
      
      await updateDoc(summaryRef, {
        attended: newAttended,
        total: newTotal,
        percentage: newPercentage,
        lastUpdated: serverTimestamp()
      });
    }
    
    console.log("✓ Attendance summary updated");
  } catch (error) {
    console.error("✗ Error updating attendance summary:", error);
  }
}

/**
 * Get attendance summary for a student
 * @param {string} studentEmail - Student email
 */
export async function getAttendanceSummary(studentEmail) {
  try {
    const q = query(
      collection(db, "attendance_summary"),
      where("studentEmail", "==", studentEmail)
    );
    
    const snapshot = await getDocs(q);
    const summaries = [];
    snapshot.forEach(doc => {
      summaries.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${summaries.length} attendance summaries`);
    return summaries;
  } catch (error) {
    console.error("✗ Error getting attendance summary:", error);
    throw error;
  }
}

// ============ ANNOUNCEMENTS OPERATIONS ============

/**
 * Create an announcement
 * @param {object} announcementData - Announcement information
 */
export async function createAnnouncement(announcementData) {
  try {
    const docRef = await addDoc(collection(db, "announcements"), {
      ...announcementData,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      targeting: {
        targetDept: announcementData.targetDept || "ALL",
        targetDepts: announcementData.targetDepts || [],
        targetSections: announcementData.targetSections || [],
        targetSemesters: announcementData.targetSemesters || []
      }
    });
    
    console.log("✓ Announcement created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error creating announcement:", error);
    throw error;
  }
}

/**
 * Get announcements visible to a user
 * @param {string} dept - User's department
 * @param {string} section - User's section
 * @param {number} sem - User's semester
 */
export async function getAnnouncementsForUser(dept, section, sem) {
  try {
    const q = query(
      collection(db, "announcements"),
      orderBy("date", "desc"),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const announcements = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter based on targeting
      const isVisible = 
        data.targeting.targetDept === "ALL" ||
        (data.targeting.targetDepts.length === 0 || data.targeting.targetDepts.includes(dept)) &&
        (data.targeting.targetSections.length === 0 || data.targeting.targetSections.includes(section)) &&
        (data.targeting.targetSemesters.length === 0 || data.targeting.targetSemesters.includes(sem));
      
      if (isVisible) {
        announcements.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`✓ Retrieved ${announcements.length} announcements`);
    return announcements;
  } catch (error) {
    console.error("✗ Error getting announcements:", error);
    throw error;
  }
}

/**
 * Update announcement
 * @param {string} announcementId - Announcement ID
 * @param {object} updates - Fields to update
 */
export async function updateAnnouncement(announcementId, updates) {
  try {
    const announcementRef = doc(db, "announcements", announcementId);
    await updateDoc(announcementRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log("✓ Announcement updated:", announcementId);
  } catch (error) {
    console.error("✗ Error updating announcement:", error);
    throw error;
  }
}

/**
 * Delete announcement
 * @param {string} announcementId - Announcement ID
 */
export async function deleteAnnouncement(announcementId) {
  try {
    await deleteDoc(doc(db, "announcements", announcementId));
    console.log("✓ Announcement deleted:", announcementId);
  } catch (error) {
    console.error("✗ Error deleting announcement:", error);
    throw error;
  }
}

// ============ RESOURCES OPERATIONS ============

/**
 * Create a resource
 * @param {object} resourceData - Resource information
 */
export async function createResource(resourceData) {
  try {
    const docRef = await addDoc(collection(db, "resources"), {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      targeting: {
        dept: resourceData.dept || "ALL",
        sections: resourceData.sections || [],
        semesters: resourceData.semesters || []
      }
    });
    
    console.log("✓ Resource created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error creating resource:", error);
    throw error;
  }
}

/**
 * Get resources for a user
 * @param {string} dept - Department
 * @param {string} section - Section
 * @param {number} sem - Semester
 */
export async function getResourcesForUser(dept, section, sem) {
  try {
    const q = query(
      collection(db, "resources"),
      orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    const resources = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const isAccessible = 
        data.targeting.dept === "ALL" ||
        (data.targeting.dept === dept &&
         (data.targeting.sections.length === 0 || data.targeting.sections.includes(section)) &&
         (data.targeting.semesters.length === 0 || data.targeting.semesters.includes(sem)));
      
      if (isAccessible) {
        resources.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`✓ Retrieved ${resources.length} resources`);
    return resources;
  } catch (error) {
    console.error("✗ Error getting resources:", error);
    throw error;
  }
}

/**
 * Update resource
 * @param {string} resourceId - Resource ID
 * @param {object} updates - Fields to update
 */
export async function updateResource(resourceId, updates) {
  try {
    const resourceRef = doc(db, "resources", resourceId);
    await updateDoc(resourceRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log("✓ Resource updated:", resourceId);
  } catch (error) {
    console.error("✗ Error updating resource:", error);
    throw error;
  }
}

/**
 * Delete resource
 * @param {string} resourceId - Resource ID
 */
export async function deleteResource(resourceId) {
  try {
    await deleteDoc(doc(db, "resources", resourceId));
    console.log("✓ Resource deleted:", resourceId);
  } catch (error) {
    console.error("✗ Error deleting resource:", error);
    throw error;
  }
}

// ============ ACADEMIC UNITS OPERATIONS ============

/**
 * Create academic unit (dept/section combination)
 * @param {string} dept - Department
 * @param {string} section - Section
 * @param {string} createdBy - Admin email
 */
export async function createAcademicUnit(dept, section, createdBy) {
  try {
    // Check if already exists
    const q = query(
      collection(db, "academic_units"),
      where("dept", "==", dept),
      where("section", "==", section)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.warn("⚠ Academic unit already exists");
      return snapshot.docs[0].id;
    }
    
    const docRef = await addDoc(collection(db, "academic_units"), {
      dept,
      section,
      createdBy,
      createdAt: serverTimestamp()
    });
    
    console.log("✓ Academic unit created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error creating academic unit:", error);
    throw error;
  }
}

/**
 * Get all academic units
 */
export async function getAllAcademicUnits() {
  try {
    const snapshot = await getDocs(collection(db, "academic_units"));
    const units = [];
    snapshot.forEach(doc => {
      units.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${units.length} academic units`);
    return units;
  } catch (error) {
    console.error("✗ Error getting academic units:", error);
    throw error;
  }
}

/**
 * Delete academic unit
 * @param {string} unitId - Unit ID
 */
export async function deleteAcademicUnit(unitId) {
  try {
    await deleteDoc(doc(db, "academic_units", unitId));
    console.log("✓ Academic unit deleted:", unitId);
  } catch (error) {
    console.error("✗ Error deleting academic unit:", error);
    throw error;
  }
}

// ============ CHATS & MESSAGES OPERATIONS ============

/**
 * Create a chat
 * @param {string} userId - User ID (email)
 * @param {object} chatData - Chat information
 */
export async function createChat(userId, chatData) {
  try {
    const userChatsRef = collection(db, "users", userId.toLowerCase(), "chats");
    const docRef = await addDoc(userChatsRef, {
      ...chatData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      participantCount: 2,
      lastMessage: "",
      lastMessageAt: serverTimestamp()
    });
    
    console.log("✓ Chat created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error creating chat:", error);
    throw error;
  }
}

/**
 * Add message to a chat
 * @param {string} userId - User ID (email)
 * @param {string} chatId - Chat ID
 * @param {object} messageData - Message information
 */
export async function addMessage(userId, chatId, messageData) {
  try {
    const messagesRef = collection(
      db,
      "users",
      userId.toLowerCase(),
      "chats",
      chatId,
      "messages"
    );
    
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp(),
      status: "sent",
      reactions: {}
    });
    
    // Update chat's last message
    const chatRef = doc(db, "users", userId.toLowerCase(), "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData.text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✓ Message added:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("✗ Error adding message:", error);
    throw error;
  }
}

/**
 * Get messages from a chat with pagination
 * @param {string} userId - User ID (email)
 * @param {string} chatId - Chat ID
 * @param {number} pageSize - Number of messages per page (default 20)
 * @param {object} startAfterDoc - Last document for pagination
 */
export async function getMessages(userId, chatId, pageSize = 20, startAfterDoc = null) {
  try {
    const messagesRef = collection(
      db,
      "users",
      userId.toLowerCase(),
      "chats",
      chatId,
      "messages"
    );
    
    let q;
    if (startAfterDoc) {
      q = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        startAfter(startAfterDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(q);
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✓ Retrieved ${messages.length} messages`);
    return { messages, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  } catch (error) {
    console.error("✗ Error getting messages:", error);
    throw error;
  }
}

/**
 * Listen to messages in real-time
 * @param {string} userId - User ID (email)
 * @param {string} chatId - Chat ID
 * @param {function} callback - Function called on updates
 */
export function listenToMessages(userId, chatId, callback) {
  try {
    const messagesRef = collection(
      db,
      "users",
      userId.toLowerCase(),
      "chats",
      chatId,
      "messages"
    );
    
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      callback(messages.reverse()); // Reverse to show oldest first
    });
    
    return unsubscribe; // Return unsubscribe function
  } catch (error) {
    console.error("✗ Error listening to messages:", error);
    throw error;
  }
}

/**
 * Get all chats for a user with real-time listener
 * @param {string} userId - User ID (email)
 * @param {function} callback - Function called on updates
 */
export function listenToChats(userId, callback) {
  try {
    const chatsRef = collection(db, "users", userId.toLowerCase(), "chats");
    const q = query(chatsRef, orderBy("updatedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = [];
      snapshot.forEach(doc => {
        chats.push({ id: doc.id, ...doc.data() });
      });
      callback(chats);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("✗ Error listening to chats:", error);
    throw error;
  }
}

/**
 * Add reaction to a message
 * @param {string} userId - User ID (email)
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @param {string} emoji - Emoji reaction
 */
export async function addReaction(userId, chatId, messageId, emoji) {
  try {
    const messageRef = doc(
      db,
      "users",
      userId.toLowerCase(),
      "chats",
      chatId,
      "messages",
      messageId
    );
    
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: arrayUnion(userId)
    });
    
    console.log("✓ Reaction added");
  } catch (error) {
    console.error("✗ Error adding reaction:", error);
    throw error;
  }
}

// ============ BATCH OPERATIONS ============

/**
 * Batch update attendance for multiple students
 * @param {array} attendanceRecords - Array of attendance records
 */
export async function batchRecordAttendance(attendanceRecords) {
  try {
    const batch = writeBatch(db);
    
    for (const record of attendanceRecords) {
      const docRef = doc(collection(db, "attendance"));
      batch.set(docRef, {
        ...record,
        recordedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`✓ Batch recorded ${attendanceRecords.length} attendance records`);
  } catch (error) {
    console.error("✗ Error in batch attendance recording:", error);
    throw error;
  }
}

/**
 * Seed demo data for testing
 */
export async function seedDemoData() {
  try {
    console.log("🌱 Seeding demo data...");
    
    // Create academic units
    await createAcademicUnit("CSE", "A", "admin@college.edu");
    await createAcademicUnit("CSE", "B", "admin@college.edu");
    await createAcademicUnit("ECE", "A", "admin@college.edu");
    
    // Create timetable
    await createTimetableEntry({
      dayOfWeek: "Monday",
      periodSlots: "9:00-10:00",
      subjectName: "Data Structures",
      roomNumber: "101",
      facultyName: "Dr. Patel",
      academicInfo: {
        dept: "CSE",
        section: "A",
        sem: 3
      }
    });
    
    // Create announcements
    await createAnnouncement({
      title: "Mid-Term Exams",
      body: "Mid-term exams will be held next month",
      priority: "high",
      targetDept: "ALL"
    });
    
    // Create resources
    await createResource({
      title: "Data Structures Tutorial",
      description: "Complete guide to data structures",
      resourceType: "DOCUMENT",
      resourceUrl: "https://example.com/ds",
      dept: "CSE",
      sections: ["A", "B"],
      semesters: [2, 3, 4]
    });
    
    console.log("✓ Demo data seeded successfully");
  } catch (error) {
    console.error("✗ Error seeding demo data:", error);
    throw error;
  }
}

export default {
  // Users
  createUser,
  getUser,
  updateUser,
  getAllUsers,
  
  // Timetable
  createTimetableEntry,
  getTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
  
  // Attendance
  recordAttendance,
  getAttendanceRecords,
  getAttendanceSummary,
  
  // Announcements
  createAnnouncement,
  getAnnouncementsForUser,
  updateAnnouncement,
  deleteAnnouncement,
  
  // Resources
  createResource,
  getResourcesForUser,
  updateResource,
  deleteResource,
  
  // Academic Units
  createAcademicUnit,
  getAllAcademicUnits,
  deleteAcademicUnit,
  
  // Chats & Messages
  createChat,
  addMessage,
  getMessages,
  listenToMessages,
  listenToChats,
  addReaction,
  
  // Batch Operations
  batchRecordAttendance,
  seedDemoData
};
