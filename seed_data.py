"""
Student Portal - College Management System
Database Seeder Script with Attendance Data
Run: python seed_data.py
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from main import Base, User, Timetable, Announcement, AttendanceSummary

# Database connection
# Must match main.py so seeded users are available to the login API.
DATABASE_URL = "sqlite:///./campus.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    # Drop all tables and recreate them (to update schema)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("🗑️  Dropped and recreated tables...")
        
        # ============== USERS ==============
        users = [
            # Admin
            User(
                email="admin@college.edu",
                password="admin123",
                name="Dr. Admin Kumar",
                roll_number="ADMIN001",
                role="ADMIN",
                dept="ALL",
                section="ALL",
                sem=0
            ),
            # Students
            User(
                email="student1@college.edu",
                password="password123",
                name="Rahul Sharma",
                roll_number="21CSE101",
                role="STUDENT",
                dept="CSE",
                section="A",
                sem=4
            ),
            User(
                email="student2@college.edu",
                password="password123",
                name="Priya Singh",
                roll_number="21CSE102",
                role="STUDENT",
                dept="CSE",
                section="A",
                sem=4
            ),
            User(
                email="student3@college.edu",
                password="password123",
                name="Amit Patel",
                roll_number="21ECE101",
                role="STUDENT",
                dept="ECE",
                section="B",
                sem=6
            ),
            User(
                email="student4@college.edu",
                password="password123",
                name="Sneha Gupta",
                roll_number="23ME101",
                role="STUDENT",
                dept="ME",
                section="A",
                sem=2
            ),
            User(
                email="student5@college.edu",
                password="password123",
                name="Vikram Reddy",
                roll_number="21CSE201",
                role="STUDENT",
                dept="CSE",
                section="B",
                sem=4
            ),
        ]
        
        db.add_all(users)
        db.commit()
        print("✅ Added 6 users (1 admin + 5 students)")
        
        # ============== TIMETABLE ==============
        timetable_entries = [
            # CSE Section A, Sem 4
            Timetable(day_of_week="Monday", period_slots="09:00-10:00", subject_name="Data Structures", room_number="CS-101", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Monday", period_slots="10:00-11:00", subject_name="Operating Systems", room_number="CS-102", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Monday", period_slots="11:30-12:30", subject_name="Database Management", room_number="CS-Lab-1", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Tuesday", period_slots="09:00-10:00", subject_name="Computer Networks", room_number="CS-103", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Tuesday", period_slots="11:00-12:00", subject_name="Data Structures Lab", room_number="CS-Lab-2", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Wednesday", period_slots="09:00-10:00", subject_name="Operating Systems", room_number="CS-102", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Wednesday", period_slots="10:30-11:30", subject_name="Software Engineering", room_number="CS-104", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Thursday", period_slots="09:00-10:00", subject_name="Database Management", room_number="CS-101", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Thursday", period_slots="11:00-12:00", subject_name="Computer Networks", room_number="CS-103", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Thursday", period_slots="02:00-03:00", subject_name="DBMS Lab", room_number="CS-Lab-1", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Friday", period_slots="09:00-10:00", subject_name="Data Structures", room_number="CS-101", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Friday", period_slots="10:00-11:00", subject_name="Software Engineering", room_number="CS-104", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Friday", period_slots="02:00-03:00", subject_name="OS Lab", room_number="CS-Lab-3", dept="CSE", section="A", sem=4),
            Timetable(day_of_week="Saturday", period_slots="09:00-10:00", subject_name="Computer Networks", room_number="CS-103", dept="CSE", section="A", sem=4),
            
            # CSE Section B, Sem 4
            Timetable(day_of_week="Monday", period_slots="10:00-11:00", subject_name="Data Structures", room_number="CS-201", dept="CSE", section="B", sem=4),
            Timetable(day_of_week="Monday", period_slots="11:00-12:00", subject_name="Operating Systems", room_number="CS-202", dept="CSE", section="B", sem=4),
            Timetable(day_of_week="Tuesday", period_slots="09:00-10:00", subject_name="Database Management", room_number="CS-201", dept="CSE", section="B", sem=4),
            Timetable(day_of_week="Wednesday", period_slots="10:00-11:00", subject_name="Computer Networks", room_number="CS-203", dept="CSE", section="B", sem=4),
            Timetable(day_of_week="Thursday", period_slots="09:00-10:00", subject_name="Software Engineering", room_number="CS-204", dept="CSE", section="B", sem=4),
            
            # ECE Section B, Sem 6
            Timetable(day_of_week="Monday", period_slots="09:00-10:00", subject_name="Digital Signal Processing", room_number="EC-101", dept="ECE", section="B", sem=6),
            Timetable(day_of_week="Monday", period_slots="11:00-12:00", subject_name="VLSI Design", room_number="EC-Lab-1", dept="ECE", section="B", sem=6),
            Timetable(day_of_week="Tuesday", period_slots="10:00-11:00", subject_name="Embedded Systems", room_number="EC-102", dept="ECE", section="B", sem=6),
            Timetable(day_of_week="Wednesday", period_slots="09:00-10:00", subject_name="Microprocessors", room_number="EC-103", dept="ECE", section="B", sem=6),
            Timetable(day_of_week="Thursday", period_slots="11:00-12:00", subject_name="Communication Systems", room_number="EC-101", dept="ECE", section="B", sem=6),
            
            # ME Section A, Sem 2
            Timetable(day_of_week="Monday", period_slots="09:00-10:00", subject_name="Engineering Mechanics", room_number="ME-101", dept="ME", section="A", sem=2),
            Timetable(day_of_week="Tuesday", period_slots="10:00-11:00", subject_name="Thermodynamics", room_number="ME-102", dept="ME", section="A", sem=2),
            Timetable(day_of_week="Wednesday", period_slots="11:00-12:00", subject_name="Workshop Practice", room_number="Workshop", dept="ME", section="A", sem=2),
            Timetable(day_of_week="Thursday", period_slots="09:00-10:00", subject_name="Engineering Drawing", room_number="ME-Lab", dept="ME", section="A", sem=2),
        ]
        
        db.add_all(timetable_entries)
        db.commit()
        print(f"✅ Added {len(timetable_entries)} timetable entries")
        
        # ============== ANNOUNCEMENTS ==============
        announcements = [
            Announcement(
                title="Mid-Semester Exams Schedule Released",
                body="The mid-semester examination schedule for Sem 4 has been released. Exams will commence from March 20th. Please check the examination portal for detailed timetable.",
                target_dept="ALL",
                image_url="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
                priority="urgent",
                date=datetime.now()
            ),
            Announcement(
                title="Placement Drive - TCS",
                body="TCS is conducting campus recruitment on March 25th. Eligible students (CGPA > 6.5, no backlogs) must register on the placement portal by March 18th.",
                target_dept="CSE",
                image_url="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop",
                priority="high",
                date=datetime.now()
            ),
            Announcement(
                title="Hackathon 2026 - Register Now",
                body="College is hosting a 48-hour hackathon on April 5-6. Teams of 4 can register. Prizes worth Rs. 1 Lakh! Registration closes March 30th.",
                target_dept="CSE",
                image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop",
                priority="normal",
                date=datetime.now()
            ),
            Announcement(
                title="Library Hours Extended",
                body="The central library will remain open until 10 PM during the examination period. Make use of this facility for your exam preparations.",
                target_dept="ALL",
                priority="normal",
                date=datetime.now()
            ),
            Announcement(
                title="Guest Lecture on AI/ML",
                body="Dr. Pradeep Kumar from IIT Hyderabad will deliver a guest lecture on 'Future of AI in Healthcare' on March 22nd at 3 PM in the main auditorium.",
                target_dept="CSE",
                priority="normal",
                date=datetime.now()
            ),
            Announcement(
                title="Lab Equipment Maintenance",
                body="ECE labs will be closed for maintenance on March 15th. Please plan your practical sessions accordingly.",
                target_dept="ECE",
                priority="normal",
                date=datetime.now()
            ),
        ]
        
        db.add_all(announcements)
        db.commit()
        print(f"✅ Added {len(announcements)} announcements")
        
        # ============== ATTENDANCE SUMMARY ==============
        attendance_data = [
            # Rahul Sharma (student1@college.edu) - CSE A, Sem 4
            AttendanceSummary(student_email="student1@college.edu", subject_name="Data Structures", total=30, attended=24, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student1@college.edu", subject_name="Operating Systems", total=28, attended=21, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student1@college.edu", subject_name="Database Management", total=25, attended=18, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student1@college.edu", subject_name="Computer Networks", total=26, attended=20, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student1@college.edu", subject_name="Software Engineering", total=22, attended=18, dept="CSE", section="A", sem=4),
            
            # Priya Singh (student2@college.edu) - CSE A, Sem 4
            AttendanceSummary(student_email="student2@college.edu", subject_name="Data Structures", total=30, attended=28, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student2@college.edu", subject_name="Operating Systems", total=28, attended=26, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student2@college.edu", subject_name="Database Management", total=25, attended=24, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student2@college.edu", subject_name="Computer Networks", total=26, attended=25, dept="CSE", section="A", sem=4),
            AttendanceSummary(student_email="student2@college.edu", subject_name="Software Engineering", total=22, attended=21, dept="CSE", section="A", sem=4),
            
            # Amit Patel (student3@college.edu) - ECE B, Sem 6
            AttendanceSummary(student_email="student3@college.edu", subject_name="Digital Signal Processing", total=28, attended=16, dept="ECE", section="B", sem=6),
            AttendanceSummary(student_email="student3@college.edu", subject_name="VLSI Design", total=24, attended=15, dept="ECE", section="B", sem=6),
            AttendanceSummary(student_email="student3@college.edu", subject_name="Embedded Systems", total=26, attended=17, dept="ECE", section="B", sem=6),
            AttendanceSummary(student_email="student3@college.edu", subject_name="Microprocessors", total=22, attended=14, dept="ECE", section="B", sem=6),
            AttendanceSummary(student_email="student3@college.edu", subject_name="Communication Systems", total=20, attended=12, dept="ECE", section="B", sem=6),
            
            # Sneha Gupta (student4@college.edu) - ME A, Sem 2
            AttendanceSummary(student_email="student4@college.edu", subject_name="Engineering Mechanics", total=30, attended=27, dept="ME", section="A", sem=2),
            AttendanceSummary(student_email="student4@college.edu", subject_name="Thermodynamics", total=28, attended=25, dept="ME", section="A", sem=2),
            AttendanceSummary(student_email="student4@college.edu", subject_name="Workshop Practice", total=20, attended=18, dept="ME", section="A", sem=2),
            AttendanceSummary(student_email="student4@college.edu", subject_name="Engineering Drawing", total=24, attended=22, dept="ME", section="A", sem=2),
            
            # Vikram Reddy (student5@college.edu) - CSE B, Sem 4
            AttendanceSummary(student_email="student5@college.edu", subject_name="Data Structures", total=30, attended=22, dept="CSE", section="B", sem=4),
            AttendanceSummary(student_email="student5@college.edu", subject_name="Operating Systems", total=28, attended=20, dept="CSE", section="B", sem=4),
            AttendanceSummary(student_email="student5@college.edu", subject_name="Database Management", total=25, attended=19, dept="CSE", section="B", sem=4),
            AttendanceSummary(student_email="student5@college.edu", subject_name="Computer Networks", total=26, attended=19, dept="CSE", section="B", sem=4),
            AttendanceSummary(student_email="student5@college.edu", subject_name="Software Engineering", total=22, attended=17, dept="CSE", section="B", sem=4),
        ]
        
        db.add_all(attendance_data)
        db.commit()
        print(f"✅ Added {len(attendance_data)} attendance records")
        
        print("\n" + "="*50)
        print("🎉 Database seeded successfully!")
        print("="*50)
        print("\n📋 Test Accounts:")
        print("-" * 40)
        print("👨‍🎓 Student 1: student1@college.edu / password123")
        print("   (CSE-A, Sem 4, ~77% attendance - WARNING)")
        print("👩‍🎓 Student 2: student2@college.edu / password123")
        print("   (CSE-A, Sem 4, ~95% attendance - SAFE)")
        print("👨‍🎓 Student 3: student3@college.edu / password123")
        print("   (ECE-B, Sem 6, ~62% attendance - DANGER)")
        print("👩‍🎓 Student 4: student4@college.edu / password123")
        print("   (ME-A, Sem 2, ~90% attendance - SAFE)")
        print("👨‍🎓 Student 5: student5@college.edu / password123")
        print("   (CSE-B, Sem 4, ~74% attendance - WARNING)")
        print("-" * 40)
        print("👨‍💼 Admin: admin@college.edu / admin123")
        print("-" * 40)
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
