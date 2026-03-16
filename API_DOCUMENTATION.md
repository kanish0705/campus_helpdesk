# VARUNA - Complete API Documentation
## All GET, POST, PUT, DELETE Endpoints

---

## 🔐 Authentication Endpoints

### Login
- **Method:** `POST`
- **Endpoint:** `/login`
- **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "password": "password123"
  }
  ```
- **Response:** User profile with all details

---

## 📊 Student Endpoints (Authenticated)

### Get Dashboard
- **Method:** `GET`
- **Endpoint:** `/student/dashboard?email=student@college.edu`
- **Response:** Timetable, Announcements, Attendance data

### Get Attendance
- **Method:** `GET`
- **Endpoint:** `/student/attendance?email=student@college.edu`
- **Response:** Overall and subject-wise attendance

### Get Subject Attendance
- **Method:** `GET`
- **Endpoint:** `/student/attendance/{subject_name}?email=student@college.edu`
- **Response:** Specific subject attendance with actionable insights

### Get Timetable
- **Method:** `GET`
- **Endpoint:** `/student/timetable?email=student@college.edu`
- **Response:** Student's weekly timetable

### Quick Sync (ERP Integration)
- **Method:** `POST`
- **Endpoint:** `/student/quick-sync?email=student@college.edu`
- **Response:** Fresh attendance + latest announcements

### Get Announcements
- **Method:** `GET`
- **Endpoint:** `/announcements?dept=CSE` (optional dept filter)
- **Response:** List of announcements

### Chat with VARUNA
- **Method:** `POST`
- **Endpoint:** `/chat`
- **Request Body:**
  ```json
  {
    "message": "What's my attendance?",
    "user_email": "student@college.edu"
  }
  ```
- **Response:** AI-powered assistant response

---

## 📅 Admin: Timetable Management

### Create Timetable Entry
- **Method:** `POST`
- **Endpoint:** `/admin/timetable`
- **Request Body:**
  ```json
  {
    "day_of_week": "Monday",
    "period_slots": "09:00-10:00",
    "subject_name": "Data Structures",
    "room_number": "CS-101",
    "faculty_name": "Dr. Smith",
    "dept": "CSE",
    "section": "A",
    "sem": 3
  }
  ```

### Get All Timetable Entries
- **Method:** `GET`
- **Endpoint:** `/admin/timetable`
- **Response:** All timetable entries with count

### Get Single Timetable Entry
- **Method:** `GET`
- **Endpoint:** `/admin/timetable/{entry_id}`
- **Response:** Specific timetable entry details

### Update Timetable Entry ✅ NEW
- **Method:** `PUT`
- **Endpoint:** `/admin/timetable/{entry_id}`
- **Request Body:** (Same as POST)
  ```json
  {
    "day_of_week": "Tuesday",
    "period_slots": "10:00-11:00",
    "subject_name": "Algorithms",
    "room_number": "CS-102",
    "faculty_name": "Dr. Jones",
    "dept": "CSE",
    "section": "A",
    "sem": 3
  }
  ```
- **Response:** Updated entry confirmation

### Delete Timetable Entry ✅ NEW
- **Method:** `DELETE`
- **Endpoint:** `/admin/timetable/{entry_id}`
- **Response:** Deletion confirmation

---

## 📢 Admin: Announcement Management

### Create Announcement
- **Method:** `POST`
- **Endpoint:** `/admin/announcement`
- **Request Body:**
  ```json
  {
    "title": "Placement Drive Starting",
    "body": "TCS placement drive starts next week. Register ASAP!",
    "target_dept": "CSE",
    "image_url": "https://example.com/image.jpg",
    "priority": "urgent"
  }
  ```

### Get All Announcements (Admin)
- **Method:** `GET`
- **Endpoint:** `/admin/announcements`
- **Response:** All announcements in system

### Get Single Announcement
- **Method:** `GET`
- **Endpoint:** `/admin/announcement/{announcement_id}`
- **Response:** Specific announcement details

### Update Announcement ✅ NEW
- **Method:** `PUT`
- **Endpoint:** `/admin/announcement/{announcement_id}`
- **Request Body:** (Same as POST)
  ```json
  {
    "title": "Updated: Placement Drive",
    "body": "Updated registration deadline: Tomorrow 5 PM",
    "target_dept": "ALL",
    "image_url": "https://example.com/new-image.jpg",
    "priority": "high"
  }
  ```
- **Response:** Updated announcement confirmation

### Delete Announcement ✅ NEW
- **Method:** `DELETE`
- **Endpoint:** `/admin/announcement/{announcement_id}`
- **Response:** Deletion confirmation

---

## 👥 Admin: Attendance Management

### Create/Record Attendance
- **Method:** `POST`
- **Endpoint:** `/admin/attendance?student_email=student@college.edu&subject_name=DSA&attended=8&total=10`
- **Query Parameters:**
  - `student_email` - Student's email
  - `subject_name` - Subject name
  - `attended` - Number of classes attended
  - `total` - Total number of classes
- **Response:** Attendance recorded confirmation

### Get All Attendance Records
- **Method:** `GET`
- **Endpoint:** `/admin/attendance`
- **Response:** All attendance records with pagination info

### Get Student's Attendance Records
- **Method:** `GET`
- **Endpoint:** `/admin/attendance/{student_email}`
- **Response:** All records for specific student

### Update Attendance ✅ NEW
- **Method:** `PUT`
- **Endpoint:** `/admin/attendance/{student_email}/{subject_name}?attended=9&total=10`
- **Query Parameters:**
  - `attended` - Updated attended count
  - `total` - Updated total count
- **Response:** Updated attendance confirmation

### Delete Attendance Record ✅ NEW
- **Method:** `DELETE`
- **Endpoint:** `/admin/attendance/{student_email}/{subject_name}`
- **Response:** Deletion confirmation

---

## 📈 Admin: Statistics

### Get Admin Stats
- **Method:** `GET`
- **Endpoint:** `/admin/stats`
- **Response:** 
  ```json
  {
    "students": 150,
    "timetable_entries": 600,
    "announcements": 45
  }
  ```

---

## 🎯 Summary of DELETE & PUT Operations

### ✅ DELETE Endpoints Added
1. `DELETE /admin/timetable/{entry_id}` - Remove timetable entry
2. `DELETE /admin/announcement/{announcement_id}` - Remove announcement
3. `DELETE /admin/attendance/{student_email}/{subject_name}` - Remove attendance record

### ✅ PUT Endpoints Added
1. `PUT /admin/timetable/{entry_id}` - Update timetable entry with all fields
2. `PUT /admin/announcement/{announcement_id}` - Update announcement content
3. `PUT /admin/attendance/{student_email}/{subject_name}` - Update attendance numbers

### ✅ GET Endpoints Added
1. `GET /admin/timetable` - List all timetable entries
2. `GET /admin/timetable/{entry_id}` - Get specific entry
3. `GET /admin/announcements` - List all announcements (admin view)
4. `GET /admin/announcement/{announcement_id}` - Get specific announcement
5. `GET /admin/attendance` - List all attendance records
6. `GET /admin/attendance/{student_email}` - Get student's records

---

## 🎨 Frontend Features

### Admin Management Views (New)
- **Manage Timetable** - View, Edit, Delete all timetable entries
- **Manage Announcements** - View, Edit, Delete all announcements
- **Manage Attendance** - View, Edit, Delete attendance records

### Edit Modals (New)
- Timetable Editor Modal - Edit day, time, subject, room
- Announcement Editor Modal - Edit title, body, dept, priority
- Attendance Editor Modal - Edit attended/total classes

### Action Buttons
- ✏️ **Edit** button on each record - Opens edit modal
- 🗑️ **Delete** button on each record - Deletes with confirmation
- 🔄 **Refresh** button - Reloads latest data from server

---

## 📱 Navigation Structure

### Desktop Sidebar (Updated)
- Dashboard
- Schedule
- Attendance
- Announcements
- **[NEW] Admin Section:**
  - Manage Timetable
  - Manage Announcements
  - Manage Attendance

### Mobile Bottom Nav
- Home
- Schedule
- Attendance
- Updates
- Logout

---

## 🔄 CRUD Operations Summary

| Feature | CREATE | READ | UPDATE | DELETE |
|---------|--------|------|--------|--------|
| **Timetable** | ✅ POST | ✅ GET | ✅ PUT | ✅ DELETE |
| **Announcements** | ✅ POST | ✅ GET | ✅ PUT | ✅ DELETE |
| **Attendance** | ✅ POST | ✅ GET | ✅ PUT | ✅ DELETE |

---

## 🚀 Example Workflows

### Workflow 1: Update Timetable Entry
```
1. Admin clicks "Manage Timetable"
2. System calls GET /admin/timetable
3. Admin clicks "Edit" on a row
4. Modal opens with current data
5. Admin modifies fields
6. Clicks "Update"
7. System sends PUT /admin/timetable/{id}
8. Success toast shown, table refreshed
```

### Workflow 2: Delete Announcement
```
1. Admin clicks "Manage Announcements"
2. System calls GET /admin/announcements
3. Admin clicks "Delete" on card
4. Confirmation dialog appears
5. Admin confirms
6. System sends DELETE /admin/announcement/{id}
7. Announcement removed from list
```

### Workflow 3: Update Student Attendance
```
1. Admin clicks "Manage Attendance"
2. System calls GET /admin/attendance
3. Admin clicks "Edit" on a record
4. Modal opens with student email, subject (disabled)
5. Admin updates attended/total classes
6. Clicks "Update"
7. System sends PUT /admin/attendance/{email}/{subject}
8. Record updated in attendance summary
```

---

## ✨ Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Request successful
- `404 NOT FOUND` - Resource not found
- `400 BAD REQUEST` - Invalid input
- `405 METHOD NOT ALLOWED` - Wrong HTTP method

---

## 📝 Notes

- All admin endpoints require proper authentication (in production, add JWT tokens)
- PUT operations are full replacements (send all fields)
- DELETE operations show confirmation dialogs to prevent accidents
- All operations show toast notifications (success/error)
- Data is immediately refreshed after any operation
- Validation is performed on client and server side

---

**Last Updated:** March 16, 2026  
**Version:** 3.1 (Complete CRUD with DELETE & PUT)
