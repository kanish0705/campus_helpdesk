import sqlite3

conn = sqlite3.connect('campus.db')
cursor = conn.cursor()

print("Deleting bad BCA academic unit entry...")
cursor.execute("DELETE FROM academic_units WHERE dept='BCA' AND section LIKE '%,%'")
conn.commit()

print(f"Deleted {cursor.rowcount} rows")

# Verify
cursor.execute("SELECT dept, section FROM academic_units")
units = cursor.fetchall()
print("\nRemaining academic units:")
for dept, section in units:
    print(f"  {dept}: {section}")

conn.close()
