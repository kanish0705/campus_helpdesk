"""
Sample Data Initialization Script
==================================
This script initializes the Firestore database with sample student data.
Run this once after setting up Firebase credentials.

Usage:
    python setup_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from firebase_config import add_student, initialize_sample_data, get_all_students


def main():
    """
    Main function to initialize sample data
    """
    print("\n" + "="*60)
    print("📚 SAMPLE DATA INITIALIZATION")
    print("="*60 + "\n")
    
    print("🔄 Initializing database with sample students...\n")
    
    # Initialize sample data
    initialize_sample_data()
    
    # Verify initialization
    students = get_all_students()
    
    print("\n✅ DATABASE INITIALIZED SUCCESSFULLY!\n")
    print(f"📊 Total Students: {len(students)}\n")
    
    print("Student List:")
    print("-" * 60)
    print(f"{'ID':<6} | {'Name':<20} | {'Parent Phone':<15}")
    print("-" * 60)
    
    for student in students:
        print(
            f"{student['student_id']:<6} | "
            f"{student['name']:<20} | "
            f"{student['parent_phone']:<15}"
        )
    
    print("-" * 60 + "\n")
    print("✅ Ready to use API endpoints!")
    print("📍 Start server: python app.py")
    print("📡 API URL: http://localhost:5000\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Please ensure:")
        print("  1. serviceAccountKey.json is in current directory")
        print("  2. Firebase project is set up correctly")
        print("  3. Firestore database is created")
        sys.exit(1)
