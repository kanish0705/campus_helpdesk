# Student-Parent Notification System - Setup Guide

## 📋 COMPLETE SETUP INSTRUCTIONS

### 1️⃣ **PREREQUISITES**

- Python 3.8 or higher
- Google Firebase Account
- Fast2SMS Account
- Postman or curl for API testing

---

### 2️⃣ **STEP 1: Clone/Setup Project**

```bash
cd notification-system
```

---

### 3️⃣ **STEP 2: Install Dependencies**

```bash
pip install -r requirements.txt
```

Installed packages:
- `flask` - Web framework
- `firebase-admin` - Firebase SDK
- `requests` - HTTP requests for SMS API
- `flask-cors` - Cross-Origin Resource Sharing
- `python-dotenv` - Environment variables

---

### 4️⃣ **STEP 3: Firebase Setup**

#### Get Firebase Credentials:

1. Go to [Firebase Console](https://firebase.google.com/)
2. Create new project or select existing one
3. Go to: **Project Settings → Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the JSON file as `serviceAccountKey.json`
6. Place it in the `notification-system` directory

```
notification-system/
├── app.py
├── firebase_config.py
├── serviceAccountKey.json  ← Place here
├── sms.py
├── services/
│   ├── attendance_service.py
│   └── announcement_service.py
└── requirements.txt
```

#### Create Firestore Collections:

In Firebase Console → Firestore Database:

**Create Collections:**

1. **students** collection:
   - Document ID: S001, S002, etc.
   - Fields:
     - `name` (string)
     - `parent_phone` (string)
     - `parent_name` (string)
     - `created_at` (timestamp)
     - `status` (string: "active")

2. **attendance** collection:
   - Auto-ID documents
   - Fields:
     - `student_id` (string)
     - `date` (string: YYYY-MM-DD)
     - `status` (string: "present" or "absent")
     - `recorded_at` (timestamp)

3. **announcements** collection:
   - Auto-ID documents
   - Fields:
     - `message` (string)
     - `date` (string: YYYY-MM-DD)
     - `timestamp` (timestamp)
     - `target_audience` (string)

4. **notifications** collection:
   - Auto-ID documents
   - Fields:
     - `student_id` (string)
     - `type` (string: "attendance" or "announcement")
     - `message` (string)
     - `phone_number` (string)
     - `status` (string: "sent", "failed")
     - `timestamp` (timestamp)

---

### 5️⃣ **STEP 4: Fast2SMS Configuration**

1. Sign up at [Fast2SMS](https://www.fast2sms.com/)
2. Get your API key from Dashboard
3. Open `sms.py`
4. Replace:
   ```python
   FAST2SMS_API_KEY = "YOUR_API_KEY_HERE"
   ```

**To find your API key:**
- Log in to Fast2SMS
- Go to Dashboard
- Copy API key from top
- Paste in `sms.py`

---

### 6️⃣ **STEP 5: Run the Application**

```bash
python app.py
```

**Expected Output:**
```
============================================================
🚀 STUDENT-PARENT NOTIFICATION SYSTEM
============================================================

📌 Admin Panel Backend API
📍 Base URL: http://localhost:5000

📚 API Documentation:
   GET  / - View all endpoints
   POST /attendance/mark - Mark attendance
   GET  /attendance/report - Get attendance report
   POST /announcement/send - Send announcement
   GET  /announcement/history - Get announcement history
   GET  /students - Get all students

⚠️  IMPORTANT:
   1. Configure Firebase credentials in firebase_config.py
   2. Set Fast2SMS API key in sms.py
   3. Initialize sample data: POST /init-sample-data
============================================================
```

---

### 7️⃣ **STEP 6: Initialize Sample Data**

**Option A: Using Postman**

1. Open Postman
2. New Request → POST
3. URL: `http://localhost:5000/init-sample-data`
4. Click **Send**

**Option B: Using curl**

```bash
curl -X POST http://localhost:5000/init-sample-data
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sample data initialized successfully",
  "data": {
    "students_created": 5,
    "students": [
      {
        "student_id": "S001",
        "name": "Rahul Sharma",
        "parent_phone": "+919876543210",
        "parent_name": "Mr. Sharma"
      },
      ...
    ]
  }
}
```

---

## 🧪 **TESTING THE SYSTEM**

### Test 1: Get All Students

**Request:**
```
GET http://localhost:5000/students
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Retrieved 5 student(s)",
  "data": {
    "count": 5,
    "students": [...]
  }
}
```

---

### Test 2: Mark Attendance (Absent)

**Request:**
```
POST http://localhost:5000/attendance/mark
Content-Type: application/json

{
  "student_id": "S001",
  "status": "absent"
}
```

**What happens:**
1. ✅ Attendance recorded in Firestore
2. 📤 SMS sent to parent
3. 📊 Notification logged

**Expected Response:**
```json
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

### Test 3: Mark Attendance (Present)

**Request:**
```
POST http://localhost:5000/attendance/mark
Content-Type: application/json

{
  "student_id": "S002",
  "status": "present"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully for Priya Kumar",
  "data": {
    "student_id": "S002",
    "name": "Priya Kumar",
    "status": "present",
    "date": "2024-04-21",
    "notification_sent": false,
    "phone_number": "+919876543211"
  }
}
```

---

### Test 4: Send Announcement

**Request:**
```
POST http://localhost:5000/announcement/send
Content-Type: application/json

{
  "message": "Tomorrow is a holiday. School will be closed."
}
```

**What happens:**
1. ✅ Announcement stored in Firestore
2. 📤 SMS sent to ALL parent phone numbers
3. 📊 Notifications logged for each student

**Expected Response:**
```json
{
  "success": true,
  "message": "Announcement sent to 5 parent(s)",
  "data": {
    "total_parents": 5,
    "sms_sent": 5,
    "sms_failed": 0,
    "message": "Tomorrow is a holiday. School will be closed.",
    "timestamp": "2024-04-21T10:30:45.123456",
    "recipients": [
      {
        "student_id": "S001",
        "student_name": "Rahul Sharma",
        "parent_phone": "+919876543210"
      },
      ...
    ]
  }
}
```

---

### Test 5: Get Attendance Report

**Request:**
```
GET http://localhost:5000/attendance/report?student_id=S001
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Retrieved 2 attendance record(s)",
  "data": {
    "count": 2,
    "records": [
      {
        "student_id": "S001",
        "date": "2024-04-21",
        "status": "absent",
        "recorded_at": "2024-04-21T10:15:30.123456"
      },
      {
        "student_id": "S001",
        "date": "2024-04-20",
        "status": "present",
        "recorded_at": "2024-04-20T09:45:20.654321"
      }
    ]
  }
}
```

---

### Test 6: Get Student Attendance Summary

**Request:**
```
GET http://localhost:5000/attendance/S001/summary
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Attendance summary retrieved",
  "data": {
    "student_id": "S001",
    "student_name": "Rahul Sharma",
    "total_records": 10,
    "present": 8,
    "absent": 2,
    "attendance_percentage": 80.0
  }
}
```

---

## 🚨 **ERROR HANDLING**

### Error: Missing serviceAccountKey.json

```
FileNotFoundError: Service Account Key not found
```

**Solution:**
1. Download `serviceAccountKey.json` from Firebase
2. Place in `notification-system` directory

---

### Error: Invalid Student ID

**Request:**
```
POST http://localhost:5000/attendance/mark
{
  "student_id": "INVALID_ID",
  "status": "absent"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Student INVALID_ID not found",
  "error": "Invalid student ID"
}
```

---

### Error: SMS Sending Failed

**Possible causes:**
1. Invalid Fast2SMS API key
2. Invalid phone number format
3. SMS credit exhausted
4. Network error

**Response:**
```json
{
  "success": false,
  "message": "Failed to send SMS",
  "error": "API error: Invalid API key"
}
```

---

## 📝 **PROJECT STRUCTURE EXPLAINED**

```
notification-system/
│
├── app.py                          # Main Flask application
│   └── Contains all API endpoints
│
├── firebase_config.py              # Firebase setup & database operations
│   └── Database functions (CRUD)
│
├── sms.py                          # SMS integration
│   └── Fast2SMS API calls
│
├── services/                       # Business logic layer
│   ├── attendance_service.py       # Attendance logic
│   └── announcement_service.py     # Announcement logic
│
├── serviceAccountKey.json          # Firebase credentials (download)
│
├── requirements.txt                # Python dependencies
├── README.md                       # This file
└── SETUP.md                        # Setup instructions
```

---

## 🎯 **HOW IT WORKS**

### Attendance Workflow:

```
Admin marks student ABSENT
        ↓
POST /attendance/mark
        ↓
AttendanceService.mark_attendance()
        ↓
Store in Firestore attendance collection
        ↓
Fetch student parent phone
        ↓
Send SMS via Fast2SMS API
        ↓
Log notification in Firestore
        ↓
Return success response
```

### Announcement Workflow:

```
Admin sends announcement
        ↓
POST /announcement/send
        ↓
AnnouncementService.send_announcement()
        ↓
Store in Firestore announcements collection
        ↓
Fetch ALL students phone numbers
        ↓
Send SMS to each parent (bulk)
        ↓
Log each notification
        ↓
Return summary
```

---

## 🔐 **SECURITY NOTES**

For production deployment:

1. **Use Environment Variables:**
   ```python
   from dotenv import load_dotenv
   FAST2SMS_API_KEY = os.getenv('FAST2SMS_API_KEY')
   ```

2. **Add Authentication:**
   ```python
   @app.route('/attendance/mark')
   @require_admin_auth
   def mark_attendance():
       # Only authenticated admins can access
   ```

3. **Use HTTPS:**
   - Deploy on production server with SSL certificate
   - Never use debug mode in production

4. **Rate Limiting:**
   - Add rate limiter to prevent abuse
   - Limit SMS sending to prevent costs

5. **Input Validation:**
   - Sanitize all inputs
   - Validate phone numbers
   - Validate dates

---

## 📚 **LEARNING OUTCOMES**

After completing this project, you'll understand:

✅ Flask API development
✅ Firestore database operations
✅ Third-party API integration (SMS)
✅ REST principles
✅ Error handling
✅ Service-oriented architecture
✅ Logging and monitoring
✅ Database design

---

## ❓ **TROUBLESHOOTING**

### Port 5000 already in use?

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
python app.py --port 5001
```

### Firebase connection timeout?

- Check internet connection
- Verify firewall settings
- Check Firebase service status

### SMS not sending?

- Verify Fast2SMS API key
- Check phone number format
- Verify SMS credits in Fast2SMS account
- Check network connectivity

---

## 📞 **SUPPORT**

For issues or questions:
1. Check error messages carefully
2. Review logs in Firestore console
3. Test API endpoints with Postman
4. Check Firebase security rules
5. Verify credentials are correct

---

**Project completed! 🎉**
