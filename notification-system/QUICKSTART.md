# QUICK START GUIDE

## 🚀 GET RUNNING IN 5 MINUTES

### Prerequisites Installed?
```bash
pip install -r requirements.txt
```

### Step 1: Firebase Setup (2 minutes)
1. Go to Firebase Console
2. Download serviceAccountKey.json
3. Copy to notification-system/ folder

### Step 2: SMS Setup (1 minute)
1. Get API key from Fast2SMS
2. Open sms.py
3. Paste API key: `FAST2SMS_API_KEY = "YOUR_KEY"`

### Step 3: Run Server (30 seconds)
```bash
python app.py
```

### Step 4: Initialize Data (1 minute)
```bash
curl -X POST http://localhost:5000/init-sample-data
```

### Step 5: Test API
```bash
# Get all students
curl http://localhost:5000/students

# Mark attendance
curl -X POST http://localhost:5000/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"student_id":"S001","status":"absent"}'

# Send announcement
curl -X POST http://localhost:5000/announcement/send \
  -H "Content-Type: application/json" \
  -d '{"message":"Tomorrow is a holiday"}'
```

---

## 📚 USE CASES

### Use Case 1: Mark Student Absent
```bash
POST /attendance/mark
{
  "student_id": "S001",
  "status": "absent"
}
```
✅ SMS sent to S001's parent automatically
✅ Notification logged in Firestore

### Use Case 2: Send Important Announcement
```bash
POST /announcement/send
{
  "message": "Parent-teacher meeting Friday at 2 PM"
}
```
✅ SMS sent to ALL parents
✅ Message stored in Firestore
✅ Notification logged for each student

### Use Case 3: Check Student Attendance
```bash
GET /attendance/S001/summary
```
Returns: Total, Present, Absent, Attendance %

---

## 🐛 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| serviceAccountKey not found | Download from Firebase Console > Service Accounts |
| SMS not sending | Check Fast2SMS API key and account credits |
| Port 5000 in use | Change port in app.py or kill process on port 5000 |
| Firestore error | Create collections: students, attendance, announcements |
| No JSON in request | Add header: `Content-Type: application/json` |

---

## 📖 LEARN MORE

- Read [README.md](README.md) for detailed documentation
- Check [SETUP_COMPLETE.md](SETUP_COMPLETE.md) for complete setup guide
- Import [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json) for API testing

---

## ✅ VERIFICATION

After setup, you should be able to:

✅ See API info: `GET http://localhost:5000/`
✅ List students: `GET http://localhost:5000/students`
✅ Mark attendance: `POST /attendance/mark`
✅ Send announcement: `POST /announcement/send`
✅ Check reports: `GET /attendance/report`

---

**All set! 🎉 Start building!**
