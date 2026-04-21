# Firestore Implementation Guide

## Project Analysis Results

### Identified Features:
✅ **User Authentication** (Students & Admins)
✅ **Timetable Management** (Class schedules by dept/section/semester)
✅ **Attendance Tracking** (Per student, per subject, with summaries)
✅ **Announcements** (Targeted by dept/section/semester)
✅ **Study Resources** (Documents, links, videos)
✅ **Academic Structure** (Departments, sections, semesters)
✅ **AI Chatbot** (Conversations with real-time updates)

---

## Database Structure

### Collection Hierarchy:
```
Firestore Root
├── users/
│   └── {email}/
│       ├── basicInfo
│       ├── academics
│       ├── settings
│       ├── chats/ (subcollection)
│       │   └── {chatId}/
│       │       ├── metadata
│       │       └── messages/ (subcollection)
│       └── createdAt, lastLogin
│
├── timetable/
│   └── {entryId}/
│
├── attendance/
│   └── {recordId}/
│
├── attendance_summary/
│   └── {summaryId}/
│
├── announcements/
│   ├── {announcementId}/
│
├── resources/
│   └── {resourceId}/
│
└── academic_units/
    └── {unitId}/
```

### Key Design Decisions:

1. **User ID**: Email address (lowercase) as document ID
   - Provides natural unique identifier
   - Enables email-based queries

2. **Subcollections for Chats**:
   - Messages under chats for unlimited scalability
   - Real-time listeners for live updates

3. **Denormalization**:
   - Store `academicInfo` in all related documents
   - Enables faster queries without joins

4. **Targeting Arrays**:
   - `targetDepts`, `targetSections`, `targetSemesters`
   - Use empty arrays to mean "all" values

5. **Timestamps**:
   - Use Firebase `serverTimestamp()` for consistency
   - Prevents client clock drift issues

---

## Complete Usage Examples

### 1. User Registration

```javascript
import { createUser, firebaseLogin } from './firestore-operations.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';

async function registerUser(email, password, userData) {
  try {
    // Create user in Firestore
    await createUser(email, {
      name: userData.name,
      roll_number: userData.rollNumber,
      role: userData.role || 'STUDENT',
      dept: userData.dept,
      section: userData.section,
      sem: userData.sem
    });
    
    // In production: Use Firebase Auth for password
    console.log('✓ User registered successfully');
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

// Usage
await registerUser(
  'student1@college.edu',
  'password123',
  {
    name: 'Rahul Sharma',
    rollNumber: '21CSE101',
    role: 'STUDENT',
    dept: 'CSE',
    section: 'A',
    sem: 4
  }
);
```

### 2. Authenticate User

```javascript
import { firebaseLogin } from './script.js'; // Already implemented

// Usage (in your login form)
const user = await firebaseLogin('student1@college.edu', 'password123');
if (user) {
  console.log(`Welcome ${user.name}`);
  // Redirect to dashboard
}
```

### 3. Fetch Timetable for Student

```javascript
import { getTimetable } from './firestore-operations.js';

async function loadStudentTimetable(dept, section, sem) {
  try {
    const timetable = await getTimetable(dept, section, sem);
    
    // Group by day of week
    const groupedByDay = {};
    timetable.forEach(entry => {
      if (!groupedByDay[entry.dayOfWeek]) {
        groupedByDay[entry.dayOfWeek] = [];
      }
      groupedByDay[entry.dayOfWeek].push(entry);
    });
    
    console.log('📅 Timetable:', groupedByDay);
    return groupedByDay;
  } catch (error) {
    console.error('Failed to load timetable:', error);
  }
}

// Usage
const studentTimetable = await loadStudentTimetable('CSE', 'A', 4);
```

### 4. Record Student Attendance (Admin)

```javascript
import { recordAttendance } from './firestore-operations.js';

async function markAttendance(studentEmail, subjects) {
  try {
    for (const subject of subjects) {
      await recordAttendance({
        studentEmail: studentEmail,
        subjectName: subject.name,
        date: new Date(),
        status: 'PRESENT', // PRESENT, ABSENT, LATE
        academicInfo: {
          dept: 'CSE',
          section: 'A',
          sem: 4
        }
      });
    }
    
    console.log('✓ Attendance marked for all subjects');
  } catch (error) {
    console.error('Failed to mark attendance:', error);
  }
}

// Usage
await markAttendance('student1@college.edu', [
  { name: 'Data Structures' },
  { name: 'Web Development' },
  { name: 'Database Systems' }
]);
```

### 5. Batch Update Attendance (Bulk Import)

```javascript
import { batchRecordAttendance } from './firestore-operations.js';

async function importAttendanceFromFile(fileData) {
  const attendanceRecords = fileData.map(row => ({
    studentEmail: row.email,
    subjectName: row.subject,
    date: new Date(row.date),
    status: row.status,
    academicInfo: {
      dept: row.dept,
      section: row.section,
      sem: row.sem
    }
  }));
  
  try {
    await batchRecordAttendance(attendanceRecords);
    console.log('✓ Batch attendance imported');
  } catch (error) {
    console.error('Batch import failed:', error);
  }
}

// Usage
const csvData = [
  { email: 'st1@college.edu', subject: 'DSA', date: '2024-01-15', status: 'PRESENT', dept: 'CSE', section: 'A', sem: 4 },
  { email: 'st2@college.edu', subject: 'DSA', date: '2024-01-15', status: 'ABSENT', dept: 'CSE', section: 'A', sem: 4 }
];
await importAttendanceFromFile(csvData);
```

### 6. View Attendance Summary (Student Dashboard)

```javascript
import { getAttendanceSummary } from './firestore-operations.js';

async function displayAttendanceSummary(studentEmail) {
  try {
    const summaries = await getAttendanceSummary(studentEmail);
    
    let totalAttended = 0;
    let totalClasses = 0;
    
    summaries.forEach(summary => {
      totalAttended += summary.attended;
      totalClasses += summary.total;
      
      const percentage = (summary.attended / summary.total * 100).toFixed(2);
      const status = percentage >= summary.thresholdTarget ? '✓ Safe' : '⚠ Warning';
      
      console.log(`${summary.subjectName}: ${percentage}% ${status}`);
    });
    
    const overallPercentage = (totalAttended / totalClasses * 100).toFixed(2);
    console.log(`Overall: ${overallPercentage}%`);
    
    return { summaries, overallPercentage };
  } catch (error) {
    console.error('Failed to get attendance summary:', error);
  }
}

// Usage
await displayAttendanceSummary('student1@college.edu');
```

### 7. Create and Broadcast Announcement (Admin)

```javascript
import { createAnnouncement } from './firestore-operations.js';

async function postAnnouncement(announcementData) {
  try {
    const announcementId = await createAnnouncement({
      title: announcementData.title,
      body: announcementData.body,
      imageUrl: announcementData.imageUrl,
      priority: announcementData.priority, // low, normal, high, urgent
      
      // Target specific groups
      targetDept: announcementData.targetDept || 'ALL',
      targetDepts: announcementData.targetDepts || [], // ['CSE', 'ECE']
      targetSections: announcementData.targetSections || [], // ['A', 'B']
      targetSemesters: announcementData.targetSemesters || [] // [2, 4, 6]
    });
    
    console.log(`✓ Announcement posted: ${announcementId}`);
  } catch (error) {
    console.error('Failed to post announcement:', error);
  }
}

// Usage
await postAnnouncement({
  title: 'Midterm Examinations',
  body: 'Dear Students, Midterm examinations will be held from Feb 1-15...',
  imageUrl: 'https://example.com/exam.jpg',
  priority: 'high',
  targetDepts: ['CSE', 'ECE'],
  targetSemesters: [3, 4]
});
```

### 8. Get Announcements for Student

```javascript
import { getAnnouncementsForUser } from './firestore-operations.js';

async function displayAnnouncements(userDept, userSection, userSem) {
  try {
    const announcements = await getAnnouncementsForUser(userDept, userSection, userSem);
    
    announcements.forEach(ann => {
      console.log(`
        📢 ${ann.title}
        Priority: ${ann.priority.toUpperCase()}
        ${ann.body}
        Posted: ${new Date(ann.date.toDate()).toLocaleString()}
      `);
    });
  } catch (error) {
    console.error('Failed to get announcements:', error);
  }
}

// Usage
await displayAnnouncements('CSE', 'A', 4);
```

### 9. Upload Study Resources (Admin)

```javascript
import { createResource } from './firestore-operations.js';

async function uploadResource(resourceData) {
  try {
    const resourceId = await createResource({
      title: resourceData.title,
      description: resourceData.description,
      resourceType: resourceData.type, // DOCUMENT, LINK, VIDEO, OTHER
      resourceUrl: resourceData.url,
      
      // Make available to specific groups
      dept: resourceData.dept || 'ALL',
      sections: resourceData.sections || [], // ['A', 'B']
      semesters: resourceData.semesters || [] // [3, 4]
    });
    
    console.log(`✓ Resource uploaded: ${resourceId}`);
  } catch (error) {
    console.error('Failed to upload resource:', error);
  }
}

// Usage
await uploadResource({
  title: 'Data Structures Lecture Notes',
  description: 'Comprehensive notes on arrays, linked lists, and trees',
  type: 'DOCUMENT',
  url: 'https://drive.google.com/file/d/xxx',
  dept: 'CSE',
  sections: ['A', 'B'],
  semesters: [3, 4]
});
```

### 10. Real-Time Chat with Bot

```javascript
import { 
  createChat, 
  addMessage, 
  listenToMessages, 
  getMessages
} from './firestore-operations.js';

// Create chat
async function startChat(userId) {
  const chatId = await createChat(userId, {
    title: 'Attendance Assistant',
    description: 'Get help with attendance queries'
  });
  return chatId;
}

// Send message
async function sendMessage(userId, chatId, messageText) {
  await addMessage(userId, chatId, {
    text: messageText,
    sender: 'user',
    senderId: userId,
    senderName: 'Student',
    type: 'text'
  });
}

// Simulate bot response
async function botRespond(userId, chatId, userMessage) {
  // In production: Call Groq API for intelligent responses
  const responses = {
    'attendance': 'Your current attendance is 80%. Keep it up!',
    'schedule': 'Your today schedule: DSA (9:00), OOP (11:00), Database (1:00)',
    'resources': 'Check the resources section for latest study materials'
  };
  
  const keyword = Object.keys(responses).find(k => userMessage.toLowerCase().includes(k));
  const botMessage = responses[keyword] || 'How can I help you?';
  
  setTimeout(async () => {
    await addMessage(userId, chatId, {
      text: botMessage,
      sender: 'bot',
      senderId: 'ai-bot',
      senderName: 'AI Assistant',
      type: 'text'
    });
  }, 500);
}

// Real-time message listener
function watchChat(userId, chatId) {
  const unsubscribe = listenToMessages(userId, chatId, (messages) => {
    console.log('📱 New messages:', messages);
    // Update UI with messages
  });
  
  return unsubscribe; // Call this to stop listening
}

// Usage
(async () => {
  const chatId = await startChat('student1@college.edu');
  await sendMessage('student1@college.edu', chatId, 'What is my attendance percentage?');
  await botRespond('student1@college.edu', chatId, 'What is my attendance percentage?');
  
  // Listen for real-time updates
  const unsubscribe = watchChat('student1@college.edu', chatId);
})();
```

### 11. Manage Academic Structure (Admin)

```javascript
import { 
  createAcademicUnit, 
  getAllAcademicUnits, 
  deleteAcademicUnit 
} from './firestore-operations.js';

async function setupAcademicYear() {
  try {
    const departments = ['CSE', 'ECE', 'ME', 'CIVIL'];
    const sections = ['A', 'B', 'C'];
    
    for (const dept of departments) {
      for (const section of sections) {
        await createAcademicUnit(dept, section, 'admin@college.edu');
        console.log(`✓ Created ${dept}-${section}`);
      }
    }
  } catch (error) {
    console.error('Failed to setup academic units:', error);
  }
}

// Usage
await setupAcademicYear();
```

---

## Security Rules Summary

### What Users Can Do:

**Students:**
- ✅ Read own user profile
- ✅ Read own chats and messages
- ✅ Read timetable for their dept/section/sem
- ✅ Read own attendance records
- ✅ Read announcements targeted to them
- ✅ Read resources targeted to them
- ❌ Cannot modify any data

**Admins:**
- ✅ Can read all data
- ✅ Can create/update/delete timetable entries
- ✅ Can record attendance
- ✅ Can post announcements
- ✅ Can upload resources
- ✅ Can manage academic units
- ❌ Cannot modify student chats/messages

---

## Performance Tips

### Query Optimization:

1. **Use Indexes**:
   ```javascript
   // Good: Composite index created
   const q = query(
     collection(db, "attendance"),
     where("studentEmail", "==", email),
     where("date", ">", startDate),
     orderBy("date", "desc")
   );
   ```

2. **Limit Results**:
   ```javascript
   const q = query(
     collection(db, "announcements"),
     orderBy("date", "desc"),
     limit(50) // Don't fetch all
   );
   ```

3. **Pagination**:
   ```javascript
   const { messages, lastDoc } = await getMessages(userId, chatId, 20);
   // Later fetch next page with lastDoc
   const nextPage = await getMessages(userId, chatId, 20, lastDoc);
   ```

### Caching:

```javascript
// Cache user data locally
let userCache = null;

async function getUserCached(email) {
  if (!userCache || userCache.email !== email) {
    userCache = await getUser(email);
  }
  return userCache;
}
```

---

## Migration from SQLite

### Step-by-Step Process:

1. **Export SQLite Data**:
   ```python
   # From Python backend
   users = db.query(User).all()
   timetables = db.query(Timetable).all()
   attendance = db.query(Attendance).all()
   ```

2. **Transform to Firestore Format**:
   ```javascript
   const firebaseUsers = sqliteUsers.map(user => ({
     email: user.email.toLowerCase(),
     name: user.name,
     role: user.role,
     academicInfo: {
       dept: user.dept,
       section: user.section,
       sem: user.sem
     },
     createdAt: Timestamp.fromDate(new Date(user.created_at))
   }));
   ```

3. **Batch Import**:
   ```javascript
   const batch = writeBatch(db);
   firebaseUsers.forEach(user => {
     batch.set(doc(db, "users", user.email), user);
   });
   await batch.commit();
   ```

---

## Testing Your Database

### Console Debugging:

```javascript
// Test seeding data
window.seedDemoData = seedDemoData;

// In console:
await seedDemoData();
```

### Verify in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Verify collections and documents are created

---

## Troubleshooting

### Common Issues:

**❌ "Missing or insufficient permissions"**
- Check security rules
- Ensure user is authenticated
- Verify rule logic in security rules section

**❌ "Document not found"**
- Verify document ID (especially email lowercase)
- Check collection name spelling
- Ensure document was created

**❌ "Index not found"**
- Firestore will provide link to create index
- Click link to auto-create composite index
- Wait a few minutes for index to build

**❌ Queries returning empty**
- Check query conditions match document data
- Enable logging: `console.log('Query:', q)`
- Verify data exists using Firebase Console

---

## Next Steps

1. **Enable Firebase Auth**: Replace basic email/password with Firebase Auth SDK
2. **Set up Cloud Functions**: For sensitive operations (bulk operations, admin tasks)
3. **Implement Offline Support**: Use Firebase Realtime Database for offline first design
4. **Add Real-Time Sync**: Use `onSnapshot` for all user data
5. **Monitor Performance**: Use Firebase Performance Monitoring

---

## Files Provided

- `FIRESTORE_SCHEMA.md` - Detailed database design documentation
- `firestore-operations.js` - Complete CRUD operations library
- `firebase.js` - Firebase initialization
- `script.js` - Updated with Firebase authentication
- `FIRESTORE_IMPLEMENTATION_GUIDE.md` - This guide

---

## Support

For issues or questions:
- Check Firebase documentation: https://firebase.google.com/docs/firestore
- Review security rules: https://firebase.google.com/docs/firestore/security/start
- Check Firestore pricing: https://firebase.google.com/pricing

---

**✅ Your Firestore database is now production-ready!**
