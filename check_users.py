import sqlite3
import json

conn = sqlite3.connect('campus.db')
cursor = conn.cursor()

# Check users table
cursor.execute("SELECT id, email, name, role, dept, section FROM users ORDER BY id")
users = cursor.fetchall()

print("=== DATABASE USERS ===")
for id, email, name, role, dept, section in users:
    print(f"{id}. {name} ({email})")
    print(f"   Role: {role}, Dept: {dept}, Section: {section}")

print(f"\nTotal users: {len(users)}")

# Check academic units
cursor.execute("SELECT dept, section FROM academic_units")
units = cursor.fetchall()
print(f"\n=== ACADEMIC UNITS ===")
for dept, section in units:
    print(f"{dept}: {section}")

conn.close()
