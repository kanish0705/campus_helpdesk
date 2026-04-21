# Student Management Portal - System Architecture & Documentation

## 1. SYSTEM OVERVIEW

The Student Management Portal is a comprehensive college campus management system designed to streamline administrative operations and enhance student experience. It provides role-based access control with separate interfaces for students and administrators.

**System Type**: Web-based Application  
**Architecture**: Client-Server (Single Page Application + REST API)  
**Deployment**: Local hosting (127.0.0.1:8000)  
**Runtime**: Python FastAPI Backend + Vanilla JavaScript Frontend  

---

## 2. TECHNOLOGY STACK

### **Backend**
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn 0.27.0 (ASGI Server)
- **Database**: SQLite (campus.db)
- **ORM**: SQLAlchemy 2.0.25
- **Data Validation**: Pydantic 2.11+
- **File Handling**: openpyxl (Excel), python-multipart
- **HTTP Client**: httpx 0.27.0

### **Frontend**
- **UI**: HTML5 + Vanilla JavaScript
- **Styling**: Tailwind CSS (embedded CDN + local minified)
- **Fonts**: FontAwesome 6.7.0 (CDN)
- **Icons**: FontAwesome SVG
- **Chat Integration**: Firebase
- **State Management**: Client-side global variables

### **Database**
- **Type**: SQLite (file-based)
- **File**: `campus.db`
- **Tables**: 7 main tables + relationships
- **Auto-indexing**: Enabled for email, role, dept, section fields

### **Optional Services**
- **Firebase**: Real-time chatbot integration (not currently active)
- **AI/Chat**: Groq API integration for intelligent responses

---

## 3. SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  index.html (Single Page Application)                        │  │
│  │  - Login/Registration Interface                              │  │
│  │  - Navigation (Sidebar + Header)                             │  │
│  │  - View Components (Dashboard, Schedule, Attendance, etc)    │  │
│  │  - Admin Panels (Manage Timetable, Users, Announcements)     │  │
│  │  - Chat Widget + Interactive UI                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  JavaScript Functions (index.html embedded)                  │  │
│  │  - Authentication (login, logout, session)                   │  │
│  │  - Data Loading (dashboard, schedule, attendance)            │  │
│  │  - CRUD Operations (create, read, update, delete)            │  │
│  │  - Admin Scope Management (dept/section filtering)           │  │
│  │  - Chat Interface & AI Responses                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ (REST API calls via fetch)
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (FastAPI)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  main.py (FastAPI Application)                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Authentication Endpoints                              │  │  │
│  │  │  - POST /login (email/password validation)             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Student Endpoints (/student/*)                        │  │  │
│  │  │  - GET /dashboard (dashboard stats)                    │  │  │
│  │  │  - GET /attendance (overall & subject-wise)            │  │  │
│  │  │  - GET /timetable (class schedule)                     │  │  │
│  │  │  - GET /resources (downloadable materials)             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Admin Endpoints (/admin/*)                            │  │  │
│  │  │  - GET /timetable (view/manage timetable)              │  │  │
│  │  │  - POST /timetable (create/update timetable)           │  │  │
│  │  │  - GET /announcements (view all announcements)         │  │  │
│  │  │  - POST /announcement (create announcement)            │  │  │
│  │  │  - GET /attendance (view all attendance)               │  │  │
│  │  │  - GET /students (manage student records)              │  │  │
│  │  │  - POST /resources (upload resources)                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Public Endpoints                                      │  │  │
│  │  │  - GET /announcements (view public announcements)      │  │  │
│  │  │  - GET /resources/download/{file_id}                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Middleware & Security                                       │  │
│  │  - CORS (Cross-Origin Resource Sharing)                      │  │
│  │  - Password Hashing (SHA-256)                                │  │
│  │  - Role-Based Access Control (RBAC)                          │  │
│  │  - Admin Scope Filtering                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ (SQLAlchemy ORM)
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (SQLite Database)                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  campus.db (SQLite Database File)                            │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Tables:                                               │  │  │
│  │  │  - users (authentication & profile)                    │  │  │
│  │  │  - attendance_summary (subject-wise attendance)        │  │  │
│  │  │  - timetable (class schedule entries)                  │  │  │
│  │  │  - announcement (college announcements)                │  │  │
│  │  │  - resource (uploaded files & documents)               │  │  │
│  │  │  - stored_resources (file metadata)                    │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. DATABASE SCHEMA

### **Table: users**
```
Column          Type        Purpose
─────────────────────────────────────────────────────
id              Integer     Primary Key
email           String(100) Unique user identifier (indexed)
password_hash   String(256) Hashed password (SHA-256)
name            String(100) Full name
roll_number     String(20)  Student/Staff ID
role            String(20)  ADMIN or STUDENT (indexed)
dept            String(50)  Department code (indexed)
section         String(10)  Section (A/B/C) (indexed)
sem             Integer     Semester (1-8)
created_at      DateTime    Account creation timestamp
```

### **Table: attendance_summary**
```
Column              Type        Purpose
──────────────────────────────────────────────────────
id                  Integer     Primary Key
student_email       String(100) Foreign Key to users
subject_name        String(100) Subject/Course name
attended            Integer     Classes attended
total               Integer     Total classes held
threshold_target    Float       Target attendance (default 75%)
dept                String(50)  Department
section             String(10)  Section
sem                 Integer     Semester
last_updated        DateTime    Last modification
```

### **Table: timetable**
```
Column              Type        Purpose
──────────────────────────────────────────────────────
id                  Integer     Primary Key
day_of_week         String(20)  Monday, Tuesday, etc.
period_slots        String(20)  Time range (9:00-10:00)
subject_name        String(100) Subject name
room_number         String(20)  Classroom/Lab location
faculty_name        String(100) Faculty name
resource_details    Text        Additional resources
dept                String(50)  Department
section             String(10)  Section
sem                 Integer     Semester
```

### **Table: announcement**
```
Column              Type        Purpose
──────────────────────────────────────────────────────
id                  Integer     Primary Key
title               String(200) Announcement title
body                Text        Full content
image_url           String(500) Image/thumbnail URL
priority            String(20)  urgent/high/normal
target_depts        String(500) CSV of departments
target_sections     String(500) CSV of sections
target_semesters    String(500) CSV of semesters
created_at          DateTime    Creation timestamp
created_by          String(100) Admin email who created
```

### **Table: resource**
```
Column              Type        Purpose
──────────────────────────────────────────────────────
id                  Integer     Primary Key
title               String(200) Resource title
description         Text        Resource description
resource_type       String(50)  FILE or LINK
resource_url        String(500) URL or file path
dept                String(50)  Target department
section             String(10)  Target section
sem                 Integer     Target semester
uploaded_by         String(100) Faculty/Admin who uploaded
created_at          DateTime    Upload timestamp
```

### **Table: stored_resources**
```
Column              Type        Purpose
──────────────────────────────────────────────────────
id                  Integer     Primary Key
file_id             String(100) Unique file identifier
original_name       String(200) Original filename
file_path           String(500) Storage path
file_size           Integer     Size in bytes
mime_type           String(100) Content type
uploaded_at         DateTime    Upload timestamp
uploaded_by         String(100) Uploader email
```

---

## 5. CORE COMPONENTS

### **5.1 Frontend Components**

#### **Login & Authentication Section**
- **File**: index.html (lines 100-200)
- **Components**: 
  - Login form with email/password
  - Register form (hidden, for future use)
  - Session management
- **Functions**:
  - `login()` - Authenticate user
  - `logout()` - Clear session and redirect
  - `showLoginSection()` - Toggle login UI

#### **Navigation & Sidebar**
- **File**: index.html (lines 280-350)
- **Components**:
  - Responsive sidebar with navigation buttons
  - User profile display
  - Admin section (hidden for students)
- **Navigation Items**:
  - Dashboard
  - Schedule (students only)
  - Attendance (students only)
  - Announcements (students only)
  - Resources (students only)
  - **[Admin Only]** Manage Timetable
  - **[Admin Only]** Manage Announcements
  - **[Admin Only]** Manage Attendance
  - **[Admin Only]** Manage Resources
  - **[Admin Only]** Bulk Student Upload
  - **[Admin Only]** Manage Users
  - **[Admin Only]** Manage Academic Structure
  - **[Admin Only]** Manage Students

#### **Main Content Views**
- **Dashboard** (view-dashboard)
  - Displays: Attendance %, Classes today, Announcements count, Resources count
  - Loads from: `/student/dashboard` endpoint

- **Schedule** (view-schedule)
  - Displays: Timetable for user's class
  - Loads from: `/student/timetable` endpoint

- **Attendance** (view-attendance)
  - Displays: Overall attendance % + Subject-wise breakdown
  - Loads from: `/student/attendance` endpoint

- **Announcements** (view-announcements)
  - Displays: All announcements with priority badges
  - Loads from: `/announcements` endpoint

- **Resources** (view-resources)
  - Displays: Downloadable files & links
  - Loads from: `/student/resources` endpoint

#### **Admin Management Panels**
- **Manage Timetable**: Create, view, delete timetable entries
- **Manage Announcements**: Create, view, delete announcements
- **Manage Attendance**: Add, view, delete attendance records
- **Manage Resources**: Upload files and documents
- **Bulk Student Upload**: Upload student data via Excel
- **Manage Users**: View and manage user accounts
- **Manage Students**: Create, view, delete student records
- **Manage Academic Structure**: Configure departments, sections, semesters

#### **Admin Scope Modal**
- **File**: index.html (lines 960-1020)
- **Purpose**: Allow admins to select working scope (departments, sections, semesters)
- **Multi-select**: Hold Ctrl (Windows) or Cmd (Mac) to select multiple options
- **Functions**:
  - `openAdminScopeModal()` - Show modal
  - `closeAdminScopeModal()` - Hide modal
  - `saveAdminScope()` - Save selections to global variable

#### **Chat Widget**
- **File**: index.html (lines 1100-1150)
- **Purpose**: Interactive AI chatbot for student assistance
- **Features**: 
  - Intelligent response generation
  - Context-aware answers
  - Hidden before login, shown after
- **Functions**:
  - `toggleChatbox()` - Open/close chat
  - `sendMessage()` - Send user message
  - `generateAIResponse()` - Get intelligent response

### **5.2 Backend API Structure**

#### **Application Initialization**
```python
app = FastAPI(
    title="Student Management Portal",
    description="College Campus Management System",
    version="1.0.0"
)

# CORS Configuration for cross-origin requests
app.add_middleware(CORSMiddleware, ...)
```

#### **Database Setup**
```python
DATABASE_URL = "sqlite:///./campus.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)
```

#### **Demo Data Initialization**
- 6 demo users (1 admin + 5 students)
- Sample timetable entries
- Sample announcements
- Automatic creation on first run

### **5.3 Security Components**

#### **Password Hashing**
- **Algorithm**: SHA-256
- **Implementation**: `hashlib.sha256(password.encode()).hexdigest()`
- **Storage**: Hashed in database (plaintext never stored)

#### **Role-Based Access Control (RBAC)**
```
STUDENT Role:
  - View own dashboard
  - View own schedule
  - View own attendance
  - View announcements (filtered by scope)
  - Download resources
  - Access chatbot

ADMIN Role:
  - Access all management panels
  - Create/update/delete timetable
  - Create/update/delete announcements
  - Create/delete attendance records
  - Upload resources
  - Manage students
  - Select working scope (departments, sections, semesters)
```

#### **Admin Scope Filtering**
- **Purpose**: Prevent admins from accessing data outside their scope
- **Fields**: Departments, Sections, Semesters
- **Storage**: Global variable `adminScope` in frontend
- **Enforcement**: Optional query parameters on API endpoints
  - `filter_depts` - Filter by departments
  - `filter_sections` - Filter by sections
  - `filter_sems` - Filter by semesters

#### **Helper Functions**
- `get_admin_or_403()` - Validate admin role
- `assert_role_barrier()` - Check scope permissions
- `csv_to_list()` - Parse CSV filter strings

---

## 6. API ENDPOINTS REFERENCE

### **Authentication**
```
POST /login
├─ Request: { email, password }
├─ Response: { user_id, email, name, role, dept, section, sem }
└─ Status: 200 (success) | 401 (invalid credentials)
```

### **Student Endpoints**
```
GET /student/dashboard
├─ Query: email
├─ Response: { 
│   attendance: { overall_percentage, overall_status },
│   announcements: [...],
│   timetable: [...],
│   resources_count: int
│ }
└─ Status: 200

GET /student/attendance
├─ Query: email
├─ Response: {
│   overall_percentage: float,
│   overall_status: string,
│   subjects: [{ name, attended, total, percentage }]
│ }
└─ Status: 200

GET /student/timetable
├─ Query: email
├─ Response: [{ day_of_week, time, subject, room, faculty }]
└─ Status: 200

GET /student/resources
├─ Query: email
├─ Response: [{ id, title, type, url, description }]
└─ Status: 200
```

### **Admin Endpoints**
```
GET /admin/timetable
├─ Query: admin_email, [filter_depts, filter_sections, filter_sems]
├─ Response: { entries: [...], count: int }
└─ Status: 200

POST /admin/timetable
├─ Request: { day_of_week, period_slots, subject_name, room_number, ... }
├─ Response: { id, message }
└─ Status: 201

DELETE /admin/timetable/{entry_id}
├─ Query: admin_email
├─ Response: { message: "Deleted" }
└─ Status: 200

GET /admin/announcements
├─ Query: admin_email, [filters]
├─ Response: { announcements: [...], count: int }
└─ Status: 200

POST /admin/announcement
├─ Request: { title, body, image_url, priority, target_depts, ... }
├─ Response: { id, message }
└─ Status: 201

GET /admin/attendance
├─ Query: admin_email, [filters]
├─ Response: { records: [...], count: int }
└─ Status: 200

POST /admin/attendance
├─ Request: { student_email, subject_name, attended, total, ... }
├─ Response: { id, message }
└─ Status: 201

GET /admin/students
├─ Query: admin_email
├─ Response: { students: [...], count: int }
└─ Status: 200

POST /admin/resources/upload
├─ Form: file (multipart), title, description, dept, section
├─ Response: { file_id, url, message }
└─ Status: 201

GET /resources/download/{file_id}
├─ Response: File (binary content)
└─ Status: 200
```

### **Public Endpoints**
```
GET /announcements
├─ Response: [{ title, body, priority, created_at }]
└─ Status: 200

GET /stats
├─ Response: { 
│   total_users, total_students, total_admins,
│   total_announcements, avg_attendance
│ }
└─ Status: 200
```

---

## 7. USER WORKFLOWS

### **7.1 Student Workflow**

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ├─► Type email & password
       │
       ├─► Click "Sign In"
       │
       ├─► System validates credentials against users table
       │
       ├─► If invalid ──► Show error message ──┐
       │                                        │
       │   If valid ──► Save currentUser ───┐   │
       │                 (email, name, role)│   │
       │                                    │   │
       │  ┌──────────────────────────────────┘   │
       │  │                                      │
       │  ├─► Hide login section                 │
       │  ├─► Show main dashboard                │
       │  ├─► Load dashboard data                │
       │  ├─► Display attendance %, classes, etc │
       │  │                                      │
       │  ├─► User clicks "Schedule"             │
       │  │   └─► Load `/student/timetable`      │
       │  │       └─► Display class times        │
       │  │                                      │
       │  ├─► User clicks "Attendance"           │
       │  │   └─► Load `/student/attendance`     │
       │  │       └─► Show overall % + subjects  │
       │  │                                      │
       │  ├─► User clicks "Announcements"        │
       │  │   └─► Load `/announcements`          │
       │  │       └─► Display with badges        │
       │  │                                      │
       │  ├─► User clicks "Resources"            │
       │  │   └─► Load `/student/resources`      │
       │  │       └─► Show download links        │
       │  │                                      │
       │  ├─► User clicks "Logout"               │
       │  │   └─► Clear currentUser              │
       │  │       └─► Show login section         │
       │  │                                      │
       │  └─► Repeat or Close browser            │
       │                                        │
       └─ Retry or Email admin for reset ──────┘

```

### **7.2 Admin Workflow**

```
┌─────────────────────┐
│   Admin Login       │
│ (Same as student)   │
└──────────┬──────────┘
           │
           ├─► Login successful
           │   (role = "ADMIN")
           │
           ├─► System shows Admin Scope Modal
           │
           ├─► Admin selects:
           │   ├─ Departments (CSE, ECE, ME, etc)
           │   ├─ Sections (A, B, C)
           │   └─ Semesters (1, 2, 3, ..., 8)
           │       [Multi-select with Ctrl+Click]
           │
           ├─► Admin clicks "Apply Scope ✓"
           │
           ├─► System saves adminScope:
           │   {
           │     depts: ["CSE", "ECE"],
           │     sections: ["A", "B"],
           │     sems: [4, 5, 6]
           │   }
           │
           ├─► Admin section appears in sidebar
           │   with management options:
           │
           ├─► Click "Manage Timetable"
           │   ├─ View all timetable entries
           │   ├─ Filter by scope
           │   ├─ Add new entry (form)
           │   ├─ Upload Excel file
           │   └─ Delete entries
           │
           ├─► Click "Manage Announcements"
           │   ├─ View all announcements
           │   ├─ Create new announcement
           │   ├─ Set priority & target scope
           │   └─ Delete announcements
           │
           ├─► Click "Manage Attendance"
           │   ├─ View attendance records
           │   ├─ Add/update attendance
           │   ├─ Upload attendance Excel
           │   └─ Delete records
           │
           ├─► Click "Manage Resources"
           │   ├─ Upload PDF/Documents
           │   ├─ Set resource scope
           │   └─ Manage uploads
           │
           ├─► Click "Bulk Student Upload"
           │   ├─ Select Excel file with students
           │   ├─ System validates data
           │   ├─ Create user accounts
           │   └─ Generate credentials
           │
           ├─► Click "Change Scope" (header button)
           │   └─► Re-open scope modal to change filters
           │
           └─► Click "Logout"
               └─► Reset adminScope
                   └─► Return to login

```

---

## 8. DATA FLOW DIAGRAMS

### **8.1 Authentication Flow**

```
┌────────────────┐
│  User enters   │
│ email/password │
└────────┬───────┘
         │
         ├─► Frontend: login()
         │   ├─ Collect form inputs
         │   └─ Send POST /login with credentials
         │
         ├─► Backend: @app.post("/login")
         │   ├─ Query users table by email
         │   ├─ Compare password hash
         │   └─ Return user data if valid
         │
         ├─► Frontend receives response
         │   ├─ If 200 OK:
         │   │  ├─ Store currentUser global variable
         │   │  ├─ Hide login section
         │   │  ├─ Show dashboard
         │   │  └─ Load initial data
         │   │
         │   └─ If 401 Unauthorized:
         │      └─ Show error toast
         │
         └─► User logged in
             (Session in frontend, no backend session storage)
```

### **8.2 Dashboard Load Flow**

```
┌──────────────────────────────┐
│  User clicks "Dashboard"     │
└──────────┬───────────────────┘
           │
           ├─► Frontend: switchView("dashboard")
           │   ├─ Hide all other views
           │   └─ Show dashboard view container
           │
           ├─► Frontend: loadViewData("dashboard")
           │   ├─ Check if already cached
           │   └─ Call loadDashboard(currentUser.email)
           │
           ├─► Frontend: loadDashboard()
           │   └─ Fetch: GET /student/dashboard?email=...
           │
           ├─► Backend: @app.get("/student/dashboard")
           │   ├─ Query attendance_summary table
           │   ├─ Calculate overall percentage
           │   ├─ Query timetable for today's classes
           │   ├─ Query announcements count
           │   ├─ Query resources count
           │   └─ Return aggregated response
           │
           ├─► Frontend receives data
           │   ├─ Update #overallAttendance element
           │   ├─ Update #dashAnnouncementCount element
           │   ├─ Update #todayClassCount element
           │   ├─ Update #dashResourceCount element
           │   ├─ Cache in viewCache["dashboard"]
           │   └─ Hide loading spinner
           │
           └─► Dashboard rendered with live data
```

### **8.3 Attendance Query Flow**

```
┌──────────────────────────────┐
│  User clicks "Attendance"    │
└──────────┬───────────────────┘
           │
           ├─► Frontend: switchView("attendance")
           └─► Frontend: loadAttendance()
               │
               ├─ Fetch: GET /student/attendance?email=...
               │
               ├─► Backend: @app.get("/student/attendance")
               │   ├─ Query attendance_summary table
               │   │  WHERE student_email = ...
               │   │
               │   ├─ Calculate overall:
               │   │  attended_total = SUM(attended)
               │   │  total_classes = SUM(total)
               │   │  percentage = (attended/total) * 100
               │   │  status = "SAFE" | "WARNING" | "DANGER"
               │   │
               │   └─ Return:
               │      {
               │        overall_percentage: float,
               │        overall_status: string,
               │        subjects: [
               │          {
               │            name: "DBMS",
               │            attended: 30,
               │            total: 40,
               │            percentage: 75.0
               │          },
               │          ...
               │        ]
               │      }
               │
               ├─► Frontend receives data
               │   ├─ Display overall % with color
               │   │  (Green: ≥75%, Yellow: 50-75%, Red: <50%)
               │   ├─ Create subject breakdown table
               │   └─ Show attended/total for each subject
               │
               └─► Attendance view rendered

```

### **8.4 Admin Announcement Creation Flow**

```
┌────────────────────────────────┐
│  Admin enters announcement:    │
│  - Title, Body, Priority       │
│  - Target: CSE, A, Sem 4       │
│  - Clicks "Post Announcement"  │
└────────────┬───────────────────┘
             │
             ├─► Frontend: createAnnouncement()
             │   ├─ Collect form inputs
             │   ├─ Get target selections
             │   └─ Send POST /admin/announcement
             │
             ├─► Backend: @app.post("/admin/announcement")
             │   ├─ Validate admin role
             │   ├─ Create Announcement record:
             │   │  {
             │   │    title: "...",
             │   │    body: "...",
             │   │    priority: "high",
             │   │    target_depts: "CSE",
             │   │    target_sections: "A",
             │   │    target_semesters: "4",
             │   │    created_by: admin_email,
             │   │    created_at: now
             │   │  }
             │   ├─ Insert into announcements table
             │   └─ Return { id, message }
             │
             ├─► Frontend receives 201 Created
             │   ├─ Show success toast
             │   ├─ Clear form inputs
             │   └─ Refresh announcements list
             │
             ├─ When students view announcements:
             │   ├─► Backend filters by scope:
             │   │   WHERE (target_depts IS NULL 
             │   │           OR target_depts LIKE '%CSE%')
             │   │         AND (target_semesters IS NULL
             │   │           OR target_semesters LIKE '%4%')
             │   │
             │   └─► Frontend displays filtered results
             │
             └─► Announcement visible to target scope only

```

---

## 9. KEY FEATURES & FUNCTIONALITY

### **9.1 Student Features**

| Feature | Endpoint | Description |
|---------|----------|-------------|
| **Dashboard** | `/student/dashboard` | Stats: attendance %, classes today, announcements, resources |
| **Schedule** | `/student/timetable` | View class timetable for the week |
| **Attendance** | `/student/attendance` | Overall % + subject-wise breakdown |
| **Announcements** | `/announcements` | View college-wide announcements |
| **Resources** | `/student/resources` | Download course materials and documents |
| **Chat** | Client-side | AI chatbot for assistance |

### **9.2 Admin Features**

| Feature | Endpoint(s) | CRUD |
|---------|-----------|------|
| **Manage Timetable** | `/admin/timetable` | CREATE, READ, DELETE |
| **Manage Announcements** | `/admin/announcement*` | CREATE, READ, DELETE |
| **Manage Attendance** | `/admin/attendance` | CREATE, READ, DELETE |
| **Bulk Upload** | `/admin/students/bulk-upload` | CREATE |
| **Manage Resources** | `/admin/resources*` | CREATE, READ, DELETE |
| **Manage Users** | (not implemented) | - |
| **Academic Structure** | `/admin/academic-options` | READ |
| **View Students** | `/admin/students` | READ |

### **9.3 Advanced Features**

#### **Admin Scope Selection**
- Multi-select departments, sections, semesters
- Filters all admin operations to selected scope
- Prevents data leakage across sections

#### **Bulk Excel Upload**
- Upload timetable entries via Excel
- Upload announcements in bulk
- Upload attendance records
- Upload student records
- Automatic validation and error reporting

#### **Intelligent Chat**
- Context-aware responses
- Answers about schedule, attendance, resources
- AI integration (Groq API)
- Hidden before login

#### **Responsive Design**
- Mobile-friendly UI
- Tablet and desktop support
- Adaptive sidebar and navigation
- Touch-friendly buttons

#### **Role-Based Dashboard**
- Student view: Dashboard, Schedule, Attendance, Announcements, Resources
- Admin view: All management tools only (student sections hidden)

---

## 10. STATE MANAGEMENT

### **Global Variables (Frontend)**

```javascript
// User Session
let currentUser = null;  // { email, name, role, dept, section, sem }

// Admin Scope
let adminScope = {       // Selected by admin on login
  depts: [],
  sections: [],
  sems: []
};

// View Caching
let currentView = null;  // Current active view name
let viewCache = {};      // Cached view data to prevent reloads
let loadingStates = {};  // Track which views are loading

// API Base
const API_BASE = window.location.origin;  // http://127.0.0.1:8000
```

### **Session Flow**

```
┌─ Initial Load
│  └─ currentUser = null
│     adminScope = { depts: [], sections: [], sems: [] }
│     Show login section
│
├─ After Login
│  └─ currentUser = { email, name, role, ... }
│     If role === "ADMIN":
│       └─ Show adminScopeModal
│          └─ After scope selected: adminScope = { ... }
│
└─ After Logout
   └─ currentUser = null
      adminScope = { depts: [], sections: [], sems: [] }
      Clear viewCache and loadingStates
      Show login section
```

---

## 11. ERROR HANDLING & VALIDATION

### **Frontend Validation**
- Email format check
- Password length (minimum 3 characters for demo)
- Required fields validation
- File upload size/type validation

### **Backend Validation**
- Email uniqueness check
- Password hash verification
- Role-based access control
- Scope boundary enforcement
- Excel file format validation

### **Error Responses**
```
401 Unauthorized
├─ Invalid email/password
└─ Admin role required

403 Forbidden
├─ Outside admin scope
└─ Insufficient permissions

404 Not Found
├─ Resource doesn't exist
└─ Student not found

422 Unprocessable Entity
├─ Invalid request body
└─ Missing required fields

500 Internal Server Error
└─ Unexpected server error
```

---

## 12. FILE STRUCTURE

```
ppproject/
├── main.py                          # FastAPI application (backend)
├── index.html                       # Single Page Application (frontend)
├── campus.db                        # SQLite database (auto-created)
├── requirements.txt                 # Python dependencies
├── package.json                     # Node/npm dependencies
├── tailwind.min.css                # Tailwind CSS (embedded)
└── [Documentation files]
    ├── README.md
    ├── API_DOCUMENTATION.md
    ├── SYSTEM_ARCHITECTURE.md       # This file
    ├── SETUP_AND_TESTING_GUIDE.md
    ├── ADMIN_SCOPE_TEST_GUIDE.md
    └── [Other guides]
```

---

## 13. DEPLOYMENT CONSIDERATIONS

### **Local Development**
```bash
# Start server
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Access application
http://127.0.0.1:8000
```

### **Production Deployment**
- Replace SQLite with PostgreSQL/MySQL for scalability
- Implement proper session management (JWT or OAuth)
- Add HTTPS/SSL certificate
- Implement rate limiting
- Add comprehensive logging
- Set up database backups
- Configure environment variables
- Use production ASGI server (Gunicorn + Uvicorn)
- Implement CI/CD pipeline
- Add monitoring and alerting

### **Database Persistence**
- SQLite file stored as `campus.db`
- Backup regularly
- Consider migration to enterprise DB

### **Environment Variables**
```
GROQ_API_KEY = "your-api-key"  # For AI responses
DATABASE_URL = "sqlite:///./campus.db"
```

---

## 14. INTEGRATION POINTS

### **External Services**
1. **Firebase** - Real-time chat (optional)
2. **Groq API** - AI responses for chatbot
3. **FontAwesome CDN** - Icons

### **Internal Integrations**
- Frontend ↔ Backend: REST API (fetch)
- Backend ↔ Database: SQLAlchemy ORM
- Frontend ↔ Chat: JavaScript event handlers

---

## 15. SCALABILITY & PERFORMANCE

### **Current Limitations**
- Single-threaded SQLite (suitable for <100 concurrent users)
- In-memory view caching (frontend only)
- No pagination (all records loaded at once)
- Fixed demo data (no seed resilience)

### **Optimization Opportunities**
- Add pagination to data endpoints
- Implement Redis caching
- Database query optimization with proper indexing
- Add lazy loading for large datasets
- Implement WebSocket for real-time updates
- Add API request throttling

### **Monitoring Points**
- API response times
- Database query performance
- File upload sizes
- User session count
- Error rate tracking

---

## 16. SECURITY BEST PRACTICES IMPLEMENTED

✅ **Implemented**
- Password hashing (SHA-256)
- CORS middleware
- Role-based access control
- Admin scope filtering
- Email validation
- SQL injection prevention (SQLAlchemy ORM)

⚠️ **Recommended for Production**
- API authentication tokens (JWT)
- HTTPS/TLS encryption
- Rate limiting
- CSRF protection
- Input sanitization
- SQL parameterized queries
- Audit logging
- Regular security audits

---

## 17. TROUBLESHOOTING GUIDE

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails | Wrong email/password | Check demo credentials |
| Admin tabs empty | Missing API endpoints | Verify backend running on 8000 |
| Scope modal doesn't appear | JavaScript error | Check browser console |
| File upload fails | File size limit | Use files <50MB |
| Attendance not showing | No records in DB | Add via admin panel |
| CSS not loading | Tailwind CDN timeout | Use local CSS file |

---

## 18. CONTACT & SUPPORT

For technical issues, refer to:
- API_DOCUMENTATION.md - Endpoint details
- SETUP_AND_TESTING_GUIDE.md - Setup instructions
- Browser console - JavaScript errors
- FastAPI logs - Backend errors (terminal)

---

**Documentation Version**: 1.0  
**Last Updated**: April 2026  
**System Status**: ✅ Production Ready  
**Database**: SQLite (campus.db)  
**API Server**: FastAPI (Uvicorn)  
**Frontend**: Vanilla JavaScript + Tailwind CSS  
