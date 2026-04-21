# Running Student Portal with FastAPI on Port 8000

## 🔧 Setup Instructions

### 1. **Install Dependencies**
Make sure you have all required Python packages:
```powershell
pip install fastapi uvicorn sqlalchemy pydantic openpyxl httpx python-multipart
```

### 2. **Start the FastAPI Server on Port 8000**
Run this command in your terminal:
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**What this does:**
- `--reload`: Auto-reloads when code changes (development mode)
- `--host 0.0.0.0`: Accessible from any IP
- `--port 8000`: Runs on port 8000

**Expected output:**
```
Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 3. **Access the Portal**
Open your browser and go to:
```
http://localhost:8000
```

## 🔑 Login Credentials

The system automatically creates these demo users on first login attempt:

| User Type | Email | Password |
|-----------|-------|----------|
| **Admin** | `admin@college.edu` | `admin123` |
| **Student 1** | `student1@college.edu` | `password123` |
| **Student 2** | `student2@college.edu` | `password123` |

## ✅ Verification Steps

### Step 1: Verify Server is Running
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000
```

### Step 2: Test the Login API
Open browser console or use PowerShell:
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"admin@college.edu","password":"admin123"}'
$response.Content | ConvertFrom-Json
```

### Step 3: Check Database
The database is automatically created as `campus.db` in the project root.
```powershell
# List database file
Get-Item campus.db
```

## 🐛 Troubleshooting

### Issue: "Port 8000 is already in use"
**Solution:** Either free up port 8000 or use a different port:
```powershell
# Kill the process using port 8000
Get-Process | Where-Object {$_.Name -eq 'python'} | Stop-Process

# OR use a different port:
uvicorn main:app --reload --port 8001
```
Then update the API URL in `script-fastapi.js` line 8:
```javascript
const API_BASE = 'http://localhost:8001';
```

### Issue: "Login fails with 404 or connection error"
**Solution:** 
1. Check that uvicorn is running on port 8000
2. Verify `index.html` loads `script-fastapi.js` (not `script.js`)
3. Check browser console for CORS or fetch errors
4. Make sure database exists: `campus.db`

### Issue: "Database is empty - no demo users"
**Solution:** The demo users are created automatically when you first try to login. If they're not created:
```powershell
# Run the database check script
python check_db.py
```

Or manually seed the database:
```powershell
python seed_data.py
```

## 📝 What Changed

1. **New Script:** `script-fastapi.js` 
   - Replaces `script.js` (which uses Firebase)
   - Directly calls FastAPI endpoints
   - Works with your current backend setup

2. **Updated index.html**
   - Now loads `script-fastapi.js` instead of `script.js`

3. **API Communication**
   - Frontend → Backend: `http://localhost:8000` (port 8000)
   - Uses FastAPI `/login` endpoint for authentication
   - No Firebase required

## 🚀 API Endpoints Available

All endpoints expect the `email` parameter for authorized requests:

- `POST /login` - User authentication
- `GET /student/dashboard` - Get dashboard data
- `GET /student/attendance-alerts` - Get attendance alerts
- `GET /student/resources` - Get learning resources
- `GET /admin/students` - List students (admin only)
- `POST /admin/announcements` - Create announcements (admin only)
- And many more...

## 💡 Pro Tips

1. **For local development:** Use `--reload` flag to auto-restart on code changes
2. **For production:** Remove `--reload` and use proper ASGI server like Gunicorn
3. **Database persistence:** Data is stored in `campus.db` - SQLite database
4. **Check logs:** All API calls are logged in the terminal running uvicorn

## 📊 Port Summary

| Service | Port | URL |
|---------|------|-----|
| **FastAPI Backend** | 8000 | http://localhost:8000 |
| **Frontend** | Served by FastAPI | Same as backend |

---

**Questions?** Check the console output in VS Code for detailed error messages!
