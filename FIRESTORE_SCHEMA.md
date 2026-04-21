# Firestore Database Design - Student Management Portal

## Analysis Summary

Based on the project analysis, this is a **Student Management Portal** with the following features:

### Key Features Identified:
- ✅ User Authentication (Students & Admins)
- ✅ Timetable Management (Classes, Schedules)
- ✅ Attendance Tracking (Per student, per subject)
- ✅ Announcements (Targeted by dept/section/semester)
- ✅ Study Resources (Documents, Links, Videos)
- ✅ Academic Structure (Departments, Sections)
- ✅ AI Chatbot (Chat conversations, messages)

---

## Database Entities & Relationships

```
users
├── Relationships: Has many timetables, attendances, chats, announcements (read-only)

timetable
├── Relationships: Belongs to users (for filtering), linked to academic_units

attendance
├── Relationships: Belongs to users (student), linked to timetable (implicit by subject)

announcements
├── Relationships: Visible to user groups (by dept/section/semester)

resources
├── Relationships: Assigned to users (by dept/section/semester)

academic_units
├── Relationships: Referenced by users, timetable, attendance, announcements

chats
├── Relationships: Belongs to users, has many messages

messages
├── Relationships: Belongs to chats, sent by users or bot
```

---

## Firestore Collection Structure

```
Firestore Database
│
├── users/
│   └── {userId}/
│       ├── basicInfo
│       ├── academics/
│       │   └── currentEnrollment
│       ├── chats/ (subcollection)
│       │   └── {chatId}/
│       │       ├── metadata
│       │       └── messages/ (subcollection)
│       │           └── {messageId}
│       └── attendance_cache/ (denormalized for performance)
│
├── timetable/
│   └── {timetableId}/
│       ├── classInfo
│       └── scheduling
│
├── attendance/
│   └── {attendanceRecordId}/
│       ├── recordInfo
│       └── timestamps
│
├── attendance_summary/
│   └── {summaryId}/
│       ├── subjectStats
│       └── metrics
│
├── announcements/
│   └── {announcementId}/
│       ├── content
│       └── targeting
│
├── resources/
│   └── {resourceId}/
│       ├── metadata
│       └── accessInfo
│
└── academic_units/
    └── {unitId}/
        └── unitInfo
```

---

## Detailed Collection Schemas

### 1. Users Collection
```json
{
  "users": {
    "{userId}": {
      "email": "student1@college.edu",
      "name": "Rahul Sharma",
      "rollNumber": "21CSE101",
      "role": "STUDENT",
      "createdAt": Timestamp,
      "lastLogin": Timestamp,
      "status": "active",
      
      "academics": {
        "dept": "CSE",
        "section": "A",
        "sem": 4
      },
      
      "settings": {
        "theme": "dark",
        "notifications": true,
        "language": "en"
      }
    }
  }
}
```

### 2. Timetable Collection
```json
{
  "timetable": {
    "{timetableId}": {
      "dayOfWeek": "Monday",
      "periodSlots": "9:00-10:00",
      "subjectName": "Data Structures",
      "roomNumber": "101",
      "facultyName": "Dr. Patel",
      "resourceDetails": "Lecture slides in resources section",
      
      "academicInfo": {
        "dept": "CSE",
        "section": "A",
        "sem": 4
      },
      
      "createdAt": Timestamp,
      "updatedAt": Timestamp
    }
  }
}
```

### 3. Attendance Collection
```json
{
  "attendance": {
    "{attendanceId}": {
      "studentEmail": "student1@college.edu",
      "userId": "{userId}",
      "subjectName": "Data Structures",
      "date": Timestamp,
      "status": "PRESENT",
      
      "academicInfo": {
        "dept": "CSE",
        "section": "A",
        "sem": 4
      },
      
      "recordedAt": Timestamp,
      "recordedBy": "admin@college.edu"
    }
  }
}
```

### 4. Attendance Summary Collection
```json
{
  "attendance_summary": {
    "{summaryId}": {
      "studentEmail": "student1@college.edu",
      "userId": "{userId}",
      "subjectName": "Data Structures",
      "attended": 20,
      "total": 25,
      "thresholdTarget": 75.0,
      "percentage": 80.0,
      
      "academicInfo": {
        "dept": "CSE",
        "section": "A",
        "sem": 4
      },
      
      "lastUpdated": Timestamp
    }
  }
}
```

### 5. Announcements Collection
```json
{
  "announcements": {
    "{announcementId}": {
      "title": "Mid-Term Exams Schedule",
      "body": "Mid-term exams will be held from...",
      "imageUrl": "https://...",
      "date": Timestamp,
      "priority": "high",
      
      "targeting": {
        "targetDept": "ALL",
        "targetDepts": ["CSE", "ECE"],
        "targetSections": ["A", "B"],
        "targetSemesters": [2, 4, 6]
      },
      
      "createdBy": "admin@college.edu",
      "createdAt": Timestamp,
      "updatedAt": Timestamp
    }
  }
}
```

### 6. Resources Collection
```json
{
  "resources": {
    "{resourceId}": {
      "title": "Array and Linked List Tutorial",
      "description": "Comprehensive guide on data structures",
      "resourceType": "DOCUMENT",
      "resourceUrl": "https://...",
      
      "targeting": {
        "dept": "CSE",
        "sections": ["A", "B"],
        "semesters": [3, 4]
      },
      
      "uploadedBy": "admin@college.edu",
      "createdAt": Timestamp,
      "updated At": Timestamp
    }
  }
}
```

### 7. Academic Units Collection
```json
{
  "academic_units": {
    "{unitId}": {
      "dept": "CSE",
      "section": "A",
      "createdBy": "admin@college.edu",
      "createdAt": Timestamp
    }
  }
}
```

### 8. Chats & Messages (Subcollection under users)
```json
{
  "users": {
    "{userId}": {
      "chats": {
        "{chatId}": {
          "title": "Attendance Help",
          "description": "Chat about attendance issues",
          "createdAt": Timestamp,
          "updatedAt": Timestamp,
          "participant Count": 2,
          "lastMessage": "Thanks for the info",
          "lastMessageAt": Timestamp,
          
          "messages": {
            "{messageId}": {
              "text": "What is my current attendance?",
              "sender": "user",
              "senderId": "{userId}",
              "senderName": "Rahul Sharma",
              "timestamp": Timestamp,
              "type": "text",
              "status": "sent",
              "reactions": {
                "👍": ["userId1"],
                "👎": []
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Indexing Strategy

### Composite Indexes:
```
1. attendance
   Fields: studentEmail (Asc), date (Desc), status (Asc)

2. timetable
   Fields: dept (Asc), section (Asc), dayOfWeek (Asc)

3. announcements
   Fields: date (Desc), priority (Asc)

4. resources
   Fields: dept (Asc), resourceType (Asc), createdAt (Desc)
```

### Single Field Indexes:
```
- attendance: studentEmail, date, status
- timetable: dept, section, dayOfWeek
- announcements: date, priority
- resources: dept, resourceType, uploadedBy
- users: email, role, dept
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Chats subcollection
      match /chats/{chatId} {
        allow read, write: if request.auth.uid == userId;
        
        // Messages subcollection
        match /messages/{messageId} {
          allow read, write: if request.auth.uid == userId;
        }
      }
    }
    
    // Admins can read/write timetable
    match /timetable/{timetableId} {
      allow read: if resource.data.dept == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.academics.dept
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users can read attendance records for their subjects
    match /attendance/{attendanceId} {
      allow read: if resource.data.studentEmail == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Attendance summary - users of same dept can read
    match /attendance_summary/{summaryId} {
      allow read: if resource.data.studentEmail == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Read announcements based on targeting
    match /announcements/{announcementId} {
      allow read: if checkAnnouncementAccess(request.auth.uid, resource);
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Read resources based on dept/semester
    match /resources/{resourceId} {
      allow read: if checkResourceAccess(request.auth.uid, resource);
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Academic units - all can read, only admin can write
    match /academic_units/{unitId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Helper functions
    function checkAnnouncementAccess(userId, announcement) {
      let userDoc = get(/databases/$(database)/documents/users/$(userId)).data;
      let depts = announcement.data.targetDepts;
      let sections = announcement.data.targetSections;
      let sems = announcement.data.targetSemesters;
      
      return announcement.data.targetDept == 'ALL' ||
             (depts.size() == 0 || userDoc.academics.dept in depts) &&
             (sections.size() == 0 || userDoc.academics.section in sections) &&
             (sems.size() == 0 || userDoc.academics.sem in sems);
    }
    
    function checkResourceAccess(userId, resource) {
      let userDoc = get(/databases/$(database)/documents/users/$(userId)).data;
      return resource.data.dept == 'ALL' ||
             (resource.data.dept == userDoc.academics.dept &&
              (resource.data.sections.size() == 0 || userDoc.academics.section in resource.data.sections) &&
              (resource.data.semesters.size() == 0 || userDoc.academics.sem in resource.data.semesters));
    }
  }
}
```

---

## Best Practices Applied

✅ **Denormalization**: Cache frequently accessed data (e.g., attendance_cache in user documents)
✅ **Subcollections**: Use for unlimited scalability (messages under chats)
✅ **Timestamp Indexing**: All timestamps indexed for fast queries
✅ **Role-Based Access**: Rules enforce admin vs student permissions
✅ **Composite Indexes**: For common filter combinations
✅ **Security First**: No public access, all filtered by user context
✅ **Scalability**: Can handle millions of records across many users

---

## Migration Notes

### From SQLite to Firestore:
1. User IDs: Use email as document ID (lowercase for consistency)
2. Timestamps: Convert datetime to Firestore Timestamp
3. Many-to-many: Use arrays instead of junction tables
4. Aggregations: Create separate summary documents
5. Sensitive data: Don't store passwords; use Firebase Auth
