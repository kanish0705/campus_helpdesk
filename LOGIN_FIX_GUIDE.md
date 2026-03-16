# Login Issue - Quick Fix Guide

## Issues Found & Fixed ✅

1. **Database tables not being created** ✅
   - Fixed: Added `Base.metadata.create_all(bind=engine)` in main.py

2. **Seed script import errors** ✅
   - Removed non-existent `Resource` model import
   - Fixed attendance field names (total_classes → total, classes_attended → attended)

## Quick Setup Steps

### Step 1: Clear Old Database (if exists)
```powershell
# Remove old database file if it exists
Remove-Item campus.db -ErrorAction SilentlyContinue
```

### Step 2: Install Dependencies
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

### Step 3: Seed Database with Demo Users
```powershell
# Run the seeding script to create tables and add demo users
python seed_data.py
```

You should see output like:
```
🗑️  Dropped and recreated tables...
✅ Added 6 users (1 admin + 5 students)
✅ Added timetable entries...
✅ Added announcements...
✅ Added attendance records...

🎉 Database seeded successfully!

📋 Test Accounts:
👨‍🎓 Student 1: student1@college.edu / password123
👨‍💼 Admin: admin@college.edu / admin123
```

### Step 4: Start the Server
```powershell
# Run FastAPI server
uvicorn main:app --reload
```

Server output should show:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 5: Test Login
Open in browser: `http://127.0.0.1:8000`

**Student Login:**
- Email: `student1@college.edu`
- Password: `password123`
- Admin section should be **HIDDEN**

**Admin Login:**
- Email: `admin@college.edu`
- Password: `admin123`
- Admin section should be **VISIBLE**

---

## Troubleshooting

### Issue: "Invalid credentials" error
**Solution:**
1. Make sure you ran `python seed_data.py` to create demo users
2. Check that credentials match exactly (case-sensitive)
3. Verify campus.db file exists in project folder

### Issue: "Connection error. Ensure server is running"
**Solution:**
1. Verify server is running on http://127.0.0.1:8000
2. Check that API_BASE in script.js is correct: `const API_BASE = 'http://127.0.0.1:8000';`
3. Check browser console (F12) for CORS errors

### Issue: Admin section not showing for admin user
**Solution:**
1. Check that you're logged in with admin@college.edu
2. Open browser DevTools (F12) → Console
3. Check if `currentUser.role` === "ADMIN"
4. Refresh the page

### Issue: Database locked error
**Solution:**
1. Close any other terminals running the server
2. Delete campus.db
3. Run `python seed_data.py` again
4. Start server fresh

---

## Database Files Created

After running `seed_data.py`, you should have:
- `campus.db` - SQLite database with all tables and data
- Tables created:
  - users (with admin and student accounts)
  - timetable (class schedules)
  - announcements
  - attendance_summary

---

## Verification Checklist

- [ ] campus.db file exists in project root
- [ ] Server starts without errors
- [ ] Student login works (student1@college.edu)
- [ ] Admin login works (admin@college.edu)
- [ ] Admin section hidden for students
- [ ] Admin section visible for admins
- [ ] Can view dashboard after login
- [ ] Can view schedule, attendance, announcements

---

## FAQ

**Q: Port 8000 already in use?**
A: Use different port: `uvicorn main:app --reload --port 8001`

**Q: Want to reset all data?**
A: Just run `python seed_data.py` again - it drops and recreates everything

**Q: Can I add more users?**
A: Edit seed_data.py and add to the `users` list, then run it again

**Q: Deployed to production?**
A: Remember to:
- Hash passwords (don't use plain text)
- Use environment variables for secrets
- Switch to PostgreSQL instead of SQLite
- Add proper JWT authentication

---

## Commands Reference

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt

# Seed database
python seed_data.py

# Start server
uvicorn main:app --reload

# Start on different port
uvicorn main:app --reload --port 8001

# Check if port is in use
netstat -ano | findstr :8000
```

---

**Status:** ✅ Login issues fixed - Ready to test!
