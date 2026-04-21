# Tomorrow Demo Runbook

## 1) What is ready

All core demo modules are working:
- Main Student Portal UI + FastAPI backend: `http://127.0.0.1:8000`
- Notification System (Firebase fallback demo mode): `http://127.0.0.1:5000`
- Parent Notification Panel (SQLite): `http://127.0.0.1:5001`

## 2) Demo data files (prepared)

Use these files from this folder:
- `demo_students_bulk_upload.xlsx`
- `demo_students_bulk_upload.csv`
- `demo_timetable_upload.xlsx`
- `demo_attendance_upload.xlsx`
- `demo_announcements_upload.xlsx`
- `demo_notification_students.csv`

## 3) Start commands (run in separate terminals)

From project root:

```powershell
& "c:/Users/DINESH KUMAR/OneDrive/Desktop/ppproject/.venv/Scripts/python.exe" "run_server.py"
```

```powershell
& "c:/Users/DINESH KUMAR/OneDrive/Desktop/ppproject/.venv/Scripts/python.exe" "notification-system/app.py"
```

```powershell
& "c:/Users/DINESH KUMAR/OneDrive/Desktop/ppproject/.venv/Scripts/python.exe" "parent_notification_server.py"
```

## 4) Demo login credentials

Main portal:
- Student: `student1@college.edu` / `password123`
- Admin: `admin@college.edu` / `admin123`

## 5) Main portal admin upload demo sequence

Open `http://127.0.0.1:8000`, login as Admin, then perform:

1. Students bulk upload using `demo_students_bulk_upload.xlsx`.
2. Timetable upload using `demo_timetable_upload.xlsx`.
3. Attendance upload using `demo_attendance_upload.xlsx`.
4. Announcements upload using `demo_announcements_upload.xlsx`.
5. Show dashboard stats update and student view changes.

## 6) Student dashboard chatbot demo sequence

Login as student (`student1@college.edu`) and ask:
- "Hi, what is my profile and attendance?"
- "How is my Data Structures attendance?"
- "What classes do I have today?"
- "Any latest announcements for me?"

Expected: personalized, student-only responses.

## 7) Notification system demo sequence (port 5000)

Open `http://127.0.0.1:5000`:
1. Call/trigger init sample data.
2. Show students list.
3. Mark one student absent.
4. Send announcement.
5. Show attendance report and announcement history.

Note: currently running in local fallback mode for demo if Firebase service key is not present.

## 8) Parent notification panel demo sequence (port 5001)

Open `http://127.0.0.1:5001`:
1. Show students and stats.
2. Mark attendance.
3. Send notification.
4. Open attendance report and history.

## 9) If you need to regenerate demo files

```powershell
& "c:/Users/DINESH KUMAR/OneDrive/Desktop/ppproject/.venv/Scripts/python.exe" "demo_pack/generate_demo_pack.py"
```
