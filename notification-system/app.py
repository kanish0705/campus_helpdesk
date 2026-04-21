"""
STUDENT-PARENT NOTIFICATION SYSTEM
===================================

Admin Panel Backend API (No Frontend Required)

Features:
✓ Mark student attendance and send SMS notifications
✓ Send announcements to all parents via SMS
✓ Firebase Firestore database integration
✓ Fast2SMS API for SMS delivery
✓ Complete notification logging

Tech Stack:
- Flask (Python web framework)
- Firebase Admin SDK (Firestore database)
- Fast2SMS API (SMS delivery)
- RESTful API endpoints

Usage:
1. Configure Firebase and SMS API credentials
2. Run: python app.py
3. Use Postman or curl to test endpoints

Author: Educational Project
Date: 2024
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from datetime import datetime
from pathlib import Path

# Import services
from services.attendance_service import AttendanceService, get_student_attendance_summary
from services.announcement_service import AnnouncementService
from firebase_config import (
    init_firebase,
    get_all_students,
    initialize_sample_data
)


# ============== FLASK APP INITIALIZATION ==============

app = Flask(__name__, static_folder=os.path.dirname(__file__), static_url_path='/static')
CORS(app)  # Enable CORS for API access

# Initialize Firebase
try:
    db = init_firebase()
    if db is not None:
        print("✅ Firebase initialized successfully")
    else:
        print("⚠️ Running in local fallback mode (Firebase credentials not configured)")
except Exception as e:
    print(f"❌ Firebase initialization failed: {e}")
    print("   Please ensure serviceAccountKey.json is in the notification-system directory")


# ============== ADMIN PANEL ROUTES ==============

@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint - Serve Admin Panel
    """
    # Try improved version first, fallback to original
    admin_panel_path = os.path.join(os.path.dirname(__file__), 'admin_panel_improved.html')
    if not os.path.exists(admin_panel_path):
        admin_panel_path = os.path.join(os.path.dirname(__file__), 'admin_panel.html')
    
    try:
        with open(admin_panel_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return jsonify({
            'name': 'Student-Parent Notification System',
            'version': '2.0.0',
            'description': 'Admin Panel Backend API for attendance tracking and announcements',
            'note': 'Admin panel HTML file not found. Place admin_panel.html in the application directory.',
            'endpoints': {
                'attendance': {
                    'POST /attendance/mark': 'Mark student attendance',
                    'GET /attendance/report': 'Get attendance report',
                    'GET /attendance/<student_id>/summary': 'Get student attendance summary'
                },
                'announcements': {
                    'POST /announcement/send': 'Send announcement to all parents',
                    'GET /announcement/history': 'Get announcement history'
                },
                'admin': {
                    'GET /students': 'Get all students',
                    'POST /init-sample-data': 'Initialize sample data (setup only)'
                }
            }
        }), 200


@app.route('/api', methods=['GET'])
@app.route('/api/', methods=['GET'])
def api_info():
    """
    API Information endpoint
    """
    return jsonify({
        'name': 'Student-Parent Notification System',
        'version': '1.0.0',
        'description': 'Admin Panel Backend API for attendance tracking and announcements',
        'endpoints': {
            'attendance': {
                'POST /attendance/mark': 'Mark student attendance',
                'GET /attendance/report': 'Get attendance report',
                'GET /attendance/<student_id>/summary': 'Get student attendance summary'
            },
            'announcements': {
                'POST /announcement/send': 'Send announcement to all parents',
                'GET /announcement/history': 'Get announcement history'
            },
            'admin': {
                'GET /students': 'Get all students',
                'POST /init-sample-data': 'Initialize sample data (setup only)'
            }
        }
    }), 200


@app.route('/admin', methods=['GET'])
def admin_panel():
    """Serve admin panel"""
    # Try improved version first, fallback to original
    admin_panel_path = os.path.join(os.path.dirname(__file__), 'admin_panel_improved.html')
    if not os.path.exists(admin_panel_path):
        admin_panel_path = os.path.join(os.path.dirname(__file__), 'admin_panel.html')
    
    try:
        with open(admin_panel_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Admin panel HTML file not found", 404


# ============== ATTENDANCE ENDPOINTS ==============

@app.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    """
    ADMIN PANEL ENDPOINT: Mark Student Attendance
    ===============================================
    
    This endpoint represents the Admin Panel's attendance marking feature.
    Admin (authenticated user) submits attendance data here.
    
    Functionality:
    1. Records attendance in Firestore
    2. If absent: Sends SMS to parent's phone
    3. Logs all notifications
    
    Request JSON:
    {
        "student_id": "S001",
        "status": "absent",  // or "present"
        "date": "2024-04-21"  // optional, defaults to today
    }
    
    Response:
    {
        "success": true,
        "message": "Attendance marked successfully",
        "data": { ... }
    }
    """
    
    try:
        # Extract request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No JSON data provided',
                'error': 'Request body is empty'
            }), 400
        
        # Extract fields
        student_id = data.get('student_id')
        status = data.get('status')
        date = data.get('date')
        
        # Validate required fields
        if not student_id:
            return jsonify({
                'success': False,
                'message': 'Missing required field: student_id',
                'error': 'student_id is required'
            }), 400
        
        if not status:
            return jsonify({
                'success': False,
                'message': 'Missing required field: status',
                'error': 'status must be "present" or "absent"'
            }), 400
        
        # Call attendance service
        result = AttendanceService.mark_attendance(student_id, status, date)
        
        # Return response
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    
    except Exception as e:
        print(f"❌ Error in /attendance/mark: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


@app.route('/attendance/report', methods=['GET'])
def get_attendance_report():
    """
    ADMIN PANEL ENDPOINT: Get Attendance Report
    ==========================================
    
    Retrieve attendance records with optional filtering
    
    Query Parameters:
    - student_id (optional): Filter by student
    - date (optional): Filter by date (YYYY-MM-DD)
    
    Example: GET /attendance/report?student_id=S001&date=2024-04-21
    """
    
    try:
        # Extract query parameters
        student_id = request.args.get('student_id')
        date = request.args.get('date')
        
        # Get attendance records
        from services.attendance_service import AttendanceService
        records = AttendanceService.get_attendance_report(student_id, date)
        
        return jsonify({
            'success': True,
            'message': f'Retrieved {len(records)} attendance record(s)',
            'data': {
                'count': len(records),
                'records': records
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error in /attendance/report: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


@app.route('/attendance/<student_id>/summary', methods=['GET'])
def get_attendance_summary(student_id):
    """
    ADMIN PANEL ENDPOINT: Get Student Attendance Summary
    ===================================================
    
    Get attendance statistics for a student
    
    URL Parameters:
    - student_id: Student ID (e.g., S001)
    
    Response includes:
    - Total attendance records
    - Number of presents and absents
    - Attendance percentage
    """
    
    try:
        summary = get_student_attendance_summary(student_id)
        
        if 'error' in summary:
            return jsonify({
                'success': False,
                'message': summary['error']
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Attendance summary retrieved',
            'data': summary
        }), 200
    
    except Exception as e:
        print(f"❌ Error in /attendance/<student_id>/summary: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


# ============== ANNOUNCEMENT ENDPOINTS ==============

@app.route('/announcement/send', methods=['POST'])
def send_announcement():
    """
    ADMIN PANEL ENDPOINT: Send Announcement
    =======================================
    
    This endpoint represents the Admin Panel's announcement feature.
    Admin sends announcement to ALL parents via SMS.
    
    Functionality:
    1. Stores announcement in Firestore
    2. Fetches all student phone numbers
    3. Sends SMS to all parents
    4. Logs all notifications
    
    Request JSON:
    {
        "message": "Tomorrow is a holiday"
    }
    
    Response:
    {
        "success": true,
        "message": "Announcement sent to 5 parent(s)",
        "data": { ... }
    }
    """
    
    try:
        # Extract request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No JSON data provided',
                'error': 'Request body is empty'
            }), 400
        
        # Extract message
        message = data.get('message')
        
        # Validate required fields
        if not message:
            return jsonify({
                'success': False,
                'message': 'Missing required field: message',
                'error': 'message is required'
            }), 400
        
        # Call announcement service
        result = AnnouncementService.send_announcement(message)
        
        # Return response
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    
    except Exception as e:
        print(f"❌ Error in /announcement/send: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


@app.route('/announcement/history', methods=['GET'])
def get_announcement_history():
    """
    ADMIN PANEL ENDPOINT: Get Announcement History
    ==============================================
    
    Retrieve previous announcements
    
    Query Parameters:
    - limit (optional): Number of announcements to retrieve (default: 10)
    
    Example: GET /announcement/history?limit=20
    """
    
    try:
        # Extract limit parameter
        limit = request.args.get('limit', 10, type=int)
        
        # Validate limit
        if limit > 100:
            limit = 100  # Max 100 records
        if limit < 1:
            limit = 10
        
        # Get announcement history
        announcements = AnnouncementService.get_announcement_history(limit)
        
        return jsonify({
            'success': True,
            'message': f'Retrieved {len(announcements)} announcement(s)',
            'data': {
                'count': len(announcements),
                'announcements': announcements
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error in /announcement/history: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


# ============== ADMIN ENDPOINTS ==============

@app.route('/students', methods=['GET'])
def get_students():
    """
    ADMIN PANEL ENDPOINT: Get All Students
    =====================================
    
    Retrieve list of all registered students
    
    Response includes:
    - Student ID
    - Name
    - Parent phone number
    """
    
    try:
        students = get_all_students()
        
        return jsonify({
            'success': True,
            'message': f'Retrieved {len(students)} student(s)',
            'data': {
                'count': len(students),
                'students': students
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error in /students: {e}")
        return jsonify({
            'success': False,
            'message': 'Server error',
            'error': str(e)
        }), 500


@app.route('/init-sample-data', methods=['POST'])
def init_sample_data():
    """
    SETUP ENDPOINT: Initialize Sample Data
    =====================================
    
    This endpoint initializes the database with sample student data.
    
    ⚠️  Should be called only ONCE during initial setup
    
    Data initialized:
    - 5 sample students with realistic names
    - Mock phone numbers for testing
    
    Call this once after deploying the system
    """
    
    try:
        print("\n🔄 Initializing sample data...")
        initialize_sample_data()
        
        students = get_all_students()
        
        return jsonify({
            'success': True,
            'message': 'Sample data initialized successfully',
            'data': {
                'students_created': len(students),
                'students': students
            }
        }), 200
    
    except Exception as e:
        print(f"❌ Error initializing sample data: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to initialize sample data',
            'error': str(e)
        }), 500


# ============== ERROR HANDLERS ==============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 - Route not found"""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found',
        'error': f'{request.path} does not exist'
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 - Method not allowed"""
    return jsonify({
        'success': False,
        'message': 'Method not allowed',
        'error': f'{request.method} not allowed on {request.path}'
    }), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 - Internal server error"""
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'error': str(error)
    }), 500


# ============== SERVER STARTUP ==============

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 STUDENT-PARENT NOTIFICATION SYSTEM")
    print("="*60)
    print("\n📌 Admin Panel Backend API")
    print("📍 Base URL: http://localhost:5000")
    print("\n📚 API Documentation:")
    print("   GET  / - View all endpoints")
    print("   POST /attendance/mark - Mark attendance")
    print("   GET  /attendance/report - Get attendance report")
    print("   POST /announcement/send - Send announcement")
    print("   GET  /announcement/history - Get announcement history")
    print("   GET  /students - Get all students")
    print("\n⚠️  IMPORTANT:")
    print("   1. Configure Firebase credentials in firebase_config.py")
    print("   2. Set Fast2SMS API key in sms.py")
    print("   3. Initialize sample data: POST /init-sample-data")
    print("\n" + "="*60 + "\n")
    
    # Run Flask development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
