# Local Hosting Instructions

## ✅ Server Status
Your application is now **RUNNING LOCALLY** on port 8000

## 🌐 Access Points

### Web Application
- **URL**: http://localhost:8000
- **Local Network**: http://127.0.0.1:8000
- **Your Computer**: http://[YOUR-IP]:8000 (for other devices on network)

### API Endpoints
- **Base API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 👤 Demo Credentials

### Admin Account
- **Email**: admin@college.edu
- **Password**: admin123

### Student Accounts
- **student1@college.edu** / password123
- **student2@college.edu** / password123
- **student3@college.edu** / password123

## 📋 Features Available

### Admin Panel
✓ Manage Department/Section (Create, Edit, Delete)
✓ Manage Students (Create, View by Scope, Edit, Delete)
✓ Manage Timetable
✓ Manage Announcements
✓ Manage Attendance
✓ Manage Resources
✓ Sliding Navigation Sidebar

### Student Portal
✓ Dashboard with attendance overview
✓ Class schedule (timetable)
✓ Attendance tracking
✓ View announcements
✓ Access resources
✓ Chat with intelligent assistant (disabled for admins)

## 🔧 Server Information

**Framework**: FastAPI (Python)
**Frontend**: HTML/CSS/JavaScript with Tailwind CSS
**Database**: SQLite (campus.db)
**Port**: 8000
**Address**: 0.0.0.0 (all interfaces)

## 📁 Project Structure

```
ppproject/
├── main.py              # FastAPI backend
├── index.html           # Frontend UI
├── script.js            # Frontend logic
├── campus.db            # SQLite database
├── college_data.json    # College information
└── requirements.txt     # Python dependencies
```

## 🚀 Quick Test

Try these API calls:

```bash
# Login as admin
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Get available departments & sections
curl "http://localhost:8000/admin/academic-options?admin_email=admin@college.edu"

# List all students
curl "http://localhost:8000/admin/students?admin_email=admin@college.edu"
```

## ⚙️ Stopping the Server

To stop the server, press `Ctrl+C` in the terminal where it's running, or run:
```bash
taskkill /F /IM python.exe
```

## 🔄 Restarting the Server

```bash
cd "c:\Users\DINESH KUMAR\OneDrive\Desktop\ppproject"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 Database

The application uses SQLite with the following tables:
- **users**: Admin and student accounts
- **timetable**: Class schedules
- **announcements**: College announcements
- **attendance**: Attendance records
- **resources**: Course materials
- **academic_units**: Department/section combinations

All data is persisted in `campus.db`

## 🎯 Next Steps

1. Open http://localhost:8000 in your browser
2. Login with credentials above
3. Explore the admin or student portal
4. Create new departments, sections, and students as needed

---

**Server is active and ready to use!** ✅
