"""
Parent Notification System - Flask Server
Integrates with main FastAPI SQLite database
Provides attendance tracking and parent notifications
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os
import json

app = Flask(__name__, static_folder='.')
CORS(app)

# Database path - same as main app
DB_PATH = "campus.db"

def get_db_connection():
    """Connect to SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Serve parent notification admin panel"""
    return render_template('parent_notification.html')

# ============== API ENDPOINTS ==============

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students from database"""
    try:
        conn = get_db_connection()
        students = conn.execute('SELECT id, name, email, roll_number FROM users WHERE role = "STUDENT"').fetchall()
        conn.close()
        return jsonify([dict(s) for s in students])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mark-attendance', methods=['POST'])
def mark_attendance():
    """Mark student attendance"""
    try:
        data = request.json
        student_id = data.get('student_id')
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        status = data.get('status', 'PRESENT')  # PRESENT, ABSENT, LEAVE
        subject_name = 'Daily Attendance'
        
        conn = get_db_connection()

        student = conn.execute(
            'SELECT id, name, email, dept, section, sem FROM users WHERE id = ? AND role = "STUDENT"',
            (student_id,)
        ).fetchone()
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404

        student_email = student['email']
        
        # Check if attendance record exists
        existing = conn.execute(
            'SELECT id FROM attendance WHERE student_email = ? AND date = ? AND subject_name = ?',
            (student_email, date, subject_name)
        ).fetchone()
        
        if existing:
            conn.execute(
                'UPDATE attendance SET status = ? WHERE student_email = ? AND date = ? AND subject_name = ?',
                (status, student_email, date, subject_name)
            )
        else:
            conn.execute(
                'INSERT INTO attendance (student_email, subject_name, date, status, dept, section, sem) VALUES (?, ?, ?, ?, ?, ?, ?)',
                (student_email, subject_name, date, status, student['dept'], student['section'], student['sem'])
            )
        
        conn.commit()
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': f'{student["name"]} marked as {status}',
            'student': dict(student),
            'notification_sent': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance-report', methods=['GET'])
def get_attendance_report():
    """Get attendance report by date"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        subject_name = 'Daily Attendance'
        
        conn = get_db_connection()
        report = conn.execute('''
            SELECT 
                u.id,
                u.name,
                u.roll_number,
                a.status,
                a.date
            FROM users u
            LEFT JOIN attendance a ON u.email = a.student_email AND a.date = ? AND a.subject_name = ?
            WHERE u.role = 'STUDENT'
            ORDER BY u.name
        ''', (date, subject_name)).fetchall()
        
        conn.close()
        
        return jsonify([dict(r) for r in report])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student-attendance/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    """Get attendance history for a student"""
    try:
        days = request.args.get('days', 30, type=int)
        
        conn = get_db_connection()
        student = conn.execute(
            'SELECT name, roll_number, email FROM users WHERE id = ?',
            (student_id,)
        ).fetchone()
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        attendance = conn.execute('''
            SELECT date, status FROM attendance 
            WHERE student_email = ? AND subject_name = ?
            ORDER BY date DESC 
            LIMIT ?
        ''', (student['email'], 'Daily Attendance', days)).fetchall()
        
        conn.close()
        
        # Calculate stats
        records = [dict(a) for a in attendance]
        present = sum(1 for r in records if r['status'] == 'PRESENT')
        absent = sum(1 for r in records if r['status'] == 'ABSENT')
        
        return jsonify({
            'student': dict(student),
            'attendance': records,
            'stats': {
                'total': len(records),
                'present': present,
                'absent': absent,
                'percentage': round((present / len(records) * 100), 2) if records else 0
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/send-notification', methods=['POST'])
def send_notification():
    """Send notification to parent (SMS/Email simulation)"""
    try:
        data = request.json
        student_id = data.get('student_id')
        message = data.get('message')
        notification_type = data.get('type', 'ATTENDANCE')
        
        conn = get_db_connection()
        student = conn.execute(
            'SELECT name, email FROM users WHERE id = ?',
            (student_id,)
        ).fetchone()
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Log notification
        conn.execute('''
            INSERT INTO notifications (student_email, message, type, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (student['email'], message, notification_type, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': f'Notification sent to {student["email"]}',
            'student': dict(student),
            'notification': {
                'type': notification_type,
                'message': message,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get notification history"""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        conn = get_db_connection()
        notifications = conn.execute('''
            SELECT n.*, u.name as student_name
            FROM notifications n
            JOIN users u ON n.student_email = u.email
            ORDER BY n.timestamp DESC
            LIMIT ?
        ''', (limit,)).fetchall()
        
        conn.close()
        
        return jsonify([dict(n) for n in notifications])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get system statistics"""
    try:
        conn = get_db_connection()
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        total_students = conn.execute(
            'SELECT COUNT(*) as count FROM users WHERE role = "STUDENT"'
        ).fetchone()['count']
        
        present_today = conn.execute(
            'SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "PRESENT"',
            (today,)
        ).fetchone()['count']
        
        absent_today = conn.execute(
            'SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = "ABSENT"',
            (today,)
        ).fetchone()['count']
        
        notifications_sent = conn.execute(
            'SELECT COUNT(*) as count FROM notifications'
        ).fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'total_students': total_students,
            'present_today': present_today,
            'absent_today': absent_today,
            'not_marked': total_students - present_today - absent_today,
            'notifications_sent': notifications_sent
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Check if database has notifications table
    try:
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_email TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT,
                timestamp TEXT
            )
        ''')
        conn.commit()
        conn.close()
    except:
        pass
    
    port = int(os.getenv('PARENT_NOTIFICATION_PORT', '5001'))

    print("\n" + "="*50)
    print("🚀 PARENT NOTIFICATION SYSTEM")
    print("="*50)
    print(f"📍 Access at: http://localhost:{port}")
    print("="*50 + "\n")
    
    app.run(host='127.0.0.1', port=port, debug=True)
