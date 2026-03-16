# Student Management Portal

A full-stack Student Management Portal using FastAPI (Backend) and HTML/JS (Frontend) with a modern mobile-first design and role-based access control.

## Features

### Student View
- **Personalized Dashboard**: View timetable, announcements, and attendance filtered by department/section/semester
- **Attendance Tracking**: View attendance percentage, safe bunks, and subject-wise breakdown
- **Schedule Management**: Interactive weekly timetable with class details
- **Announcements Feed**: Real-time announcements with priority indicators
- **Smart Assistant**: Chat interface for attendance and schedule inquiries
- **Mobile-First Design**: Fully responsive interface for all devices

### Admin View
- **Complete CRUD Operations**: Create, Read, Update, Delete for Timetable, Announcements, and Attendance
- **Timetable Management**: Manage class schedules across departments and semesters
- **Announcement Management**: Create, edit, and delete announcements with priority levels
- **Attendance Management**: Update and track student attendance records
- **Role-Based Access**: Admin features only visible and accessible to admin users

### Authentication
- **Dual Login System**: Separate credentials for students and admins
- **Role-Based Access Control (RBAC)**: Different UI and features based on user role
- **Session Management**: Frontend session tracking with role verification

## Demo Credentials

### Student Login
- **Email:** `student1@college.edu`
- **Password:** `password123`

### Admin Login
- **Email:** `admin@college.edu`
- **Password:** `admin123`

## Project Structure

```
ppproject/
├── main.py              # FastAPI backend with all endpoints
├── index.html           # Frontend HTML with responsive UI
├── script.js            # Frontend JavaScript with role-based logic
├── seed_data.py         # Database seeder with demo data
├── requirements.txt     # Python dependencies
├── college_data.json    # College data configuration
└── campus.db            # SQLite database (auto-generated)
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Seed the Database

```bash
python seed_data.py
```

This creates:
- 1 admin user (admin@college.edu)
- 5 student users (student1@college.edu, etc.)
- Sample timetable entries
- Sample announcements

### 3. Start the Server

```bash
uvicorn main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`

### 4. Open the Frontend

Open `index.html` in your browser (or use Live Server extension in VS Code).

## Test Accounts

| Role    | Email                  | Password     | Department | Section | Semester |
|---------|------------------------|--------------|------------|---------|----------|
| ADMIN   | admin@college.edu      | admin123     | CSE        | A       | -        |
| STUDENT | student1@college.edu   | password123  | CSE        | A       | 4        |
| STUDENT | student2@college.edu   | password123  | CSE        | A       | 4        |
| STUDENT | student3@college.edu   | password123  | ECE        | B       | 6        |
| STUDENT | student4@college.edu   | password123  | ME         | A       | 2        |
| STUDENT | student5@college.edu   | password123  | CSE        | B       | 4        |

## API Endpoints

### Authentication
| Method | Endpoint  | Description                          |
|--------|-----------|--------------------------------------|
| POST   | /login    | Login with email & password          |

### Student Endpoints
| Method | Endpoint                       | Description                           |
|--------|--------------------------------|---------------------------------------|
| GET    | /student/dashboard             | Get personalized dashboard            |
| GET    | /student/attendance            | Get attendance summary                |
| GET    | /student/attendance/{subject}  | Get subject-specific attendance       |
| GET    | /student/timetable             | Get student's timetable               |
| POST   | /student/quick-sync            | Sync ERP data                         |
| GET    | /announcements                 | Get announcements                     |
| POST   | /chat                          | Chat with assistant                   |

### Admin Endpoints - Timetable
| Method | Endpoint                   | Description                |
|--------|----------------------------|----------------------------|
| POST   | /admin/timetable           | Create timetable entry     |
| GET    | /admin/timetable           | Get all timetable entries  |
| GET    | /admin/timetable/{id}      | Get specific entry         |
| PUT    | /admin/timetable/{id}      | Update timetable entry     |
| DELETE | /admin/timetable/{id}      | Delete timetable entry     |

### Admin Endpoints - Announcements
| Method | Endpoint                        | Description                  |
|--------|--------------------------------|------------------------------|
| POST   | /admin/announcement            | Create announcement          |
| GET    | /admin/announcements           | Get all announcements        |
| GET    | /admin/announcement/{id}       | Get specific announcement    |
| PUT    | /admin/announcement/{id}       | Update announcement          |
| DELETE | /admin/announcement/{id}       | Delete announcement          |

### Admin Endpoints - Attendance
| Method | Endpoint                                    | Description               |
|--------|---------------------------------------------|---------------------------|
| POST   | /admin/attendance?student_email=X&subject=X&attended=X&total=X | Record attendance |
| GET    | /admin/attendance                           | Get all attendance records|
| GET    | /admin/attendance/{email}                   | Get student's attendance  |
| PUT    | /admin/attendance/{email}/{subject}?attended=X&total=X | Update attendance |
| DELETE | /admin/attendance/{email}/{subject}         | Delete attendance         |

## Documentation

- **[LOGIN_GUIDE.md](LOGIN_GUIDE.md)** - Complete login system documentation with test scenarios
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Comprehensive API endpoint documentation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Step-by-step testing instructions

## Technologies Used

- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript
- **UI Design**: Mobile-first responsive design
- **Icons**: Font Awesome 6
- **Database**: SQLite

## Features Summary

### Complete CRUD Operations
✅ **Timetable**: Create, Read, Update, Delete
✅ **Announcements**: Create, Read, Update, Delete  
✅ **Attendance**: Create, Read, Update, Delete

### User Authentication
✅ Student login with personalized dashboard
✅ Admin login with additional management tools
✅ Role-based access control (RBAC)

### Student Features
✅ Personal dashboard with quick stats
✅ Weekly scheduling view
✅ Attendance tracking with percentage calc
✅ Subject-wise attendance breakdown
✅ Announcement feed with priority levels
✅ Smart assistant for Q&A

### Admin Features
✅ Manage all timetable entries
✅ Manage all announcements
✅ Manage all attendance records
✅ View all student data
✅ Full CRUD on all resources

### Mobile Responsive
✅ Fully responsive design
✅ Touch-friendly UI
✅ Works on all screen sizes
✅ Optimized for mobile devices

## Notes

- Admin section is hidden for student users
- Database is auto-generated on first run
- Data persists across server restarts
- All credentials are case-sensitive
- Passwords are currently plain text (demo only)

## Production Considerations

⚠️ **Security:**
- Use password hashing (bcrypt) instead of plain text
- Implement JWT tokens for API authentication
- Add HTTPS/SSL encryption
- Implement CSRF token protection
- Add rate limiting for login attempts

⚠️ **Scalability:**
- Consider using PostgreSQL instead of SQLite
- Implement caching (Redis)
- Add API rate limiting
- Implement request logging

⚠️ **User Experience:**
- Add email verification
- Implement password reset functionality
- Add 2FA (two-factor authentication)
- Add user audit logs
