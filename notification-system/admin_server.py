"""
Admin Panel Server
==================
This script runs both the notification API and admin panel UI in one place.

Usage:
    python admin_server.py

Then open:
    http://localhost:5000/
"""

from flask import Flask
from flask_cors import CORS
import os
from pathlib import Path

# Import app from main application
import sys
sys.path.insert(0, os.path.dirname(__file__))

# Create Flask app
app = Flask(__name__, static_folder=os.path.dirname(__file__))
CORS(app)

# Read admin panel HTML
admin_panel_path = os.path.join(os.path.dirname(__file__), 'admin_panel.html')

@app.route('/')
def serve_admin_panel():
    """Serve the admin panel"""
    with open(admin_panel_path, 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/panel')
def admin_panel_page():
    """Alternative route for admin panel"""
    with open(admin_panel_path, 'r', encoding='utf-8') as f:
        return f.read()

# Import and register API routes from main app
from app import (
    init_firebase,
    api_info,
    mark_attendance,
    get_attendance_report,
    get_attendance_summary,
    send_announcement,
    get_announcement_history,
    get_students,
    init_sample_data,
    not_found,
    method_not_allowed,
    internal_error
)

# Register API routes
@app.route('/api/', methods=['GET'])
def api_index():
    """API documentation"""
    return api_info()

@app.route('/api/attendance/mark', methods=['POST'])
def api_mark_attendance():
    return mark_attendance()

@app.route('/api/attendance/report', methods=['GET'])
def api_attendance_report():
    return get_attendance_report()

@app.route('/api/attendance/<student_id>/summary', methods=['GET'])
def api_attendance_summary(student_id):
    return get_attendance_summary(student_id)

@app.route('/api/announcement/send', methods=['POST'])
def api_send_announcement():
    return send_announcement()

@app.route('/api/announcement/history', methods=['GET'])
def api_announcement_history():
    return get_announcement_history()

@app.route('/api/students', methods=['GET'])
def api_get_students():
    return get_students()

@app.route('/api/init-sample-data', methods=['POST'])
def api_init_sample_data():
    return init_sample_data()

# Also serve API on original paths for compatibility
@app.route('/students', methods=['GET'])
def get_students_compat():
    return get_students()

@app.route('/attendance/mark', methods=['POST'])
def mark_attendance_compat():
    return mark_attendance()

@app.route('/attendance/report', methods=['GET'])
def attendance_report_compat():
    return get_attendance_report()

@app.route('/attendance/<student_id>/summary', methods=['GET'])
def attendance_summary_compat(student_id):
    return get_attendance_summary(student_id)

@app.route('/announcement/send', methods=['POST'])
def send_announcement_compat():
    return send_announcement()

@app.route('/announcement/history', methods=['GET'])
def announcement_history_compat():
    return get_announcement_history()

@app.route('/init-sample-data', methods=['POST'])
def init_sample_data_compat():
    return init_sample_data()

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 ADMIN PANEL & API SERVER")
    print("="*60)
    print("\n📱 Admin Panel:")
    print("   URL: http://localhost:5000/")
    print("   URL: http://localhost:5000/panel")
    print("\n📡 API Endpoints:")
    print("   GET  http://localhost:5000/students")
    print("   POST http://localhost:5000/attendance/mark")
    print("   GET  http://localhost:5000/attendance/report")
    print("   POST http://localhost:5000/announcement/send")
    print("   GET  http://localhost:5000/announcement/history")
    print("   POST http://localhost:5000/init-sample-data")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
