"""
Attendance Management Service
==============================
This service handles all attendance-related operations for the Admin Panel.
It records attendance and sends SMS notifications for absences.

Educational Note:
This represents the business logic layer for attendance management.
It separates concerns: database operations, SMS sending, and logging.
"""

from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_config import (
    get_firestore,
    get_local_store,
    get_student,
    record_attendance,
    log_notification
)
from sms import send_attendance_notification


# ============== ATTENDANCE SERVICE ==============

class AttendanceService:
    """
    Service class for managing student attendance
    and sending notifications to parents
    """
    
    @staticmethod
    def mark_attendance(student_id, status, date=None):
        """
        Mark student attendance and handle notifications
        
        This is the main function called by the Flask API endpoint.
        It serves as the Admin Panel's attendance marking functionality.
        
        Process:
        1. Validate student exists
        2. Record attendance in Firestore
        3. If absent: Send SMS to parent
        4. Log notification
        
        Args:
            student_id (str): Student ID (e.g., 'S001')
            status (str): 'present' or 'absent'
            date (str): Optional date in YYYY-MM-DD format
        
        Returns:
            dict: Operation result
                {
                    'success': bool,
                    'message': str,
                    'data': {
                        'student_id': str,
                        'name': str,
                        'status': str,
                        'date': str,
                        'notification_sent': bool
                    },
                    'error': str (if failed)
                }
        """
        
        try:
            # Set date to today if not provided
            if date is None:
                date = datetime.now().strftime('%Y-%m-%d')
            
            # Validate status
            if status not in ['present', 'absent']:
                return {
                    'success': False,
                    'message': 'Invalid status',
                    'error': 'Status must be "present" or "absent"'
                }
            
            # Fetch student details
            student = get_student(student_id)
            if not student:
                return {
                    'success': False,
                    'message': f'Student {student_id} not found',
                    'error': 'Invalid student ID'
                }
            
            student_name = student.get('name', 'Unknown')
            parent_phone = student.get('parent_phone', '')
            
            # Record attendance in Firestore
            attendance_recorded = record_attendance(student_id, status, date)
            if not attendance_recorded:
                return {
                    'success': False,
                    'message': 'Failed to record attendance',
                    'error': 'Database error'
                }
            
            # Send SMS notification if absent
            notification_sent = False
            notification_result = None
            
            if status == 'absent':
                notification_result = send_attendance_notification(
                    parent_phone,
                    student_name
                )
                notification_sent = notification_result.get('success', False)
                
                # Log notification in database
                log_notification(
                    student_id,
                    'attendance',
                    f'{student_name} was absent on {date}',
                    parent_phone,
                    'sent' if notification_sent else 'failed'
                )
                
                if notification_sent:
                    print(f"✅ Absent notification sent to {student_name}'s parent")
                else:
                    print(f"⚠️  Failed to send SMS: {notification_result.get('error')}")
            else:
                # Log present status
                log_notification(
                    student_id,
                    'attendance',
                    f'{student_name} marked present on {date}',
                    parent_phone,
                    'logged'
                )
                print(f"✅ {student_name} marked present")
            
            # Return success response
            return {
                'success': True,
                'message': f'Attendance marked successfully for {student_name}',
                'data': {
                    'student_id': student_id,
                    'name': student_name,
                    'status': status,
                    'date': date,
                    'notification_sent': notification_sent,
                    'phone_number': parent_phone
                }
            }
        
        except Exception as e:
            print(f"❌ Error in mark_attendance: {e}")
            return {
                'success': False,
                'message': 'Server error',
                'error': str(e)
            }
    
    
    @staticmethod
    def get_attendance_report(student_id=None, date=None):
        """
        Retrieve attendance records
        
        Args:
            student_id (str): Optional - specific student
            date (str): Optional - specific date
        
        Returns:
            list: Attendance records
        """
        try:
            db = get_firestore()
            records = []

            if db is not None:
                query = db.collection('attendance')
                if student_id:
                    query = query.where('student_id', '==', student_id)
                if date:
                    query = query.where('date', '==', date)

                for doc in query.stream():
                    record = doc.to_dict()
                    record['id'] = doc.id
                    records.append(record)
                return records

            local_records = get_local_store().get('attendance', [])
            for record in local_records:
                if student_id and record.get('student_id') != student_id:
                    continue
                if date and record.get('date') != date:
                    continue
                records.append(record)

            return records
        
        except Exception as e:
            print(f"❌ Error retrieving attendance: {e}")
            return []


# ============== UTILITY FUNCTIONS ==============

def get_student_attendance_summary(student_id, start_date=None, end_date=None):
    """
    Get attendance summary for a student
    
    Args:
        student_id (str): Student ID
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format
    
    Returns:
        dict: Summary statistics
            {
                'student_id': str,
                'total': int,
                'present': int,
                'absent': int,
                'attendance_percentage': float
            }
    """
    try:
        db = get_firestore()
        student = get_student(student_id)
        
        if not student:
            return {'error': f'Student {student_id} not found'}
        
        records = []
        if db is not None:
            query = db.collection('attendance').where('student_id', '==', student_id)
            for doc in query.stream():
                records.append(doc.to_dict())
        else:
            records = [
                r for r in get_local_store().get('attendance', [])
                if r.get('student_id') == student_id
            ]
        
        total = len(records)
        present = sum(1 for r in records if r.get('status') == 'present')
        absent = sum(1 for r in records if r.get('status') == 'absent')
        percentage = (present / total * 100) if total > 0 else 0
        
        return {
            'student_id': student_id,
            'student_name': student.get('name'),
            'total_records': total,
            'present': present,
            'absent': absent,
            'attendance_percentage': round(percentage, 2)
        }
    
    except Exception as e:
        print(f"❌ Error calculating summary: {e}")
        return {'error': str(e)}
