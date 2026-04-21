# ARCHITECTURE & DESIGN DOCUMENT

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    API CLIENT (Postman/curl)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP Request
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    FLASK APPLICATION (app.py)              │
│                   API Routes & Endpoints                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /attendance/mark - Mark Student Attendance      │  │
│  │ GET  /attendance/report - Get Attendance Records     │  │
│  │ GET  /attendance/<id>/summary - Get Summary Stats    │  │
│  │ POST /announcement/send - Send Broadcast Message     │  │
│  │ GET  /announcement/history - Get Past Announcements  │  │
│  │ GET  /students - List All Students                   │  │
│  │ POST /init-sample-data - Initialize Test Data        │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ├──────────────────────┬──────────────────────┐
                           │                      │                      │
                           ↓                      ↓                      ↓
        ┌──────────────────────────┐  ┌──────────────────────┐  ┌──────────────┐
        │   DATABASE LAYER         │  │   SERVICE LAYER      │  │  SMS LAYER   │
        │  (firebase_config.py)    │  │  (services/)         │  │  (sms.py)    │
        │                          │  │                      │  │              │
        │ ┌────────────────────┐  │  │ AttendanceService   │  │ send_sms()   │
        │ │ Firestore Client   │  │  │ AnnouncementService │  │ send_bulk()  │
        │ │ - init_firebase()  │  │  │                      │  │              │
        │ │ - get_firestore()  │  │  │ Business Logic:      │  │ Fast2SMS API │
        │ │ - add_student()    │  │  │ - Validate input     │  │              │
        │ │ - get_student()    │  │  │ - Call DB functions  │  │              │
        │ │ - get_all_students │  │  │ - Trigger SMS        │  │              │
        │ │ - record_attendance│  │  │ - Log notifications  │  │              │
        │ │ - store_announcement                            │  │              │
        │ │ - log_notification │  │  │                      │  │              │
        │ │ - initialize_data()│  │  │                      │  │              │
        │ └────────────────────┘  │  │                      │  │              │
        └──────────────────────────┘  └──────────────────────┘  └──────────────┘
                           │                      │                      │
                           │                      │                      │
                           ↓                      ↓                      ↓
        ┌──────────────────────────────────────────────────────────────────┐
        │                    EXTERNAL SERVICES                            │
        │                                                                  │
        │  ┌────────────────────────────┐  ┌────────────────────────────┐ │
        │  │  Google Firebase/Firestore │  │    Fast2SMS API            │ │
        │  │  ✓ Cloud Database          │  │    ✓ SMS Delivery Service  │ │
        │  │  ✓ Real-time Sync          │  │    ✓ Phone validation      │ │
        │  │  ✓ Secure Access           │  │    ✓ Bulk messaging        │ │
        │  │  ✓ Collections:            │  │                            │ │
        │  │    - students              │  │  Sends SMS to parent phones│ │
        │  │    - attendance            │  │  for:                      │ │
        │  │    - announcements         │  │  ✓ Absence notifications   │ │
        │  │    - notifications         │  │  ✓ Broadcast announcements │ │
        │  └────────────────────────────┘  └────────────────────────────┘ │
        └──────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAMS

### Flow 1: Mark Student Absent

```
Admin marks Student ABSENT
          │
          ↓
    parse JSON request
          │
          ↓
  validate student_id exists
          │
          ↓
AttendanceService.mark_attendance()
          │
          ├─→ record_attendance() → Store in Firestore
          │
          ├─→ get_student() → Fetch parent phone
          │
          ├─→ send_attendance_notification()
          │      │
          │      └─→ send_sms()
          │           │
          │           └─→ Fast2SMS API
          │               │
          │               └─→ Parent receives SMS
          │
          └─→ log_notification() → Log in Firestore
          
          ↓
    return success response
          │
          ↓
     Admin sees result
```

---

### Flow 2: Send Announcement to All Parents

```
Admin sends message
          │
          ↓
    parse JSON request
          │
          ↓
AnnouncementService.send_announcement()
          │
          ├─→ store_announcement() → Save to Firestore
          │
          ├─→ get_all_students() → Fetch all student records
          │
          ├─→ extract phone numbers
          │
          ├─→ send_bulk_sms()
          │      │
          │      └─→ For each parent phone:
          │           │
          │           ├─→ send_sms()
          │           │   │
          │           │   └─→ Fast2SMS API
          │           │       │
          │           │       └─→ Parent receives SMS
          │           │
          │           └─→ log_notification()
          │
          └─→ compile results summary
          
          ↓
    return response with stats
          │
          ↓
     Admin sees sent/failed count
```

---

### Flow 3: Get Attendance Report

```
Admin requests report
          │
          ↓
    GET /attendance/report?student_id=S001
          │
          ↓
AttendanceService.get_attendance_report()
          │
          ├─→ Query Firestore
          │   └─→ WHERE student_id == 'S001'
          │
          ├─→ Retrieve matching documents
          │
          └─→ Format results
          
          ↓
    return attendance records
          │
          ↓
  Admin sees complete history
```

---

## 🔄 REQUEST-RESPONSE CYCLE

### Example: Mark Attendance

**Request:**
```http
POST /attendance/mark HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "student_id": "S001",
  "status": "absent"
}
```

**Processing Pipeline:**
```
1. Flask receives POST request
2. Extract JSON body
3. Validate required fields
4. Call AttendanceService.mark_attendance(student_id, status)
   │
   ├─ Fetch student from Firestore
   ├─ Save attendance record to Firestore
   ├─ Send SMS to parent phone
   ├─ Log notification record
   │
   └─ Return result dict
5. Convert dict to JSON response
6. Return HTTP 200 with JSON
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Attendance marked successfully for Rahul Sharma",
  "data": {
    "student_id": "S001",
    "name": "Rahul Sharma",
    "status": "absent",
    "date": "2024-04-21",
    "notification_sent": true,
    "phone_number": "+919876543210"
  }
}
```

---

## 📁 FILE PURPOSE MATRIX

| File | Purpose | Key Components |
|------|---------|-----------------|
| **app.py** | Main Flask application | Routes, endpoints, error handlers |
| **firebase_config.py** | Database initialization & operations | Firebase setup, CRUD functions |
| **sms.py** | SMS service integration | Fast2SMS API calls, validation |
| **services/attendance_service.py** | Attendance business logic | Mark attendance, send SMS |
| **services/announcement_service.py** | Announcement business logic | Broadcast messages, bulk SMS |
| **requirements.txt** | Python dependencies | Package versions |
| **setup_data.py** | Sample data initialization | Create 5 test students |
| **POSTMAN_COLLECTION.json** | API test cases | Pre-configured requests |
| **README.md** | Complete documentation | Full guide and reference |
| **QUICKSTART.md** | Quick start guide | 5-minute setup |
| **SETUP_COMPLETE.md** | Detailed setup | Step-by-step instructions |

---

## 🔐 SECURITY ARCHITECTURE

## Current Implementation:
```
┌─────────────────────────────────────────────┐
│  API Endpoints (No Auth Currently)          │
│  ⚠️ For Educational Purposes Only           │
└─────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│  Input Validation                           │
│  ✓ Check required fields                    │
│  ✓ Validate student_id exists               │
│  ✓ Validate status values                   │
│  ✓ Check message not empty                  │
└─────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│  Firestore Access                           │
│  ✓ Firebase Admin SDK Authentication       │
│  ✓ Service Account Key required             │
│  ✓ Collections have default rules           │
└─────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────┐
│  SMS API Access                             │
│  ✓ API Key is confidential                  │
│  ✓ Phone number validation                  │
│  ✓ Message length validation                │
└─────────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Development (Current):
```
Local Machine
├── Python 3.8+
├── Flask server (http://localhost:5000)
├── Firestore (Cloud)
└── Fast2SMS API (Cloud)
```

### Production (Recommended):
```
Cloud Platform (Heroku/Google Cloud/AWS)
├── Python runtime
├── Flask with gunicorn
├── Firestore (Cloud)
├── Fast2SMS API (Cloud)
├── Environment variables
├── HTTPS/SSL
├── Rate limiting
├── Logging/Monitoring
└── Backup strategy
```

---

## 📈 SCALABILITY CONSIDERATIONS

| Component | Limit | Solution |
|-----------|-------|----------|
| Firestore Reads | 50K/day free | Upgrade to paid tier |
| Firestore Writes | 20K/day free | Implement caching |
| SMS Sending | Limited by credits | Implement queue system |
| Concurrent Requests | Flask default | Use WSGI server (gunicorn) |
| Response Time | Depends on API | Add request caching |

---

## 🎯 DESIGN PRINCIPLES

### 1. **Separation of Concerns**
```
Request → Route (app.py)
       → Service (services/)
       → Database (firebase_config.py)
       → Response
```

### 2. **Reusability**
```
sms.send_sms()
├─ Used by attendance_service
├─ Used by announcement_service
└─ Used independently
```

### 3. **Single Responsibility**
```
app.py          → Route handling
firebase_config → Database operations
sms.py          → SMS operations
*_service.py    → Business logic
```

### 4. **Error Handling**
```
Validate Input
    ↓
Execute Logic
    ↓
Log Results
    ↓
Return Response (Success/Error)
```

---

## 🧪 TESTING LAYERS

### 1. Unit Testing (Per Function)
```python
# Test firebase_config functions
test_add_student()
test_get_student()
test_record_attendance()

# Test sms functions
test_send_sms()
test_send_announcement_notification()

# Test services
test_mark_attendance()
test_send_announcement()
```

### 2. Integration Testing (End-to-End)
```
POST /attendance/mark
→ Validate input
→ Query Firestore
→ Call SMS API
→ Log notification
→ Return response
```

### 3. API Testing (HTTP Layer)
```
Using Postman:
- Request/Response validation
- Status code verification
- JSON schema validation
- Error case testing
```

---

## 📊 DATABASE SCHEMA RELATIONSHIPS

```
┌──────────────────┐
│    students      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ parent_phone     │
│ parent_name      │
│ created_at       │
│ status         ──┬─────────────────────┐
└──────────────────┘                     │
                                         │
                     ┌─────────────────────────────┐
                     │    attendance               │
                     ├─────────────────────────────┤
                     │ id (PK)                    │
                     │ student_id (FK)           ←┘
                     │ date                        │
                     │ status                      │
                     │ recorded_at               ──┬─────────────────┐
                     └─────────────────────────────┘                 │
                                                                     │
                     ┌──────────────────────────────────────────────┤
                     │                                              │
   ┌─────────────────────────┐          ┌──────────────────────┐  │
   │   announcements         │          │   notifications      │  │
   ├─────────────────────────┤          ├──────────────────────┤  │
   │ id (PK)                 │          │ id (PK)              │  │
   │ message                 │          │ student_id (FK)  ←───┘  │
   │ date                    │          │ type                 │
   │ timestamp               │          │ message              │
   │ target_audience         │          │ phone_number         │
   └─────────────────────────┘          │ status               │
                                        │ timestamp            │
                                        └──────────────────────┘
```

---

## 🎓 EDUCATIONAL VALUE

### Concepts Covered:
1. **Backend Development** - Flask framework
2. **Database Design** - Firestore schema
3. **API Design** - RESTful principles
4. **Integration** - Third-party APIs
5. **Error Handling** - Graceful failures
6. **Logging** - Audit trails
7. **Testing** - API testing
8. **Documentation** - Code comments
9. **Architecture** - Layered design
10. **Security** - Input validation

### Relevant for Viva:
- Explain architecture clearly
- Discuss design decisions
- Demonstrate code organization
- Show real-world patterns
- Discuss scalability options
- Explain technology choices

---

## 📚 EXTENSION IDEAS

### Level 1 (Easy):
- Add email notifications
- Add SMS templates
- Add date filtering

### Level 2 (Medium):
- Add class-specific announcements
- Add attendance analytics
- Add parent login
- Add SMS confirmation

### Level 3 (Hard):
- Add WhatsApp integration
- Add scheduled messages
- Add parent app backend
- Add performance analytics

---

**This architecture is designed for clarity, scalability, and educational value. 🎯**
