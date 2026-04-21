import urllib.request
import json
import urllib.error
import pytest

pytestmark = pytest.mark.skip(reason="Manual integration script; requires externally running server on 8001")

BASE_URL = 'http://127.0.0.1:8001'
ADMIN_EMAIL = 'admin@college.edu'

def test(name, func):
    try:
        result = func()
        status = "✓" if result else "✗"
        print(f"{status} {name}")
        return result
    except Exception as e:
        print(f"✗ {name}: {str(e)}")
        return False

print("\n=== EDIT/DELETE FEATURES TEST ===\n")

# Test 1: Update Academic Unit
def test_update_academic_unit():
    payload = json.dumps({'dept': 'CSE', 'section': 'C'}).encode()
    url = f'{BASE_URL}/admin/academic-options?old_dept=CSE&old_section=B&admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, data=payload, 
                                  headers={'Content-Type': 'application/json'}, 
                                  method='PUT')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True

# Test 2: Update Student
def test_update_student():
    payload = json.dumps({
        'name': 'Updated Student Name',
        'email': 'student1@college.edu',
        'roll_number': '21CSE101',
        'dept': 'CSE',
        'section': 'A',
        'sem': 5
    }).encode()
    url = f'{BASE_URL}/admin/students/student1@college.edu?admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, data=payload,
                                  headers={'Content-Type': 'application/json'},
                                  method='PUT')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True

# Test 3: Delete Academic Unit (first revert the update)
def test_delete_academic_unit():
    # First revert it back
    payload = json.dumps({'dept': 'CSE', 'section': 'B'}).encode()
    url = f'{BASE_URL}/admin/academic-options?old_dept=CSE&old_section=C&admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, data=payload, 
                                  headers={'Content-Type': 'application/json'}, 
                                  method='PUT')
    with urllib.request.urlopen(req) as response:
        pass
    
    # Create a test unit to delete
    payload2 = json.dumps({'dept': 'TEST', 'section': 'X'}).encode()
    url2 = f'{BASE_URL}/admin/academic-options?admin_email={ADMIN_EMAIL}'
    req2 = urllib.request.Request(url2, data=payload2,
                                   headers={'Content-Type': 'application/json'},
                                   method='POST')
    with urllib.request.urlopen(req2) as response:
        pass
    
    # Now delete it
    url3 = f'{BASE_URL}/admin/academic-options?dept=TEST&section=X&admin_email={ADMIN_EMAIL}'
    req3 = urllib.request.Request(url3, method='DELETE')
    with urllib.request.urlopen(req3) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True

# Test 4: Get students for admin scope
def test_get_students_by_scope():
    url = f'{BASE_URL}/admin/students?admin_email={ADMIN_EMAIL}&dept=CSE'
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        students = data.get('students', [])
        # Verify all are from CSE
        return all(s['dept'] == 'CSE' for s in students) and len(students) > 0

# Run tests
tests = [
    ("Update academic unit", test_update_academic_unit),
    ("Update student", test_update_student),
    ("Delete academic unit", test_delete_academic_unit),
    ("Get students by department scope", test_get_students_by_scope),
]

results = [test(name, func) for name, func in tests]

print(f"\n=== RESULTS ===")
print(f"Passed: {sum(results)}/{len(results)}")
if all(results):
    print("✓ ALL EDIT/DELETE FEATURES WORKING")
else:
    print("✗ SOME FEATURES FAILED")
