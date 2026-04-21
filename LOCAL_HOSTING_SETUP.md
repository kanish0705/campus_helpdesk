# 🚀 Local Hosting Guide

Your Student Management Portal is now running locally!

## ✅ Server Status

✅ **Running on:** `http://127.0.0.1:8000`

The FastAPI server is currently active and ready to use.

---

## 📱 Access the Portal

### Option 1: Direct Link
Open your browser and go to:
```
http://127.0.0.1:8000
```

### Option 2: From Your Computer
- Open any web browser
- Type: `localhost:8000`
- Press Enter

---

## 🔑 Login with Demo Accounts

### Admin Account
- **Email:** `admin@college.edu`
- **Password:** `admin123`
- **Access:** Full admin dashboard with management features

### Student Account
- **Email:** `student1@college.edu`
- **Password:** `password123`
- **Access:** Student dashboard with attendance, timetable, announcements

---

## 🎯 Quick Access Links

| Feature | Link |
|---------|------|
| **Portal Home** | [http://127.0.0.1:8000](http://127.0.0.1:8000) |
| **Login API** | [http://127.0.0.1:8000/login](http://127.0.0.1:8000/login) (POST) |
| **Admin Dashboard** | [http://127.0.0.1:8000](http://127.0.0.1:8000) (after login) |

---

## 🛑 To Stop the Server

In the PowerShell terminal where the server is running:

Press: `CTRL + C`

The server will shut down gracefully.

---

## 🔄 To Restart the Server

### Option 1: Using PowerShell Script (Recommended)
```powershell
.\START_SERVER.ps1
```

### Option 2: Using Batch File
```
Double-click START_SERVER.bat
```

### Option 3: Manual Command
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

---

## 📊 What's Available

### Student Features
✅ Dashboard with personalized data
✅ Attendance tracking and alerts
✅ Class timetable
✅ Announcements
✅ Learning resources
✅ Chat with AI assistant (Firebase)

### Admin Features
✅ Manage timetable entries
✅ Create announcements
✅ Manage student records
✅ Bulk student upload (Excel)
✅ View attendance reports
✅ Manage learning resources

---

## 🗄️ Database

**Location:** `campus.db` (in project folder)

- Used: SQLite
- Demo users are auto-created on first login
- Data persists across server restarts

---

## 🔧 Troubleshooting

### Server Won't Start
```powershell
# Kill any existing processes
Get-Process python | Stop-Process -Force

# Install missing dependencies
pip install fastapi uvicorn sqlalchemy pydantic openpyxl python-multipart httpx

# Try again
.\START_SERVER.ps1
```

### "Port 8000 is already in use"
```powershell
# Kill the process using port 8000
Get-Process python | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Restart
.\START_SERVER.ps1
```

### Login Fails
```powershell
# Re-seed the database
python seed_data.py

# Restart server
```

### Can't Access http://127.0.0.1:8000
- Check the terminal shows: `Uvicorn running on http://127.0.0.1:8000`
- Try opening in a different browser
- Try: `http://localhost:8000` instead
- Check Windows Firewall settings

---

## 📝 Environment File (Optional)

To use Groq AI features, create a `.env` file:

```
GROQ_API_KEY=your_key_here
```

If not set, chat features use a placeholder response.

---

## 🌐 Access from Other Devices (Advanced)

To access from other computers on your network:

1. Find your local IP:
```powershell
ipconfig | Select-String "IPv4 Address"
```

2. Use that IP instead (example `192.168.1.100`):
```
http://192.168.1.100:8000
```

⚠️ Requires firewall port 8000 to be open

---

## 📚 API Documentation

Once running, interactive API docs available at:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## ✨ Useful Tips

1. **Auto-reload:** Changes to `main.py` are auto-loaded (server running with `--reload`)
2. **Check logs:** Console shows all requests and errors
3. **Database:** You can edit `campus.db` with SQLite browser if needed
4. **Backup:** Copy `campus.db` to backup before making changes

---

## 🎓 Demo Users

These are automatically created in the database:

| Email | Password | Role | Department |
|-------|----------|------|-----------|
| `admin@college.edu` | `admin123` | ADMIN | ALL |
| `student1@college.edu` | `password123` | STUDENT | CSE |
| `student2@college.edu` | `password123` | STUDENT | ECE |

---

## 📞 Need Help?

Check these files for troubleshooting:
- [LOG IN_DEBUGGING_GUIDE.md](LOG IN_DEBUGGING_GUIDE.md) - Login issues
- [FASTAPI_PORT_8000_GUIDE.md](FASTAPI_PORT_8000_GUIDE.md) - Backend setup
- `main.py` - Server code with detailed comments

---

**🎉 Happy coding! Your portal is ready to use locally!**
