import sqlite3

conn = sqlite3.connect('campus.db')
cursor = conn.cursor()

# Check users with problematic sections
cursor.execute("SELECT email, dept, section FROM users WHERE section LIKE '%,%'")
rows = cursor.fetchall()

if rows:
    print(f"Found {len(rows)} users with comma-separated section values:")
    for email, dept, section in rows:
        print(f"  - {email} ({dept}, section='{section}')")
else:
    print("No users found with comma-separated section values")

# Show all unique section values
cursor.execute("SELECT DISTINCT section FROM users ORDER BY section")
sections = cursor.fetchall()
print(f"\nAll unique section values in database:")
for (section,) in sections:
    print(f"  - '{section}'")

# Check academic_units table
print("\n--- Academic Units Table ---")
cursor.execute("SELECT dept, section FROM academic_units")
units = cursor.fetchall()
for dept, section in units:
    print(f"  {dept}: {section}")

conn.close()
