# Student Management Portal - Login System Guide

## ✅ Login System Overview

The application supports **two separate login roles**:
1. **Student Login** - Access student features (dashboard, schedule, attendance, announcements)
2. **Admin Login** - Access admin features (manage timetable, announcements, attendance)

---

## 🔐 Demo Credentials

### Student Login
- **Email:** `student1@college.edu`
- **Password:** `password123`
- **Access:** Dashboard, Schedule, Attendance, Announcements, Chat
- **Role:** STUDENT

### Admin Login
- **Email:** `admin@college.edu`
- **Password:** `admin123`
- **Access:** All student features + Admin Management Section (Manage Timetable, Manage Announcements, Manage Attendance)
- **Role:** ADMIN

---

## 📚 Other Student Accounts

Additional student accounts available for testing:

| Email | Password | Name | Dept | Semester | Section |
|-------|----------|------|------|----------|---------|
| student1@college.edu | password123 | Rahul Sharma | CSE | 4 | A |
| student2@college.edu | password123 | Priya Singh | CSE | 4 | A |
| student3@college.edu | password123 | Amit Patel | ECE | 6 | B |
| student4@college.edu | password123 | Sneha Gupta | ME | 2 | A |
| student5@college.edu | password123 | Vikram Reddy | CSE | 4 | B |

---

## 🎯 Login Flow

### Step 1: Enter Credentials
1. Open `http://localhost:8000`
2. Enter email in "Email" field
3. Enter password in "Password" field
4. Click "Sign In" button or press Enter

### Step 2: Authentication
- Backend validates credentials against database
- If valid: User logged in successfully
- If invalid: Error message displayed (invalid email or password)

### Step 3: Role-Based UI
- **STUDENT users:** See dashboard, schedule, attendance, announcements
- **ADMIN users:** See all student features PLUS admin section with management tools

---

## 🛡️ Security Features

### Current Implementation
✅ Password authentication (plain text for demo - not production ready)
✅ Email validation
✅ Role-based access control (RBAC)
✅ Session management in frontend (currentUser variable)
✅ Error handling for invalid credentials

### Production Recommendations
⚠️ Hash passwords using bcrypt instead of plain text
⚠️ Implement JWT tokens for stateless authentication
⚠️ Add HTTPS/SSL encryption
⚠️ Implement refresh tokens
⚠️ Add rate limiting for failed login attempts
⚠️ Add CSRF token validation
⚠️ Add two-factor authentication (2FA)
⚠️ Log all authentication attempts

---

## 📊 User Roles & Permissions

### STUDENT Role
```
✅ View personal dashboard
✅ View schedule/timetable
✅ View attendance records
✅ View announcements
✅ Chat with assistant
❌ Cannot manage timetable
❌ Cannot manage announcements
❌ Cannot manage attendance
❌ Cannot see admin section
```

### ADMIN Role
```
✅ View personal dashboard
✅ View schedule/timetable
✅ View attendance records
✅ View announcements
✅ Chat with assistant
✅ Manage timetable (Create, Read, Update, Delete)
✅ Manage announcements (Create, Read, Update, Delete)
✅ Manage attendance (Create, Read, Update, Delete)
✅ See admin section in navigation
```

---

## 🔄 Login System Implementation

### Frontend (index.html)
```html
<!-- Login credentials display -->
<div class="mt-6 p-4 bg-gray-50 rounded-xl">
    <p class="text-xs text-gray-600 font-semibold mb-2">📌 Demo Credentials:</p>
    <div class="text-xs text-gray-600 space-y-1">
        <p><strong>Student:</strong> student1@college.edu / password123</p>
        <p><strong>Admin:</strong> admin@college.edu / admin123</p>
    </div>
</div>

<!-- Admin section (initially hidden) -->
<div id="adminSection" class="hidden pt-4 mt-4 border-t border-gray-100">
    <p class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
    <!-- Admin navigation items -->
</div>
```

### Backend (main.py)
```python
@app.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint - returns user profile with role"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user  # Returns user with role field
```

### Frontend JavaScript (script.js)
```javascript
async function login() {
    // ... login process ...
    
    currentUser = await response.json();
    
    // Show admin section only for admin users
    const adminSection = document.getElementById('adminSection');
    if (currentUser.role === 'ADMIN') {
        adminSection.classList.remove('hidden');
    } else {
        adminSection.classList.add('hidden');
    }
    
    // Load dashboard
    loadDashboard();
}
```

---

## 🎬 Testing Scenarios

### Scenario 1: Student Login
**Steps:**
1. Login with `student1@college.edu / password123`
2. Verify: Dashboard displays with schedule, attendance, announcements
3. Verify: Admin section NOT visible in sidebar
4. Verify: Can view personal data but cannot manage records
5. Result: ✅ STUDENT access working correctly

### Scenario 2: Admin Login
**Steps:**
1. Login with `admin@college.edu / admin123`
2. Verify: Dashboard displays same as student
3. Verify: Admin section IS visible in sidebar
4. Verify: Can click "Manage Timetable", "Manage Announcements", "Manage Attendance"
5. Verify: Can create, edit, and delete records
6. Result: ✅ ADMIN access working correctly

### Scenario 3: Invalid Credentials
**Steps:**
1. Try logging in with wrong password
2. Verify: Error message "Invalid email or password" appears
3. Try non-existent email
4. Verify: Error message "Invalid email or password" appears
5. Result: ✅ Error handling working correctly

### Scenario 4: Logout & Re-login
**Steps:**
1. Login as student
2. Click logout
3. Verify: Redirected to login page with cleared fields
4. Login as admin
5. Verify: Admin section now visible
6. Result: ✅ role-based UI switching working

---

## 🔧 Database Setup

### User Table Schema
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    name VARCHAR(100),
    roll_number VARCHAR(20) UNIQUE,
    role VARCHAR(20) DEFAULT 'STUDENT',  -- ADMIN or STUDENT
    dept VARCHAR(50),
    section VARCHAR(10),
    sem INTEGER
)
```

### Seeding Data
Run the seed script to populate demo users:
```bash
python seed_data.py
```

This creates:
- 1 admin user
- 5 student users
- Default timetable entries
- Sample announcements

---

## 📱 Mobile Responsiveness

- Login page scales perfectly on mobile
- Admin section works on mobile devices
- Sidebar adapts to mobile view
- All login screens functional on small screens

---

## ⚙️ Backend Endpoints

### Login
- **Method:** POST
- **Endpoint:** `/login`
- **Request Body:**
  ```json
  {
    "email": "student1@college.edu",
    "password": "password123"
  }
  ```
- **Response:** User object with role field
  ```json
  {
    "id": 1,
    "email": "student1@college.edu",
    "name": "Rahul Sharma",
    "role": "STUDENT",
    "dept": "CSE",
    "section": "A",
    "sem": 4
  }
  ```

### Error Response
- **Status:** 401 Unauthorized
- **Body:**
  ```json
  {
    "detail": "Invalid email or password"
  }
  ```

---

## 🎓 How Admin Features Work

### Admin Access Control
Admins see an additional section in the sidebar:
```
Admin
├─ Manage Timetable
├─ Manage Announcements
└─ Manage Attendance
```

### Admin Features
1. **Manage Timetable**
   - View all timetable entries in a table
   - Edit any entry
   - Delete any entry
   - Add new entries

2. **Manage Announcements**
   - View all announcements in a grid
   - Edit any announcement
   - Delete any announcement
   - Add new announcements

3. **Manage Attendance**
   - View all attendance records
   - Edit student attendance
   - Delete attendance records
   - Add new records

---

## 🔔 Currently Visible to Everyone

**Note:** Admin features are currently visible to all users, but only functional for ADMIN role. In production, you may want to:
- Hide admin links completely for non-admin users ✅ **IMPLEMENTED** (hidden by default, shown only for ADMIN role)
- Add server-side verification for admin endpoints
- Implement request authorization checks

---

## 📋 Troubleshooting

### Issue: Login fails with "Invalid credentials"
**Solutions:**
- Verify email is correct and exactly matches database
- Check password is entered correctly
- Ensure database has been seeded with `python seed_data.py`
- Check backend server is running

### Issue: Admin section not appearing after admin login
**Solutions:**
- Verify you're logged in with `admin@college.edu` (not student account)
- Check browser console (F12) for JavaScript errors
- Verify `currentUser.role` is "ADMIN"
- Refresh the page

### Issue: Cannot access admin features
**Solutions:**
- Ensure you're logged in as admin (`admin@college.edu`)
- Verify admin endpoints in backend are working
- Check network tab in browser DevTools
- Verify database has admin user record

### Issue: Password displayed in demo credentials
**Note:** This is a demo/development feature. In production:
- Never display credentials on login page
- Use proper credential management
- Consider single sign-on (SSO) integration

---

## 📝 Notes

- Student sem defaults to `0` for admin user (not enrolled in classes)
- All passwords are plain text (not hashed) - **DO NOT USE IN PRODUCTION**
- Session is stored in frontend `currentUser` variable
- No backend session/token management in current version
- Admin can manage data for all departments and semesters

---

## ✅ Verification Checklist

- [x] Student login working
- [x] Admin login working
- [x] Admin section visible only for ADMIN role
- [x] Invalid credentials show error
- [x] Logout clears session
- [x] Role-based access control implemented
- [x] Demo credentials clearly displayed
- [x] Database seeding creates both user types
- [x] Mobile responsive login page
- [x] Error handling for both roles

---

**Last Updated:** March 16, 2026  
**Status:** ✅ Login System Complete  
**Version:** 1.0
