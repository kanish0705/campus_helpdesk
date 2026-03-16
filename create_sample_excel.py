"""
Generate a sample Excel file template for timetable upload
Run: python create_sample_excel.py
"""

import pandas as pd

# Sample timetable data
data = {
    'day': ['Monday', 'Monday', 'Tuesday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    'time': ['09:00 AM', '11:00 AM', '09:00 AM', '02:00 PM', '10:00 AM', '09:00 AM', '11:00 AM'],
    'subject': ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Mathematics', 'Physics Lab'],
    'room': ['R-101', 'R-102', 'R-103', 'R-104', 'CS-Lab', 'R-101', 'Physics-Lab'],
    'dept': ['CSE', 'CSE', 'CSE', 'CSE', 'CSE', 'CSE', 'CSE'],
    'section': ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
    'sem': [4, 4, 4, 4, 4, 4, 4]
}

df = pd.DataFrame(data)
df.to_excel('sample_timetable.xlsx', index=False)

print("✅ Created sample_timetable.xlsx")
print("\nColumns in the file:")
print("- day: Day of the week (Monday, Tuesday, etc.)")
print("- time: Class time (09:00 AM, 10:30 AM, etc.)")
print("- subject: Subject name")
print("- room: Room number")
print("- dept: Department code (CSE, ECE, ME, etc.)")
print("- section: Section (A, B, C, etc.)")
print("- sem: Semester number (1-8)")
print("\nYou can modify this file and upload it through the Admin panel.")
