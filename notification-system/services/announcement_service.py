"""
Announcement Management Service
================================
This service handles announcements and broadcast notifications.
It sends SMS to all parents for school-wide announcements.

Educational Note:
This represents the broadcast functionality in the Admin Panel.
It demonstrates bulk SMS sending with database logging.
"""

from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_config import (
    get_firestore,
    get_local_store,
    get_all_students,
    store_announcement,
    log_notification
)
from sms import send_announcement_notification, send_bulk_sms


# ============== ANNOUNCEMENT SERVICE ==============

class AnnouncementService:
    """
    Service class for managing announcements and
    sending notifications to all parents
    """
    
    @staticmethod
    def send_announcement(message):
        """
        Send announcement to all parents via SMS
        
        This is the main function called by the Flask API endpoint.
        It represents the Admin Panel's announcement broadcasting functionality.
        
        Process:
        1. Validate message
        2. Store announcement in Firestore
        3. Fetch all students
        4. Send SMS to all parent phone numbers
        5. Log all notifications
        
        Args:
            message (str): Announcement message to broadcast
        
        Returns:
            dict: Operation result
                {
                    'success': bool,
                    'message': str,
                    'data': {
                        'announcement_id': str,
                        'total_parents': int,
                        'sms_sent': int,
                        'sms_failed': int,
                        'recipients': list
                    },
                    'error': str (if failed)
                }
        """
        
        try:
            # Validate message
            if not message or len(message.strip()) == 0:
                return {
                    'success': False,
                    'message': 'Announcement message cannot be empty',
                    'error': 'Empty message'
                }
            
            if len(message) > 500:
                return {
                    'success': False,
                    'message': 'Message too long (max 500 characters)',
                    'error': 'Message too long'
                }
            
            message = message.strip()
            
            # Store announcement in Firestore
            print(f"\n📢 Sending announcement to all parents...")
            print(f"   Message: {message}\n")
            
            announcement_stored = store_announcement(message, target_audience='all')
            if not announcement_stored:
                return {
                    'success': False,
                    'message': 'Failed to store announcement',
                    'error': 'Database error'
                }
            
            # Fetch all students
            students = get_all_students()
            if not students:
                return {
                    'success': False,
                    'message': 'No students found in database',
                    'error': 'No students'
                }
            
            # Collect phone numbers
            phone_numbers = []
            recipients = []
            
            for student in students:
                phone = student.get('parent_phone', '')
                if phone:
                    phone_numbers.append(phone)
                    recipients.append({
                        'student_id': student.get('student_id'),
                        'student_name': student.get('name'),
                        'parent_phone': phone
                    })
            
            if not phone_numbers:
                return {
                    'success': False,
                    'message': 'No parent phone numbers found',
                    'error': 'No contact numbers'
                }
            
            # Send SMS to all parents
            sms_results = send_bulk_sms(phone_numbers, f"📢 Announcement: {message}")
            
            # Log notifications for each recipient
            for result in sms_results['results']:
                # Find corresponding student
                for recipient in recipients:
                    if result['message'].endswith(recipient['parent_phone']):
                        log_notification(
                            recipient['student_id'],
                            'announcement',
                            message,
                            recipient['parent_phone'],
                            'sent' if result['success'] else 'failed'
                        )
                        break
            
            # Return success response
            return {
                'success': True,
                'message': f'Announcement sent to {sms_results["successful"]} parent(s)',
                'data': {
                    'total_parents': sms_results['total'],
                    'sms_sent': sms_results['successful'],
                    'sms_failed': sms_results['failed'],
                    'message': message,
                    'timestamp': datetime.now().isoformat(),
                    'recipients': recipients
                }
            }
        
        except Exception as e:
            print(f"❌ Error in send_announcement: {e}")
            return {
                'success': False,
                'message': 'Server error',
                'error': str(e)
            }
    
    
    @staticmethod
    def get_announcement_history(limit=10):
        """
        Retrieve recent announcements
        
        Args:
            limit (int): Number of announcements to retrieve
        
        Returns:
            list: Announcement records
        """
        try:
            db = get_firestore()
            announcements = []

            if db is not None:
                docs = db.collection('announcements').order_by(
                    'timestamp',
                    direction='DESCENDING'
                ).limit(limit).stream()

                for doc in docs:
                    announcement = doc.to_dict()
                    announcement['id'] = doc.id
                    announcements.append(announcement)
                return announcements

            local_announcements = get_local_store().get('announcements', [])
            announcements = sorted(
                local_announcements,
                key=lambda row: row.get('timestamp', ''),
                reverse=True
            )[:limit]

            return announcements
        
        except Exception as e:
            print(f"❌ Error retrieving announcements: {e}")
            return []
    
    
    @staticmethod
    def send_announcement_to_class(message, department=None, section=None):
        """
        Send announcement to specific class/department
        
        This is an advanced feature for targeted announcements
        
        Args:
            message (str): Announcement message
            department (str): Department code (e.g., 'CSE', 'ECE')
            section (str): Section name (e.g., 'A', 'B')
        
        Returns:
            dict: Operation result
        """
        try:
            db = get_firestore()
            
            # Build query based on department and section
            query = db.collection('students').where('status', '==', 'active')
            
            if department:
                query = query.where('department', '==', department)
            
            if section:
                query = query.where('section', '==', section)
            
            # Fetch matching students
            students = []
            for doc in query.stream():
                student = doc.to_dict()
                student['id'] = doc.id
                students.append(student)
            
            if not students:
                return {
                    'success': False,
                    'message': 'No students found in specified class',
                    'error': 'No matching students'
                }
            
            # Extract phone numbers
            phone_numbers = [s.get('parent_phone') for s in students if s.get('parent_phone')]
            
            # Send bulk SMS
            sms_results = send_bulk_sms(phone_numbers, f"📢 Announcement: {message}")
            
            # Log notifications
            for student in students:
                log_notification(
                    student['id'],
                    'announcement',
                    message,
                    student.get('parent_phone'),
                    'sent'
                )
            
            return {
                'success': True,
                'message': f'Announcement sent to {sms_results["successful"]} parent(s)',
                'data': {
                    'total': sms_results['total'],
                    'sent': sms_results['successful'],
                    'failed': sms_results['failed']
                }
            }
        
        except Exception as e:
            print(f"❌ Error in send_announcement_to_class: {e}")
            return {
                'success': False,
                'message': 'Server error',
                'error': str(e)
            }
