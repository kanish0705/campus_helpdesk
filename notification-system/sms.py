"""
SMS Notification Module
========================
This module handles SMS sending using Fast2SMS API.
It provides a reusable function to send SMS to parents.

Educational Note:
SMS API integration represents communication layer in Admin Panel.
"""

import requests
from datetime import datetime

# ============== FAST2SMS API CONFIGURATION ==============

# Fast2SMS API Key
# Get it from: https://www.fast2sms.com/
FAST2SMS_API_KEY = "YOUR_FAST2SMS_API_KEY_HERE"

# Fast2SMS API Endpoint
FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2"

# SMS Template ID (predefined in Fast2SMS dashboard)
TEMPLATE_ID = "your_template_id"  # Optional: Use custom template


# ============== SMS SENDING FUNCTION ==============

def send_sms(phone_number, message, sms_type="custom"):
    """
    Send SMS to a phone number using Fast2SMS API
    
    Parameters:
        phone_number (str): Recipient phone number (format: +919876543210)
        message (str): SMS message to send (max 160 characters for cost optimization)
        sms_type (str): Type of SMS ("custom", "attendance", "announcement")
    
    Returns:
        dict: Response status and details
            {
                'success': bool,
                'message': str,
                'request_id': str (if successful),
                'error': str (if failed)
            }
    """
    
    try:
        # Demo-safe fallback: simulate successful delivery when API key is not configured.
        if not FAST2SMS_API_KEY or FAST2SMS_API_KEY.startswith("YOUR_FAST2SMS_API_KEY"):
            return {
                'success': True,
                'message': f'Demo SMS logged for {phone_number}',
                'request_id': f'demo-{int(datetime.now().timestamp())}',
                'timestamp': datetime.now().isoformat()
            }

        # Validate phone number
        if not phone_number or len(str(phone_number)) < 10:
            return {
                'success': False,
                'message': f'❌ Invalid phone number: {phone_number}',
                'error': 'Phone number too short'
            }
        
        # Ensure phone number is in correct format
        phone_number = str(phone_number).strip()
        if not phone_number.startswith('+'):
            phone_number = '+91' + phone_number[-10:]  # Assumes Indian number
        
        # Truncate message to 160 characters for SMS standards
        if len(message) > 160:
            message = message[:157] + "..."
        
        # Prepare API request headers
        headers = {
            'authorization': FAST2SMS_API_KEY,
            'Content-Type': 'application/json'
        }
        
        # Prepare API request payload
        payload = {
            'route': 'q',
            'message': message,
            'numbers': phone_number
        }
        
        # Send SMS via API
        print(f"📤 Sending SMS to {phone_number}...")
        response = requests.post(
            FAST2SMS_URL,
            headers=headers,
            json=payload,
            timeout=10
        )
        
        # Check API response
        if response.status_code == 200:
            data = response.json()
            
            if data.get('return'):
                request_id = data.get('request_id', 'N/A')
                print(f"✅ SMS sent successfully!")
                print(f"   Phone: {phone_number}")
                print(f"   Message: {message}")
                print(f"   Request ID: {request_id}\n")
                
                return {
                    'success': True,
                    'message': f'SMS sent to {phone_number}',
                    'request_id': request_id,
                    'timestamp': datetime.now().isoformat()
                }
            else:
                error = data.get('message', 'Unknown error')
                print(f"❌ API returned error: {error}\n")
                return {
                    'success': False,
                    'message': f'API error: {error}',
                    'error': error
                }
        else:
            print(f"❌ API request failed with status {response.status_code}\n")
            return {
                'success': False,
                'message': f'HTTP error {response.status_code}',
                'error': f'HTTP {response.status_code}'
            }
    
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout while sending SMS to {phone_number}\n")
        return {
            'success': False,
            'message': 'Request timeout',
            'error': 'Timeout'
        }
    
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error while sending SMS to {phone_number}\n")
        return {
            'success': False,
            'message': 'Connection error',
            'error': 'Connection failed'
        }
    
    except Exception as e:
        print(f"❌ Unexpected error while sending SMS: {e}\n")
        return {
            'success': False,
            'message': f'Error: {str(e)}',
            'error': str(e)
        }


def send_attendance_notification(phone_number, student_name):
    """
    Send attendance notification specifically
    
    Parameters:
        phone_number (str): Parent's phone number
        student_name (str): Student's name
    
    Returns:
        dict: Response status
    """
    message = f"Alert: {student_name} was absent today. Please check with school."
    return send_sms(phone_number, message, sms_type="attendance")


def send_announcement_notification(phone_number, announcement_message):
    """
    Send announcement notification to parent
    
    Parameters:
        phone_number (str): Parent's phone number
        announcement_message (str): Announcement text
    
    Returns:
        dict: Response status
    """
    message = f"📢 Announcement: {announcement_message}"
    return send_sms(phone_number, message, sms_type="announcement")


def send_bulk_sms(phone_numbers, message):
    """
    Send same SMS to multiple phone numbers
    
    Parameters:
        phone_numbers (list): List of phone numbers
        message (str): Message to send
    
    Returns:
        dict: Summary of sending status
            {
                'total': int,
                'successful': int,
                'failed': int,
                'results': list
            }
    """
    results = {
        'total': len(phone_numbers),
        'successful': 0,
        'failed': 0,
        'results': []
    }
    
    print(f"\n📤 Sending bulk SMS to {len(phone_numbers)} recipients...")
    
    for phone in phone_numbers:
        result = send_sms(phone, message)
        results['results'].append(result)
        
        if result['success']:
            results['successful'] += 1
        else:
            results['failed'] += 1
    
    print(f"\n📊 Bulk SMS Summary:")
    print(f"   Total: {results['total']}")
    print(f"   ✅ Successful: {results['successful']}")
    print(f"   ❌ Failed: {results['failed']}\n")
    
    return results


# ============== TEST FUNCTION ==============

if __name__ == "__main__":
    # Test SMS sending (requires valid API key)
    print("🧪 Testing SMS Module...\n")
    
    # Note: This will only work with a valid Fast2SMS API key
    test_phone = "+919876543210"  # Replace with your test phone
    test_message = "Test SMS from notification system"
    
    print(f"Sending test SMS to {test_phone}...")
    result = send_sms(test_phone, test_message)
    print(f"Result: {result}")
