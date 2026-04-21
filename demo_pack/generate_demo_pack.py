from pathlib import Path
from openpyxl import Workbook
import csv

BASE = Path(__file__).resolve().parent
BASE.mkdir(parents=True, exist_ok=True)


def write_xlsx(path: Path, headers, rows):
    wb = Workbook()
    ws = wb.active
    ws.append(headers)
    for row in rows:
        ws.append(row)
    wb.save(path)


# 1) Students bulk upload (CSV + XLSX)
students_headers = ["name", "email", "roll_number", "department", "section", "semester"]
students_rows = [
    ["Ananya Rao", "ananya.rao@college.edu", "24CSE301", "CSE", "A", 3],
    ["Karthik N", "karthik.n@college.edu", "24CSE302", "CSE", "A", 3],
    ["Meera Iyer", "meera.iyer@college.edu", "24CSE303", "CSE", "A", 3],
    ["Rohit S", "rohit.s@college.edu", "24CSE304", "CSE", "A", 3],
    ["Nisha P", "nisha.p@college.edu", "24CSE305", "CSE", "A", 3],
]

with (BASE / "demo_students_bulk_upload.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(students_headers)
    writer.writerows(students_rows)

write_xlsx(BASE / "demo_students_bulk_upload.xlsx", students_headers, students_rows)

# 2) Timetable upload (row format)
timetable_headers = [
    "day_of_week",
    "period_slots",
    "subject_name",
    "room_number",
    "faculty_name",
    "resource_details",
    "dept",
    "section",
    "sem",
]
timetable_rows = [
    ["Monday", "09:00-10:00", "Data Structures", "CSE-A-101", "Prof. Arun", "Unit-1 revision", "CSE", "A", 3],
    ["Monday", "10:00-11:00", "DBMS", "CSE-A-102", "Prof. Meena", "ER model worksheet", "CSE", "A", 3],
    ["Tuesday", "09:00-10:00", "Operating Systems", "CSE-A-103", "Prof. Ravi", "Process scheduling", "CSE", "A", 3],
    ["Wednesday", "11:15-12:15", "Computer Networks", "CSE-A-104", "Prof. Kiran", "OSI model", "CSE", "A", 3],
    ["Thursday", "13:00-14:00", "Software Engineering", "CSE-A-105", "Prof. Suma", "Use-case exercise", "CSE", "A", 3],
    ["Friday", "14:00-15:00", "Data Structures Lab", "CSE-LAB-1", "Prof. Arun", "Linked list coding", "CSE", "A", 3],
]
write_xlsx(BASE / "demo_timetable_upload.xlsx", timetable_headers, timetable_rows)

# 3) Attendance summary upload
attendance_headers = ["student_email", "subject_name", "attended", "total", "dept", "section", "sem"]
attendance_rows = [
    ["ananya.rao@college.edu", "Data Structures", 24, 30, "CSE", "A", 3],
    ["karthik.n@college.edu", "Data Structures", 21, 30, "CSE", "A", 3],
    ["meera.iyer@college.edu", "Data Structures", 27, 30, "CSE", "A", 3],
    ["rohit.s@college.edu", "DBMS", 20, 28, "CSE", "A", 3],
    ["nisha.p@college.edu", "Operating Systems", 25, 29, "CSE", "A", 3],
]
write_xlsx(BASE / "demo_attendance_upload.xlsx", attendance_headers, attendance_rows)

# 4) Announcements upload
announcement_headers = [
    "title",
    "body",
    "priority",
    "image_url",
    "target_dept",
    "target_depts",
    "target_sections",
    "target_semesters",
]
announcement_rows = [
    [
        "Mid-Sem Exam Schedule Released",
        "Mid-sem exams start from next Monday. Check department notice board for timings.",
        "high",
        "",
        "ALL",
        "CSE,ECE,ME",
        "A,B",
        "3,4,5",
    ],
    [
        "Placement Aptitude Workshop",
        "Aptitude workshop on Saturday 10 AM in Seminar Hall.",
        "normal",
        "",
        "CSE",
        "CSE",
        "A",
        "3",
    ],
]
write_xlsx(BASE / "demo_announcements_upload.xlsx", announcement_headers, announcement_rows)

# 5) Notification-system sample student data (CSV)
notif_headers = ["student_id", "name", "parent_phone", "parent_name"]
notif_rows = [
    ["S101", "Aarav Menon", "+919900001001", "Mr. Menon"],
    ["S102", "Isha Verma", "+919900001002", "Mrs. Verma"],
    ["S103", "Dev Patel", "+919900001003", "Mr. Patel"],
]
with (BASE / "demo_notification_students.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(notif_headers)
    writer.writerows(notif_rows)

print("Demo pack generated in:", BASE)
