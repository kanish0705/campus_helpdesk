# 🔧 Login Troubleshooting Guide - Step by Step

## ⚠️ IMPORTANT: Debug Steps

### Step 1: Open Browser Console
1. Visit `http://localhost:8000`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. You should see debug logs starting with `🚀` and `📍`

### Step 2: Check if Backend is Running
In the console, run:
```javascript
testDatabase()
```

**Expected output:**
```
✅ Backend response: { service: 'Student Management Portal', version: '3.0', status: 'running', ... }
```

**If you see an error:**
- Backend is NOT running on port 8000
- Check that uvicorn command is still running in PowerShell terminal
- It should show: `Uvicorn running on http://0.0.0.0:8000`

### Step 3: Test Login API Directly
In the console, run:
```javascript
testLogin()
```

**Expected output if database has demo users:**
```
✅ SUCCESS! User: Dr. Admin Kumar Role: ADMIN
```

**If you get an error:**
- Database might be empty (demo users not created)
- Credentials might be wrong
- Backend might have an error

### Step 4: Check Form Elements
In the console, run:
```javascript
console.log('Email input:', document.getElementById('loginEmail'));
console.log('Password input:', document.getElementById('loginPassword'));
console.log('Login button:', document.getElementById('loginButton'));
```

**All three should show an HTML element, not `null`**

If any show `null`, the HTML is broken.

---

## 🚨 Common Issues & Solutions

### Issue 1: "Port 8000 is already in use"
**Error:** `Address already in use`

**Solution:**
```powershell
# Kill other Python processes
Get-Process python | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start uvicorn again
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 2: "Cannot POST /login" (404 error)
**Error:** `HTTP 404`

**What it means:** Backend is running but `/login` endpoint doesn't exist

**Check:**
1. Is `main.py` actually being run? (check for errors in terminal)  
2. Run: `testDatabase()` - does it return backend info?
3. If yes, something is wrong with main.py
4. Check the uvicorn terminal for Python errors

### Issue 3: "Invalid email or password"
**Error:** `HTTP 401 - Invalid email or password`

**Solutions:**
```javascript
// Option 1: Try the exact credentials
testLogin() // Uses admin@college.edu / admin123

// Option 2: Seed fresh demo users
// In PowerShell:
python seed_data.py
```

Then refresh page and try again.

### Issue 4: No Console Logs Appear
**Problem:** Script isn't loading at all

**Check:**
1. Are you on `http://localhost:8000`? (must be exactly this)
2. Open DevTools → Network tab → refresh
3. Look for `script-fastapi.js` - did it download?
4. If red (failed), backend is not serving HTML properly

**Solution:**
```powershell
# Check if index.html exists
Test-Path index.html

# Start uvicorn if not running
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 5: Login Button Does Nothing
**Problem:** Click button, nothing happens

**Check:** In console, try:
```javascript
login() // Call manually
```

If nothing happens:
- The function didn't load
- There's a JavaScript error

Check console for red errors.

---

## 🔍 Detailed Debugging Steps

### Check 1: Verify Backend Route
```powershell
# In PowerShell, test the API directly
$response = curl.exe -X POST `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@college.edu","password":"admin123"}' `
  http://localhost:8000/login

Write-Host $response
```

**Expected:** Returns JSON with user data
**If error:** Backend has the issue

### Check 2: Verify Database Has Users
```powershell
# Check database
python check_db.py

# Or run seed if needed
python seed_data.py
```

### Check 3: Test in Incognito Tab
```
1. Open incognito/private window
2. Go to http://localhost:8000
3. Try login again (clears cache)
```

### Check 4: Clear Browser Cache
```
F12 → Application → Clear Site Data → Clear
```

Then refresh and try again.

---

## ✅ Working Credentials

These MUST exist in database:

| Email | Password | Role |
|-------|----------|------|
| `admin@college.edu` | `admin123` | ADMIN |
| `student1@college.edu` | `password123` | STUDENT |
| `student2@college.edu` | `password123` | STUDENT |

**If login fails**, run:
```powershell
python seed_data.py
```

---

## 📋 Complete Debug Checklist

- [ ] Backend running: `Uvicorn running on http://0.0.0.0:8000` shown in terminal
- [ ] Frontend loads: `http://localhost:8000` shows login page
- [ ] Console loads: `testDatabase()` returns backend info
- [ ] API works: `testLogin()` returns user data
- [ ] Database exists: `campus.db` file exists in project folder
- [ ] Demo users exist: Run `python check_db.py` to verify
- [ ] No JavaScript errors in console (red messages)
- [ ] Login form elements exist (check with Step 4 above)

---

## 🎯Quick Fix (Run All)

```powershell
# 1. Stop uvicorn (Ctrl+C in terminal)
# 2. Kill any Python processes  
Get-Process python | Stop-Process -Force

# 3. Re-seed database
python seed_data.py

# 4. Start backend fresh
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 5. Open browser (new tab or incognito)
# 6. Go to http://localhost:8000
# 7. Open console (F12)
# 8. Run testLogin()
```

---

## 📞 Still Not Working?

Provide these details when asking for help:

1. **Error message from console** (screenshot)
2. **Output of testDatabase()** 
3. **Output of testLogin()**
4. **Terminal output** from uvicorn (any red errors?)
5. **Does `campus.db` exist?**
6. **Output of `python check_db.py`**

Copy-paste all details for faster debugging!
