import urllib.request
import json
import urllib.error
import pytest

pytestmark = pytest.mark.skip(reason="Manual integration script; requires externally running server on 8001")

BASE_URL = 'http://127.0.0.1:8001'
ADMIN_EMAIL = 'admin@college.edu'

def test_feature(name, test_func):
    """Helper to run and report tests"""
    try:
        result = test_func()
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
        return result
    except Exception as e:
        print(f"✗ ERROR: {name} - {str(e)}")
        return False

# Test 1: Academic Options Endpoint
def test_academic_options():
    url = f'{BASE_URL}/admin/academic-options?admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        # Check structure
        assert 'departments' in data
        assert 'sections' in data
        assert 'dept_sections' in data
        assert len(data['departments']) > 0
        return True

# Test 2: Create New Department/Section
def test_create_academic_unit():
    url = f'{BASE_URL}/admin/academic-options?admin_email={ADMIN_EMAIL}'
    payload = json.dumps({'dept': 'AIML', 'section': 'X'}).encode()
    req = urllib.request.Request(url, data=payload, 
                                  headers={'Content-Type': 'application/json'}, 
                                  method='POST')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True

# Test 3: Student List (no filter)
def test_list_students():
    url = f'{BASE_URL}/admin/students?admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        assert 'students' in data
        assert len(data['students']) > 0
        return True

# Test 4: Student List with Department Filter
def test_filter_students_by_dept():
    url = f'{BASE_URL}/admin/students?admin_email={ADMIN_EMAIL}&dept=CSE'
    req = urllib.request.Request(url, method='GET')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        students = data.get('students', [])
        # All returned students should be from CSE
        return all(s['dept'] == 'CSE' for s in students) and len(students) > 0

# Test 5: Create Student
def test_create_student():
    payload = {
        'name': 'Test New Student',
        'email': 'testneew123@college.edu',
        'roll_number': 'TEST24001',
        'dept': 'CSE',
        'section': 'A',
        'sem': 3
    }
    url = f'{BASE_URL}/admin/students?admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(f'{BASE_URL}/admin/students?admin_email={ADMIN_EMAIL}',
                                  data=json.dumps(payload).encode(),
                                  headers={'Content-Type': 'application/json'},
                                  method='POST')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True and 'credentials' in data

# Test 6: Delete Student
def test_delete_student():
    url = f'{BASE_URL}/admin/students/testneew123@college.edu?admin_email={ADMIN_EMAIL}'
    req = urllib.request.Request(url, method='DELETE')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        return data.get('success') == True

# Run all tests
print("\n=== FEATURE TESTS ===\n")
tests = [
    ("Load academic-options endpoint", test_academic_options),
    ("Create new acdemicunit (dept/section)", test_create_academic_unit),
    ("List all students", test_list_students),
    ("Filter students by department", test_filter_students_by_dept),
    ("Create new student", test_create_student),
    ("Delete student", test_delete_student),
]

results = [test_feature(name, func) for name, func in tests]

print(f"\n=== SUMMARY ===")
print(f"Passed: {sum(results)}/{len(results)}")
print(f"Status: {'✓ ALL FEATURES WORKING' if all(results) else '✗ SOME FEATURES BROKEN'}")
