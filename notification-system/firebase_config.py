"""
Firebase Configuration Module
================================
This module initializes Firebase Admin SDK and Firestore connection.
It handles all database interactions for the notification system.

Educational Note:
This represents the database layer of the Admin Panel backend.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from datetime import datetime


LOCAL_FALLBACK_PATH = os.path.join(os.path.dirname(__file__), 'local_firebase_fallback.json')


def _load_local_store():
    if not os.path.exists(LOCAL_FALLBACK_PATH):
        return {
            'students': {},
            'attendance': [],
            'announcements': [],
            'notifications': []
        }

    try:
        with open(LOCAL_FALLBACK_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            data.setdefault('students', {})
            data.setdefault('attendance', [])
            data.setdefault('announcements', [])
            data.setdefault('notifications', [])
            return data
    except Exception:
        return {
            'students': {},
            'attendance': [],
            'announcements': [],
            'notifications': []
        }


def _save_local_store(data):
    with open(LOCAL_FALLBACK_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


def get_local_store():
    """Expose local fallback data for service-layer reporting endpoints."""
    return _load_local_store()


def is_firebase_available():
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False

# ============== FIREBASE INITIALIZATION ==============

def init_firebase():
    """
    Initialize Firebase Admin SDK and Firestore
    
    Requirements:
    1. Download serviceAccountKey.json from Firebase Console
    2. Place it in the same directory as this file
    3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
    
    Returns:
        firestore.Client: Firestore database instance
    """
    
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize Firebase with service account
        # Path to your Firebase service account key
        SERVICE_ACCOUNT_KEY_PATH = os.path.join(
            os.path.dirname(__file__), 
            'serviceAccountKey.json'
        )
        
        if not os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
            print(
                f"⚠️ Service Account Key not found at {SERVICE_ACCOUNT_KEY_PATH}. "
                "Using local fallback storage for demo mode."
            )
            return None
        
        # Initialize Firebase
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
    
    # Get Firestore client
    if is_firebase_available():
        return firestore.client()
    return None


# ============== DATABASE UTILITY FUNCTIONS ==============

def get_firestore():
    """Get Firestore database instance"""
    try:
        if is_firebase_available():
            return firestore.client()
        return None
    except Exception as e:
        print(f"❌ Error getting Firestore: {e}")
        return None


def add_student(student_id, name, parent_phone, parent_name=""):
    """
    Add a student to the students collection
    
    Args:
        student_id (str): Unique student identifier
        name (str): Student's full name
        parent_phone (str): Parent's phone number (e.g., +919876543210)
        parent_name (str): Parent's name (optional)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        db = get_firestore()
        payload = {
            'name': name,
            'parent_phone': parent_phone,
            'parent_name': parent_name,
            'created_at': datetime.now().isoformat(),
            'status': 'active'
        }

        if db is not None:
            db.collection('students').document(student_id).set(payload)
        else:
            local = _load_local_store()
            local['students'][student_id] = payload
            _save_local_store(local)

        print(f"✅ Student {student_id} added successfully")
        return True
    except Exception as e:
        print(f"❌ Error adding student: {e}")
        return False


def get_student(student_id):
    """
    Retrieve student details by ID
    
    Args:
        student_id (str): Student ID to retrieve
    
    Returns:
        dict: Student document data or None if not found
    """
    try:
        db = get_firestore()
        if db is not None:
            doc = db.collection('students').document(student_id).get()
            if doc.exists:
                return doc.to_dict()
            return None

        local = _load_local_store()
        return local['students'].get(student_id)

    except Exception as e:
        print(f"❌ Error retrieving student: {e}")
        return None


def get_all_students():
    """
    Retrieve all students from the database
    
    Returns:
        list: List of student dictionaries with their IDs
    """
    try:
        db = get_firestore()
        students = []

        if db is not None:
            docs = db.collection('students').where('status', '==', 'active').stream()
            for doc in docs:
                student_data = doc.to_dict()
                student_data['student_id'] = doc.id
                students.append(student_data)
            return students

        local = _load_local_store()
        for student_id, student_data in local['students'].items():
            if student_data.get('status') == 'active':
                row = dict(student_data)
                row['student_id'] = student_id
                students.append(row)
        return students
    except Exception as e:
        print(f"❌ Error retrieving students: {e}")
        return []


def record_attendance(student_id, status, date=None):
    """
    Record attendance for a student
    
    Args:
        student_id (str): Student ID
        status (str): "present" or "absent"
        date (str): Date in format YYYY-MM-DD (defaults to today)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        if status not in ['present', 'absent']:
            print(f"❌ Invalid status: {status}. Must be 'present' or 'absent'")
            return False
        
        payload = {
            'student_id': student_id,
            'date': date,
            'status': status,
            'recorded_at': datetime.now().isoformat()
        }

        db = get_firestore()
        if db is not None:
            db.collection('attendance').add(payload)
        else:
            local = _load_local_store()
            local['attendance'].append(payload)
            _save_local_store(local)

        print(f"✅ Attendance recorded: {student_id} - {status} on {date}")
        return True
    except Exception as e:
        print(f"❌ Error recording attendance: {e}")
        return False


def store_announcement(message, target_audience="all"):
    """
    Store announcement in Firestore
    
    Args:
        message (str): Announcement message
        target_audience (str): Target audience ("all", "parents", etc.)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        payload = {
            'message': message,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'timestamp': datetime.now().isoformat(),
            'target_audience': target_audience
        }

        db = get_firestore()
        if db is not None:
            db.collection('announcements').add(payload)
        else:
            local = _load_local_store()
            local['announcements'].append(payload)
            _save_local_store(local)

        print(f"✅ Announcement stored successfully")
        return True
    except Exception as e:
        print(f"❌ Error storing announcement: {e}")
        return False


def log_notification(student_id, notification_type, message, phone, status="sent"):
    """
    Log notification sent to parent
    
    Args:
        student_id (str): Student ID (or "all" for broadcast)
        notification_type (str): "attendance" or "announcement"
        message (str): Notification message
        phone (str): Phone number it was sent to
        status (str): "sent", "failed", "pending"
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        payload = {
            'student_id': student_id,
            'type': notification_type,
            'message': message,
            'phone_number': phone,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }

        db = get_firestore()
        if db is not None:
            db.collection('notifications').add(payload)
        else:
            local = _load_local_store()
            local['notifications'].append(payload)
            _save_local_store(local)

        return True
    except Exception as e:
        print(f"❌ Error logging notification: {e}")
        return False


# ============== SAMPLE DATA INITIALIZATION ==============

def initialize_sample_data():
    """
    Initialize database with sample student data for testing
    This function should be called once during project setup
    """
    sample_students = [
        {
            'id': 'S001',
            'name': 'Rahul Sharma',
            'parent_phone': '+919876543210',
            'parent_name': 'Mr. Sharma'
        },
        {
            'id': 'S002',
            'name': 'Priya Kumar',
            'parent_phone': '+919876543211',
            'parent_name': 'Mrs. Kumar'
        },
        {
            'id': 'S003',
            'name': 'Arjun Patel',
            'parent_phone': '+919876543212',
            'parent_name': 'Mr. Patel'
        },
        {
            'id': 'S004',
            'name': 'Neha Singh',
            'parent_phone': '+919876543213',
            'parent_name': 'Mrs. Singh'
        },
        {
            'id': 'S005',
            'name': 'Arun Desai',
            'parent_phone': '+919876543214',
            'parent_name': 'Mr. Desai'
        }
    ]
    
    print("\n📚 Initializing sample data...")
    for student in sample_students:
        add_student(
            student['id'],
            student['name'],
            student['parent_phone'],
            student['parent_name']
        )
    print("✅ Sample data initialized!\n")


if __name__ == "__main__":
    # Test Firebase connection
    print("🔗 Testing Firebase connection...")
    db = init_firebase()
    print("✅ Firebase connected successfully!")
    
    # Uncomment to initialize sample data
    # initialize_sample_data()
