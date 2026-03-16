"""
Student Management Portal
College Campus Management System
Built with FastAPI + SQLAlchemy
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, Date, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
import io
import os
import json
import httpx
import math
from openpyxl import load_workbook

# ============== ENVIRONMENT & CONFIG ==============
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DATABASE_URL = "sqlite:///./campus.db"

# Load College Data from JSON
def load_college_data():
    try:
        with open("college_data.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

COLLEGE_DATA = load_college_data()

# ============== DATABASE SETUP ==============
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============== MODULAR DATABASE MODELS ==============

class User(Base):
    """User model for students and admins"""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(100))
    name = Column(String(100))
    roll_number = Column(String(20), unique=True, nullable=True)
    role = Column(String(20), default="STUDENT")  # ADMIN or STUDENT
    dept = Column(String(50))
    section = Column(String(10))
    sem = Column(Integer)

class Attendance(Base):
    """Detailed attendance records per class"""
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_email = Column(String(100), index=True)
    subject_name = Column(String(100))
    date = Column(Date, index=True)
    status = Column(String(10))  # PRESENT, ABSENT, LATE
    dept = Column(String(50))
    section = Column(String(10))
    sem = Column(Integer)

class AttendanceSummary(Base):
    """Aggregated attendance summary per subject"""
    __tablename__ = "attendance_summary"
    id = Column(Integer, primary_key=True, index=True)
    student_email = Column(String(100), index=True)
    subject_name = Column(String(100), index=True)
    attended = Column(Integer, default=0)
    total = Column(Integer, default=0)
    threshold_target = Column(Float, default=75.0)  # Default 75%
    dept = Column(String(50))
    section = Column(String(10))
    sem = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)

class Timetable(Base):
    """Class timetable entries"""
    __tablename__ = "timetable"
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String(20))  # Monday, Tuesday, etc.
    period_slots = Column(String(20))  # e.g., "9:00-10:00"
    subject_name = Column(String(100))
    room_number = Column(String(20))
    faculty_name = Column(String(100), nullable=True)
    resource_details = Column(Text, nullable=True)
    dept = Column(String(50))
    section = Column(String(10))
    sem = Column(Integer)

class Announcement(Base):
    """College announcements for students"""
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    body = Column(Text)  # Renamed from 'content' as per requirements
    image_url = Column(String(500), nullable=True)
    date = Column(DateTime, default=datetime.utcnow)  # Changed from created_at
    target_dept = Column(String(50))  # "ALL" for all departments
    target_depts = Column(Text, nullable=True)  # CSV format e.g. "CSE,ECE"
    target_sections = Column(Text, nullable=True)  # CSV format e.g. "A,B"
    target_semesters = Column(Text, nullable=True)  # CSV format e.g. "2,4,6"
    priority = Column(String(20), default="normal")  # low, normal, high, urgent


class Resource(Base):
    """Academic resources shared with students"""
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text, nullable=True)
    resource_type = Column(String(50), default="DOCUMENT")  # DOCUMENT, LINK, VIDEO, OTHER
    resource_url = Column(String(500), nullable=True)
    dept = Column(String(50), default="ALL")
    section = Column(String(10), default="ALL")
    sem = Column(Integer, default=0)  # 0 means all semesters
    uploaded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def migrate_schema_if_needed():
    """Add newly introduced columns for existing SQLite databases."""
    with engine.connect() as conn:
        timetable_cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(timetable)").fetchall()}
        if "resource_details" not in timetable_cols:
            conn.exec_driver_sql("ALTER TABLE timetable ADD COLUMN resource_details TEXT")

        announcement_cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(announcements)").fetchall()}
        if "target_depts" not in announcement_cols:
            conn.exec_driver_sql("ALTER TABLE announcements ADD COLUMN target_depts TEXT")
        if "target_sections" not in announcement_cols:
            conn.exec_driver_sql("ALTER TABLE announcements ADD COLUMN target_sections TEXT")
        if "target_semesters" not in announcement_cols:
            conn.exec_driver_sql("ALTER TABLE announcements ADD COLUMN target_semesters TEXT")


# Create all tables
Base.metadata.create_all(bind=engine)
migrate_schema_if_needed()

# ============== PYDANTIC SCHEMAS ==============

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    roll_number: Optional[str] = None
    role: str
    dept: str
    section: str
    sem: int

    class Config:
        from_attributes = True

class AttendanceRecord(BaseModel):
    """Individual subject attendance record"""
    subject_name: str
    attended: int
    total: int
    percentage: float
    threshold_target: float
    status: str  # SAFE, WARNING, DANGER, NO_DATA
    classes_needed: Optional[int] = None
    safe_bunks: Optional[int] = None

class AttendanceResponse(BaseModel):
    """Complete attendance data for a student"""
    overall_percentage: float
    overall_status: str
    subjects: List[AttendanceRecord]
    last_updated: Optional[datetime] = None

class TimetableResponse(BaseModel):
    """Timetable entry response"""
    id: int
    day_of_week: str
    period_slots: str
    subject_name: str
    room_number: str
    faculty_name: Optional[str] = None
    resource_details: Optional[str] = None

    class Config:
        from_attributes = True

class AnnouncementResponse(BaseModel):
    """Announcement card response"""
    id: int
    title: str
    body: str
    image_url: Optional[str] = None
    date: Optional[datetime] = None
    target_dept: str
    target_depts: Optional[List[str]] = None
    target_sections: Optional[List[str]] = None
    target_semesters: Optional[List[int]] = None
    priority: Optional[str] = "normal"

    class Config:
        from_attributes = True

class DashboardResponse(BaseModel):
    """Complete dashboard data"""
    timetable: List[TimetableResponse]
    announcements: List[AnnouncementResponse]
    attendance: Optional[AttendanceResponse] = None

class ChatRequest(BaseModel):
    message: str
    user_email: str

class ChatResponse(BaseModel):
    response: str

class QuickSyncResponse(BaseModel):
    """Quick Sync endpoint response with latest data"""
    attendance: AttendanceResponse
    announcements: List[AnnouncementResponse]
    sync_timestamp: datetime
    data_freshness: str  # "fresh", "updated", "cached"

# Create schemas for admin operations
class AnnouncementCreate(BaseModel):
    title: str
    body: str
    target_dept: str
    target_depts: Optional[List[str]] = None
    target_sections: Optional[List[str]] = None
    target_semesters: Optional[List[int]] = None
    image_url: Optional[str] = None
    priority: Optional[str] = "normal"

class TimetableCreate(BaseModel):
    day_of_week: str
    period_slots: str
    subject_name: str
    room_number: str
    faculty_name: Optional[str] = None
    resource_details: Optional[str] = None
    dept: str
    section: str
    sem: int


class TimetableMatrixCell(BaseModel):
    subject_name: str
    room_number: str
    faculty_name: Optional[str] = None
    resource_details: Optional[str] = None


class TimetableMatrixResponse(BaseModel):
    time_slots: List[str]
    days: List[str]
    matrix: Dict[str, Dict[str, Optional[TimetableMatrixCell]]]


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: str = "DOCUMENT"
    resource_url: Optional[str] = None
    dept: str = "ALL"
    section: str = "ALL"
    sem: int = 0


class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    resource_type: str
    resource_url: Optional[str] = None
    dept: str
    section: str
    sem: int
    uploaded_by: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============== ATTENDANCE CALCULATION ENGINE ==============

def calculate_attendance_percentage(attended: int, total: int) -> float:
    """Calculate percentage attendance"""
    if total == 0:
        return 0.0
    return round((attended / total) * 100, 2)

def get_attendance_status(percentage: float, threshold: float = 75.0) -> str:
    """Determine attendance status based on percentage"""
    if percentage >= threshold:
        return "SAFE"
    elif percentage >= (threshold - 10):
        return "WARNING"
    else:
        return "DANGER"

def calculate_classes_needed_to_reach_target(
    attended: int, 
    total: int, 
    target_percentage: float = 75.0
) -> int:
    """
    Calculate consecutive classes needed to reach target percentage.
    
    Formula: (attended + x) / (total + x) >= target/100
    Solving for x: x >= (target * total - 100 * attended) / (100 - target)
    """
    if total == 0:
        return int(math.ceil(target_percentage / 100))
    
    current_percentage = (attended / total) * 100
    
    # Already at target
    if current_percentage >= target_percentage:
        return 0
    
    numerator = (target_percentage * total) - (100 * attended)
    denominator = 100 - target_percentage
    
    classes_needed = math.ceil(numerator / denominator)
    return max(0, classes_needed)

def calculate_safe_bunks(
    attended: int,
    total: int,
    threshold: float = 75.0
) -> int:
    """
    Calculate how many classes can be missed while maintaining threshold.
    
    Formula: (attended) / (total + x) >= threshold/100
    Solving for x: x <= (100 * attended - threshold * total) / threshold
    """
    if total == 0:
        return 0
    
    current_percentage = (attended / total) * 100
    
    # Below threshold
    if current_percentage < threshold:
        return 0
    
    numerator = (100 * attended) - (threshold * total)
    denominator = threshold
    
    safe_bunks = int(math.floor(numerator / denominator))
    return max(0, safe_bunks)


def csv_to_list(raw: Optional[str]) -> List[str]:
    if not raw:
        return []
    return [item.strip() for item in raw.split(",") if item and item.strip()]


def int_csv_to_list(raw: Optional[str]) -> List[int]:
    values = []
    for item in csv_to_list(raw):
        try:
            values.append(int(item))
        except ValueError:
            continue
    return values


def list_to_csv(values: Optional[List[Any]]) -> Optional[str]:
    if not values:
        return None
    cleaned = [str(v).strip() for v in values if str(v).strip()]
    return ",".join(cleaned) if cleaned else None


def get_admin_or_403(db: Session, admin_email: str):
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin or admin.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return admin


def assert_role_barrier(admin: User, dept: str, section: str):
    dept_ok = admin.dept == "ALL" or admin.dept == dept
    section_ok = admin.section == "ALL" or admin.section == section
    if not (dept_ok and section_ok):
        raise HTTPException(status_code=403, detail="Not allowed outside your assigned department/section")


def announcement_visible_for_user(announcement: Announcement, user: User) -> bool:
    depts = csv_to_list(announcement.target_depts)
    sections = csv_to_list(announcement.target_sections)
    semesters = int_csv_to_list(announcement.target_semesters)

    if announcement.target_dept == "ALL" and not depts and not sections and not semesters:
        return True

    dept_match = (announcement.target_dept == "ALL") or (announcement.target_dept == user.dept)
    if depts:
        dept_match = user.dept in depts

    section_match = True if not sections else (user.section in sections)
    semester_match = True if not semesters else (user.sem in semesters)

    return dept_match and section_match and semester_match


def serialize_announcement(announcement: Announcement) -> Dict[str, Any]:
    return {
        "id": announcement.id,
        "title": announcement.title,
        "body": announcement.body,
        "image_url": announcement.image_url,
        "date": announcement.date,
        "target_dept": announcement.target_dept,
        "target_depts": csv_to_list(announcement.target_depts),
        "target_sections": csv_to_list(announcement.target_sections),
        "target_semesters": int_csv_to_list(announcement.target_semesters),
        "priority": announcement.priority,
    }


def resource_visible_for_user(resource: Resource, user: User) -> bool:
    dept_match = resource.dept in ["ALL", user.dept]
    section_match = resource.section in ["ALL", user.section]
    sem_match = resource.sem in [0, user.sem]
    return dept_match and section_match and sem_match

def get_student_attendance(db: Session, email: str, threshold: float = 75.0) -> AttendanceResponse:
    """
    Comprehensive attendance calculation for a student.
    Returns overall and subject-wise attendance with actionable insights.
    """
    summaries = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == email
    ).all()
    
    if not summaries:
        return AttendanceResponse(
            overall_percentage=0,
            overall_status="NO_DATA",
            subjects=[]
        )
    
    subject_records = []
    total_attended = 0
    total_classes = 0
    last_updated = None
    
    for summary in summaries:
        percentage = calculate_attendance_percentage(summary.attended, summary.total)
        status = get_attendance_status(percentage, summary.threshold_target)
        
        classes_needed = None
        safe_bunks = None
        
        if percentage < summary.threshold_target:
            classes_needed = calculate_classes_needed_to_reach_target(
                summary.attended, 
                summary.total, 
                summary.threshold_target
            )
        else:
            safe_bunks = calculate_safe_bunks(
                summary.attended,
                summary.total,
                summary.threshold_target
            )
        
        subject_records.append(AttendanceRecord(
            subject_name=summary.subject_name,
            attended=summary.attended,
            total=summary.total,
            percentage=percentage,
            threshold_target=summary.threshold_target,
            status=status,
            classes_needed=classes_needed,
            safe_bunks=safe_bunks
        ))
        
        total_attended += summary.attended
        total_classes += summary.total
        
        if last_updated is None or summary.last_updated > last_updated:
            last_updated = summary.last_updated
    
    overall_percentage = calculate_attendance_percentage(total_attended, total_classes)
    overall_status = get_attendance_status(overall_percentage, threshold)
    
    return AttendanceResponse(
        overall_percentage=overall_percentage,
        overall_status=overall_status,
        subjects=subject_records,
        last_updated=last_updated
    )

# ============== FASTAPI APP ==============
app = FastAPI(
    title="Student Management Portal",
    version="3.0",
    description="Professional Mobile-First Campus Management System"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== CREATE DATABASE TABLES ==============
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============== AUTHENTICATION ENDPOINTS ==============

@app.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint - returns user profile"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

# ============== DASHBOARD ENDPOINTS ==============

@app.get("/student/dashboard", response_model=DashboardResponse)
def get_student_dashboard(email: str, db: Session = Depends(get_db)):
    """Get personalized dashboard for a student"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get timetable
    timetable = db.query(Timetable).filter(
        Timetable.dept == user.dept,
        Timetable.section == user.section,
        Timetable.sem == user.sem
    ).all()
    
    # Get announcements
    all_announcements = db.query(Announcement).order_by(Announcement.date.desc()).all()
    announcements = [
        serialize_announcement(ann)
        for ann in all_announcements
        if announcement_visible_for_user(ann, user)
    ]
    
    # Get attendance
    attendance = get_student_attendance(db, email)
    
    return {
        "timetable": timetable,
        "announcements": announcements,
        "attendance": attendance
    }

# ============== ATTENDANCE ENDPOINTS ==============

@app.get("/student/attendance", response_model=AttendanceResponse)
def get_attendance(email: str, db: Session = Depends(get_db)):
    """Get detailed attendance for a student"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_student_attendance(db, email)

@app.get("/student/attendance/{subject_name}")
def get_subject_attendance(email: str, subject_name: str, db: Session = Depends(get_db)):
    """Get attendance for a specific subject"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    summary = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == email,
        AttendanceSummary.subject_name == subject_name
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    percentage = calculate_attendance_percentage(summary.attended, summary.total)
    status = get_attendance_status(percentage, summary.threshold_target)
    classes_needed = calculate_classes_needed_to_reach_target(
        summary.attended, 
        summary.total, 
        summary.threshold_target
    ) if percentage < summary.threshold_target else None
    safe_bunks = calculate_safe_bunks(
        summary.attended,
        summary.total,
        summary.threshold_target
    ) if percentage >= summary.threshold_target else None
    
    return {
        "subject_name": summary.subject_name,
        "attended": summary.attended,
        "total": summary.total,
        "percentage": percentage,
        "threshold_target": summary.threshold_target,
        "status": status,
        "classes_needed": classes_needed,
        "safe_bunks": safe_bunks,
        "message": (
            f"Attend {classes_needed} consecutive classes to reach {summary.threshold_target}%"
            if classes_needed else 
            f"You have {safe_bunks} safe bunks remaining!"
        )
    }

# ============== QUICK SYNC ENDPOINT ==============

@app.post("/student/quick-sync", response_model=QuickSyncResponse)
def quick_sync(email: str, db: Session = Depends(get_db)):
    """
    Quick Sync endpoint - Simulates fetching fresh data from ERP like Anveshna.
    Returns latest attendance and announcements in one call.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get updated attendance
    attendance = get_student_attendance(db, email)
    
    # Get latest announcements
    all_announcements = db.query(Announcement).order_by(Announcement.date.desc()).all()
    announcements = [
        serialize_announcement(ann)
        for ann in all_announcements
        if announcement_visible_for_user(ann, user)
    ][:10]
    
    return {
        "attendance": attendance,
        "announcements": announcements,
        "sync_timestamp": datetime.utcnow(),
        "data_freshness": "fresh"
    }

# ============== TIMETABLE ENDPOINTS ==============

@app.get("/student/timetable")
def get_student_timetable(email: str, db: Session = Depends(get_db)):
    """Get timetable for a student"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    timetable = db.query(Timetable).filter(
        Timetable.dept == user.dept,
        Timetable.section == user.section,
        Timetable.sem == user.sem
    ).order_by(
        Timetable.day_of_week
    ).all()
    
    return {"timetable": timetable}


@app.get("/student/timetable-matrix", response_model=TimetableMatrixResponse)
def get_student_timetable_matrix(email: str, db: Session = Depends(get_db)):
    """Get timetable as matrix: rows=time slots, columns=days."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = db.query(Timetable).filter(
        Timetable.dept == user.dept,
        Timetable.section == user.section,
        Timetable.sem == user.sem
    ).all()

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    time_slots = sorted(list({entry.period_slots for entry in entries}))
    matrix: Dict[str, Dict[str, Optional[Dict[str, Any]]]] = {
        slot: {day: None for day in days} for slot in time_slots
    }

    for entry in entries:
        if entry.period_slots in matrix and entry.day_of_week in matrix[entry.period_slots]:
            matrix[entry.period_slots][entry.day_of_week] = {
                "subject_name": entry.subject_name,
                "room_number": entry.room_number,
                "faculty_name": entry.faculty_name,
                "resource_details": entry.resource_details,
            }

    return {
        "time_slots": time_slots,
        "days": days,
        "matrix": matrix,
    }

# ============== ANNOUNCEMENT ENDPOINTS ==============

@app.get("/announcements")
def get_announcements(dept: Optional[str] = None, db: Session = Depends(get_db)):
    """Get announcements"""
    query = db.query(Announcement)
    
    if dept:
        query = query.filter(
            (Announcement.target_dept == dept) | (Announcement.target_dept == "ALL")
        )
    
    return [serialize_announcement(ann) for ann in query.order_by(Announcement.date.desc()).all()]


# ============== RESOURCE ENDPOINTS ==============

@app.get("/student/resources", response_model=List[ResourceResponse])
def get_student_resources(email: str, db: Session = Depends(get_db)):
    """Get resources visible for the student based on dept/section/semester."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    resources = db.query(Resource).order_by(Resource.created_at.desc()).all()
    return [resource for resource in resources if resource_visible_for_user(resource, user)]


@app.post("/admin/resources")
def create_resource(data: ResourceCreate, admin_email: str, db: Session = Depends(get_db)):
    """Create a resource (admin only with dept/section barriers)."""
    admin = get_admin_or_403(db, admin_email)

    if data.dept != "ALL" and data.section != "ALL":
        assert_role_barrier(admin, data.dept, data.section)
    else:
        if admin.dept != "ALL" and data.dept not in ["ALL", admin.dept]:
            raise HTTPException(status_code=403, detail="Cannot target other departments")
        if admin.section != "ALL" and data.section not in ["ALL", admin.section]:
            raise HTTPException(status_code=403, detail="Cannot target other sections")

    resource = Resource(
        title=data.title,
        description=data.description,
        resource_type=(data.resource_type or "DOCUMENT").upper(),
        resource_url=data.resource_url,
        dept=data.dept,
        section=data.section,
        sem=data.sem,
        uploaded_by=admin.email,
        created_at=datetime.utcnow(),
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"success": True, "message": "Resource created", "id": resource.id}


@app.get("/admin/resources")
def get_all_resources_admin(
    admin_email: str,
    filter_depts: Optional[str] = None,
    filter_sections: Optional[str] = None,
    filter_sems: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List manageable resources based on admin scope."""
    admin = get_admin_or_403(db, admin_email)
    resources = db.query(Resource).order_by(Resource.created_at.desc()).all()
    scoped_depts = csv_to_list(filter_depts)
    scoped_sections = csv_to_list(filter_sections)
    scoped_sems = int_csv_to_list(filter_sems)

    filtered = []
    for resource in resources:
        if admin.dept != "ALL" and resource.dept not in ["ALL", admin.dept]:
            continue
        if admin.section != "ALL" and resource.section not in ["ALL", admin.section]:
            continue
        if scoped_depts and resource.dept not in ["ALL", *scoped_depts]:
            continue
        if scoped_sections and resource.section not in ["ALL", *scoped_sections]:
            continue
        if scoped_sems and resource.sem not in [0, *scoped_sems]:
            continue
        filtered.append(resource)

    return {"resources": filtered, "count": len(filtered)}


@app.get("/admin/resources/{resource_id}")
def get_resource_detail(resource_id: int, admin_email: str, db: Session = Depends(get_db)):
    admin = get_admin_or_403(db, admin_email)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if admin.dept != "ALL" and resource.dept not in ["ALL", admin.dept]:
        raise HTTPException(status_code=403, detail="Cannot access this resource")
    if admin.section != "ALL" and resource.section not in ["ALL", admin.section]:
        raise HTTPException(status_code=403, detail="Cannot access this resource")
    return resource


@app.put("/admin/resources/{resource_id}")
def update_resource(resource_id: int, data: ResourceCreate, admin_email: str, db: Session = Depends(get_db)):
    admin = get_admin_or_403(db, admin_email)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if admin.dept != "ALL" and resource.dept not in ["ALL", admin.dept]:
        raise HTTPException(status_code=403, detail="Cannot update this resource")
    if admin.section != "ALL" and resource.section not in ["ALL", admin.section]:
        raise HTTPException(status_code=403, detail="Cannot update this resource")

    if data.dept != "ALL" and data.section != "ALL":
        assert_role_barrier(admin, data.dept, data.section)

    resource.title = data.title
    resource.description = data.description
    resource.resource_type = (data.resource_type or "DOCUMENT").upper()
    resource.resource_url = data.resource_url
    resource.dept = data.dept
    resource.section = data.section
    resource.sem = data.sem

    db.commit()
    db.refresh(resource)
    return {"success": True, "message": "Resource updated", "id": resource.id}


@app.delete("/admin/resources/{resource_id}")
def delete_resource(resource_id: int, admin_email: str, db: Session = Depends(get_db)):
    admin = get_admin_or_403(db, admin_email)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if admin.dept != "ALL" and resource.dept not in ["ALL", admin.dept]:
        raise HTTPException(status_code=403, detail="Cannot delete this resource")
    if admin.section != "ALL" and resource.section not in ["ALL", admin.section]:
        raise HTTPException(status_code=403, detail="Cannot delete this resource")

    db.delete(resource)
    db.commit()
    return {"success": True, "message": "Resource deleted"}

# ============== ADMIN ENDPOINTS ==============

# ============== TIMETABLE MANAGEMENT (CREATE, READ, UPDATE, DELETE) ==============

@app.post("/admin/timetable", response_model=dict)
def create_timetable_entry(data: TimetableCreate, admin_email: str, db: Session = Depends(get_db)):
    """Create a new timetable entry"""
    admin = get_admin_or_403(db, admin_email)
    assert_role_barrier(admin, data.dept, data.section)

    entry = Timetable(
        day_of_week=data.day_of_week,
        period_slots=data.period_slots,
        subject_name=data.subject_name,
        room_number=data.room_number,
        faculty_name=data.faculty_name,
        resource_details=data.resource_details,
        dept=data.dept,
        section=data.section,
        sem=data.sem
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"success": True, "message": "Timetable entry added", "id": entry.id}

@app.get("/admin/timetable")
def get_all_timetable_entries(
    admin_email: str,
    filter_depts: Optional[str] = None,
    filter_sections: Optional[str] = None,
    filter_sems: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all timetable entries for admin management"""
    admin = get_admin_or_403(db, admin_email)
    query = db.query(Timetable)
    if admin.dept != "ALL":
        query = query.filter(Timetable.dept == admin.dept)
    if admin.section != "ALL":
        query = query.filter(Timetable.section == admin.section)

    scoped_depts = csv_to_list(filter_depts)
    scoped_sections = csv_to_list(filter_sections)
    scoped_sems = int_csv_to_list(filter_sems)
    if scoped_depts:
        query = query.filter(Timetable.dept.in_(scoped_depts))
    if scoped_sections:
        query = query.filter(Timetable.section.in_(scoped_sections))
    if scoped_sems:
        query = query.filter(Timetable.sem.in_(scoped_sems))

    entries = query.all()
    return {"entries": entries, "count": len(entries)}

@app.get("/admin/timetable/{entry_id}")
def get_timetable_entry(entry_id: int, admin_email: str, db: Session = Depends(get_db)):
    """Get a specific timetable entry"""
    admin = get_admin_or_403(db, admin_email)
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    assert_role_barrier(admin, entry.dept, entry.section)
    return entry

@app.put("/admin/timetable/{entry_id}")
def update_timetable_entry(entry_id: int, data: TimetableCreate, admin_email: str, db: Session = Depends(get_db)):
    """Update a timetable entry"""
    admin = get_admin_or_403(db, admin_email)
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    assert_role_barrier(admin, entry.dept, entry.section)
    assert_role_barrier(admin, data.dept, data.section)
    
    entry.day_of_week = data.day_of_week
    entry.period_slots = data.period_slots
    entry.subject_name = data.subject_name
    entry.room_number = data.room_number
    entry.faculty_name = data.faculty_name
    entry.resource_details = data.resource_details
    entry.dept = data.dept
    entry.section = data.section
    entry.sem = data.sem
    
    db.commit()
    db.refresh(entry)
    return {"success": True, "message": "Timetable entry updated", "id": entry.id}

@app.delete("/admin/timetable/{entry_id}")
def delete_timetable_entry(entry_id: int, admin_email: str, db: Session = Depends(get_db)):
    """Delete a timetable entry"""
    admin = get_admin_or_403(db, admin_email)
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    assert_role_barrier(admin, entry.dept, entry.section)
    
    subject = entry.subject_name
    db.delete(entry)
    db.commit()
    return {"success": True, "message": f"Timetable entry for {subject} deleted"}

# ============== ANNOUNCEMENT MANAGEMENT (CREATE, READ, UPDATE, DELETE) ==============

@app.post("/admin/announcement", response_model=dict)
def create_announcement(data: AnnouncementCreate, admin_email: str, db: Session = Depends(get_db)):
    """Create a new announcement"""
    admin = get_admin_or_403(db, admin_email)
    dept_targets = data.target_depts or []
    section_targets = data.target_sections or []

    if admin.dept != "ALL" and not dept_targets and data.target_dept == "ALL":
        dept_targets = [admin.dept]
    if admin.section != "ALL" and not section_targets:
        section_targets = [admin.section]

    if admin.dept != "ALL" and dept_targets and any(d != admin.dept for d in dept_targets):
        raise HTTPException(status_code=403, detail="Cannot target other departments")
    if admin.section != "ALL" and section_targets and any(s != admin.section for s in section_targets):
        raise HTTPException(status_code=403, detail="Cannot target other sections")

    announcement = Announcement(
        title=data.title,
        body=data.body,
        target_dept=(data.target_dept if data.target_dept != "ALL" else (admin.dept if dept_targets else "ALL")),
        target_depts=list_to_csv(dept_targets),
        target_sections=list_to_csv(section_targets),
        target_semesters=list_to_csv(data.target_semesters),
        image_url=data.image_url,
        priority=data.priority,
        date=datetime.utcnow()
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return {"success": True, "message": "Announcement posted", "id": announcement.id}

@app.get("/admin/announcements")
def get_all_announcements_admin(
    admin_email: str,
    filter_depts: Optional[str] = None,
    filter_sections: Optional[str] = None,
    filter_sems: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all announcements for admin management"""
    admin = get_admin_or_403(db, admin_email)
    announcements = db.query(Announcement).order_by(Announcement.date.desc()).all()
    scoped_depts = csv_to_list(filter_depts)
    scoped_sections = csv_to_list(filter_sections)
    scoped_sems = int_csv_to_list(filter_sems)
    filtered = []
    for ann in announcements:
        dept_targets = csv_to_list(ann.target_depts)
        section_targets = csv_to_list(ann.target_sections)
        sem_targets = int_csv_to_list(ann.target_semesters)
        if admin.dept != "ALL" and not dept_targets and ann.target_dept not in ["ALL", admin.dept]:
            continue
        if admin.dept != "ALL" and dept_targets and admin.dept not in dept_targets:
            continue
        if admin.section != "ALL" and section_targets and admin.section not in section_targets:
            continue

        if scoped_depts:
            ann_depts = dept_targets or ([ann.target_dept] if ann.target_dept != "ALL" else [])
            if ann_depts and not any(dept in scoped_depts for dept in ann_depts):
                continue
        if scoped_sections and section_targets and not any(section in scoped_sections for section in section_targets):
            continue
        if scoped_sems and sem_targets and not any(sem in scoped_sems for sem in sem_targets):
            continue

        filtered.append(serialize_announcement(ann))
    return {"announcements": filtered, "count": len(filtered)}

@app.get("/admin/announcement/{announcement_id}")
def get_announcement_detail(announcement_id: int, admin_email: str, db: Session = Depends(get_db)):
    """Get a specific announcement"""
    get_admin_or_403(db, admin_email)
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return serialize_announcement(announcement)

@app.put("/admin/announcement/{announcement_id}")
def update_announcement(announcement_id: int, data: AnnouncementCreate, admin_email: str, db: Session = Depends(get_db)):
    """Update an announcement"""
    admin = get_admin_or_403(db, admin_email)
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    dept_targets = data.target_depts or []
    section_targets = data.target_sections or []
    if admin.dept != "ALL" and not dept_targets and data.target_dept == "ALL":
        dept_targets = [admin.dept]
    if admin.section != "ALL" and not section_targets:
        section_targets = [admin.section]
    if admin.dept != "ALL" and dept_targets and any(d != admin.dept for d in dept_targets):
        raise HTTPException(status_code=403, detail="Cannot target other departments")
    if admin.section != "ALL" and section_targets and any(s != admin.section for s in section_targets):
        raise HTTPException(status_code=403, detail="Cannot target other sections")
    
    announcement.title = data.title
    announcement.body = data.body
    announcement.target_dept = (data.target_dept if data.target_dept != "ALL" else (admin.dept if dept_targets else "ALL"))
    announcement.target_depts = list_to_csv(dept_targets)
    announcement.target_sections = list_to_csv(section_targets)
    announcement.target_semesters = list_to_csv(data.target_semesters)
    announcement.image_url = data.image_url
    announcement.priority = data.priority
    announcement.date = datetime.utcnow()
    
    db.commit()
    db.refresh(announcement)
    return {"success": True, "message": "Announcement updated", "id": announcement.id}

@app.delete("/admin/announcement/{announcement_id}")
def delete_announcement(announcement_id: int, admin_email: str, db: Session = Depends(get_db)):
    """Delete an announcement"""
    get_admin_or_403(db, admin_email)
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    title = announcement.title
    db.delete(announcement)
    db.commit()
    return {"success": True, "message": f"Announcement '{title}' deleted"}

# ============== ATTENDANCE MANAGEMENT (CREATE, READ, UPDATE, DELETE) ==============

@app.post("/admin/attendance", response_model=dict)
def record_attendance(
    admin_email: str,
    student_email: str,
    subject_name: str,
    attended: int,
    total: int,
    db: Session = Depends(get_db)
):
    """Record or create new attendance for a student"""
    admin = get_admin_or_403(db, admin_email)
    user = db.query(User).filter(User.email == student_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    assert_role_barrier(admin, user.dept, user.section)
    
    summary = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == student_email,
        AttendanceSummary.subject_name == subject_name
    ).first()
    
    if summary:
        summary.attended = attended
        summary.total = total
        summary.last_updated = datetime.utcnow()
    else:
        summary = AttendanceSummary(
            student_email=student_email,
            subject_name=subject_name,
            attended=attended,
            total=total,
            dept=user.dept,
            section=user.section,
            sem=user.sem,
            last_updated=datetime.utcnow()
        )
        db.add(summary)
    
    db.commit()
    db.refresh(summary)
    return {"success": True, "message": "Attendance recorded"}

@app.get("/admin/attendance")
def get_all_attendance(
    admin_email: str,
    filter_depts: Optional[str] = None,
    filter_sections: Optional[str] = None,
    filter_sems: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all attendance records for admin management"""
    admin = get_admin_or_403(db, admin_email)
    query = db.query(AttendanceSummary)
    if admin.dept != "ALL":
        query = query.filter(AttendanceSummary.dept == admin.dept)
    if admin.section != "ALL":
        query = query.filter(AttendanceSummary.section == admin.section)

    scoped_depts = csv_to_list(filter_depts)
    scoped_sections = csv_to_list(filter_sections)
    scoped_sems = int_csv_to_list(filter_sems)
    if scoped_depts:
        query = query.filter(AttendanceSummary.dept.in_(scoped_depts))
    if scoped_sections:
        query = query.filter(AttendanceSummary.section.in_(scoped_sections))
    if scoped_sems:
        query = query.filter(AttendanceSummary.sem.in_(scoped_sems))

    records = query.order_by(
        AttendanceSummary.student_email, 
        AttendanceSummary.subject_name
    ).all()
    return {"records": records, "count": len(records)}

@app.get("/admin/attendance/{student_email}")
def get_student_attendance_records(student_email: str, admin_email: str, db: Session = Depends(get_db)):
    """Get all attendance records for a specific student"""
    admin = get_admin_or_403(db, admin_email)
    records = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == student_email
    ).all()
    if not records:
        raise HTTPException(status_code=404, detail="No attendance records found for this student")

    assert_role_barrier(admin, records[0].dept, records[0].section)
    return {"records": records, "count": len(records)}

@app.put("/admin/attendance/{student_email}/{subject_name}")
def update_attendance(
    student_email: str,
    subject_name: str,
    admin_email: str,
    attended: int,
    total: int,
    db: Session = Depends(get_db)
):
    """Update attendance for a student in a specific subject"""
    admin = get_admin_or_403(db, admin_email)
    user = db.query(User).filter(User.email == student_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    assert_role_barrier(admin, user.dept, user.section)
    
    summary = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == student_email,
        AttendanceSummary.subject_name == subject_name
    ).first()
    
    if not summary:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    summary.attended = attended
    summary.total = total
    summary.last_updated = datetime.utcnow()
    
    db.commit()
    db.refresh(summary)
    return {"success": True, "message": f"Attendance for {subject_name} updated"}

@app.delete("/admin/attendance/{student_email}/{subject_name}")
def delete_attendance_record(student_email: str, subject_name: str, admin_email: str, db: Session = Depends(get_db)):
    """Delete an attendance record"""
    admin = get_admin_or_403(db, admin_email)
    record = db.query(AttendanceSummary).filter(
        AttendanceSummary.student_email == student_email,
        AttendanceSummary.subject_name == subject_name
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    assert_role_barrier(admin, record.dept, record.section)
    
    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Attendance record for {subject_name} deleted"}


@app.post("/admin/attendance/upload-excel")
async def upload_attendance_excel(
    admin_email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload attendance summary using Excel headers:
    student_email, subject_name, attended, total, dept, section, sem
    """
    admin = get_admin_or_403(db, admin_email)
    workbook = load_workbook(filename=io.BytesIO(await file.read()), data_only=True)
    sheet = workbook.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(status_code=400, detail="Excel is empty")

    headers = [str(cell).strip().lower() if cell is not None else "" for cell in rows[0]]
    required = ["student_email", "subject_name", "attended", "total", "dept", "section", "sem"]
    if not all(name in headers for name in required):
        raise HTTPException(status_code=400, detail=f"Missing headers. Required: {', '.join(required)}")

    idx = {name: headers.index(name) for name in required}
    updated = 0
    created = 0

    for row in rows[1:]:
        if not row or row[idx["student_email"]] is None:
            continue

        student_email = str(row[idx["student_email"]]).strip()
        subject_name = str(row[idx["subject_name"]]).strip()
        attended = int(row[idx["attended"]] or 0)
        total = int(row[idx["total"]] or 0)
        dept = str(row[idx["dept"]]).strip()
        section = str(row[idx["section"]]).strip()
        sem = int(row[idx["sem"]] or 0)

        assert_role_barrier(admin, dept, section)

        existing = db.query(AttendanceSummary).filter(
            AttendanceSummary.student_email == student_email,
            AttendanceSummary.subject_name == subject_name
        ).first()

        if existing:
            existing.attended = attended
            existing.total = total
            existing.dept = dept
            existing.section = section
            existing.sem = sem
            existing.last_updated = datetime.utcnow()
            updated += 1
        else:
            db.add(AttendanceSummary(
                student_email=student_email,
                subject_name=subject_name,
                attended=attended,
                total=total,
                dept=dept,
                section=section,
                sem=sem,
                last_updated=datetime.utcnow()
            ))
            created += 1

    db.commit()
    return {"success": True, "created": created, "updated": updated, "message": "Attendance Excel processed"}


@app.post("/admin/timetable/upload-excel")
async def upload_timetable_excel(
    admin_email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Supported formats:
    1) Row format: day_of_week, period_slots, subject_name, room_number, faculty_name, resource_details, dept, section, sem
    2) Matrix format: first col "time", day columns (monday..saturday), plus optional dept, section, sem.
       Each cell value: Subject|Room|Faculty|Resource (last three optional).
    """
    admin = get_admin_or_403(db, admin_email)
    workbook = load_workbook(filename=io.BytesIO(await file.read()), data_only=True)
    sheet = workbook.active
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(status_code=400, detail="Excel is empty")

    headers = [str(cell).strip().lower() if cell is not None else "" for cell in rows[0]]
    created = 0

    if "day_of_week" in headers and "period_slots" in headers:
        needed = ["day_of_week", "period_slots", "subject_name", "room_number", "dept", "section", "sem"]
        if not all(name in headers for name in needed):
            raise HTTPException(status_code=400, detail=f"Missing headers for row format. Required: {', '.join(needed)}")

        idx = {name: headers.index(name) for name in headers if name}
        for row in rows[1:]:
            if not row or row[idx["day_of_week"]] is None:
                continue
            dept = str(row[idx["dept"]]).strip()
            section = str(row[idx["section"]]).strip()
            sem = int(row[idx["sem"]] or 0)
            assert_role_barrier(admin, dept, section)

            db.add(Timetable(
                day_of_week=str(row[idx["day_of_week"]]).strip(),
                period_slots=str(row[idx["period_slots"]]).strip(),
                subject_name=str(row[idx["subject_name"]]).strip(),
                room_number=str(row[idx["room_number"]]).strip(),
                faculty_name=str(row[idx.get("faculty_name", -1)]).strip() if idx.get("faculty_name") is not None and row[idx.get("faculty_name", 0)] else None,
                resource_details=str(row[idx.get("resource_details", -1)]).strip() if idx.get("resource_details") is not None and row[idx.get("resource_details", 0)] else None,
                dept=dept,
                section=section,
                sem=sem
            ))
            created += 1
    else:
        day_map = {"monday": "Monday", "tuesday": "Tuesday", "wednesday": "Wednesday", "thursday": "Thursday", "friday": "Friday", "saturday": "Saturday"}
        if "time" not in headers:
            raise HTTPException(status_code=400, detail="Matrix format requires first row header 'time'")

        dept_idx = headers.index("dept") if "dept" in headers else None
        section_idx = headers.index("section") if "section" in headers else None
        sem_idx = headers.index("sem") if "sem" in headers else None
        time_idx = headers.index("time")
        day_indices = {day: headers.index(day) for day in day_map if day in headers}

        if not day_indices:
            raise HTTPException(status_code=400, detail="Matrix format requires day columns: monday..saturday")

        for row in rows[1:]:
            if not row or row[time_idx] is None:
                continue
            period_slots = str(row[time_idx]).strip()
            dept = str(row[dept_idx]).strip() if dept_idx is not None and row[dept_idx] else admin.dept
            section = str(row[section_idx]).strip() if section_idx is not None and row[section_idx] else admin.section
            sem = int(row[sem_idx] or 0) if sem_idx is not None else 0

            assert_role_barrier(admin, dept, section)

            for day_key, col_idx in day_indices.items():
                cell = row[col_idx]
                if cell is None or str(cell).strip() == "":
                    continue

                parts = [part.strip() for part in str(cell).split("|")]
                subject_name = parts[0] if len(parts) > 0 else ""
                room_number = parts[1] if len(parts) > 1 and parts[1] else "TBD"
                faculty_name = parts[2] if len(parts) > 2 and parts[2] else None
                resource_details = parts[3] if len(parts) > 3 and parts[3] else None

                db.add(Timetable(
                    day_of_week=day_map[day_key],
                    period_slots=period_slots,
                    subject_name=subject_name,
                    room_number=room_number,
                    faculty_name=faculty_name,
                    resource_details=resource_details,
                    dept=dept,
                    section=section,
                    sem=sem
                ))
                created += 1

    db.commit()
    return {"success": True, "created": created, "message": "Timetable Excel processed"}


@app.post("/admin/announcements/upload-excel")
async def upload_announcements_excel(
    admin_email: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload announcements using Excel headers:
    title, body, priority, image_url, target_dept, target_depts, target_sections, target_semesters
    target_* list headers are comma-separated values.
    """
    admin = get_admin_or_403(db, admin_email)
    workbook = load_workbook(filename=io.BytesIO(await file.read()), data_only=True)
    sheet = workbook.active
    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(status_code=400, detail="Excel is empty")

    headers = [str(cell).strip().lower() if cell is not None else "" for cell in rows[0]]
    required = ["title", "body"]
    if not all(name in headers for name in required):
        raise HTTPException(status_code=400, detail="Required headers: title, body")

    idx = {name: headers.index(name) for name in headers if name}
    created = 0
    for row in rows[1:]:
        if not row or not row[idx["title"]]:
            continue

        target_dept = str(row[idx.get("target_dept", -1)]).strip() if idx.get("target_dept") is not None and row[idx.get("target_dept", 0)] else "ALL"
        target_depts = csv_to_list(str(row[idx.get("target_depts", -1)])) if idx.get("target_depts") is not None and row[idx.get("target_depts", 0)] else []
        target_sections = csv_to_list(str(row[idx.get("target_sections", -1)])) if idx.get("target_sections") is not None and row[idx.get("target_sections", 0)] else []
        target_semesters = int_csv_to_list(str(row[idx.get("target_semesters", -1)])) if idx.get("target_semesters") is not None and row[idx.get("target_semesters", 0)] else []

        if admin.dept != "ALL" and target_depts and any(d != admin.dept for d in target_depts):
            raise HTTPException(status_code=403, detail="Cannot target other departments")
        if admin.section != "ALL" and target_sections and any(s != admin.section for s in target_sections):
            raise HTTPException(status_code=403, detail="Cannot target other sections")

        db.add(Announcement(
            title=str(row[idx["title"]]).strip(),
            body=str(row[idx["body"]]).strip(),
            priority=str(row[idx.get("priority", -1)]).strip() if idx.get("priority") is not None and row[idx.get("priority", 0)] else "normal",
            image_url=str(row[idx.get("image_url", -1)]).strip() if idx.get("image_url") is not None and row[idx.get("image_url", 0)] else None,
            target_dept=target_dept,
            target_depts=list_to_csv(target_depts),
            target_sections=list_to_csv(target_sections),
            target_semesters=list_to_csv(target_semesters),
            date=datetime.utcnow()
        ))
        created += 1

    db.commit()
    return {"success": True, "created": created, "message": "Announcements Excel processed"}

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """Get admin dashboard statistics"""
    students = db.query(User).filter(User.role == "STUDENT").count()
    timetable_count = db.query(Timetable).count()
    announcement_count = db.query(Announcement).count()
    
    return {
        "students": students,
        "timetable_entries": timetable_count,
        "announcements": announcement_count
    }

# ============== INTELLIGENT ASSISTANT ==============

ASSISTANT_SYSTEM_PROMPT = """
You are an intelligent Student Assistant at the college.

**Your Persona:**
- Professional, helpful, and empathetic
- Data-driven and precise with student records
- Proactive in identifying attendance shortages
- Encouraging and supportive in tone
- Always action-oriented with clear next steps

**Your Expertise:**
1. **Attendance Management**: Use the student's database records to provide precise answers about attendance percentage, classes needed to reach 75%, and safe bunks available
2. **Schedule Planning**: Help students understand their timetable and today's classes
3. **College Information**: Share college policies, facilities, placements details
4. **Announcements**: Keep students informed about important college updates
5. **Academic Guidance**: Provide study tips and resource recommendations

**Core Capabilities:**
- Calculate attendance insights: "You need to attend 5 consecutive classes to reach 75%"
- Show current class schedule: "You have 3 classes today, starting at 9:00 AM"
- Alert about announcements: "There's an important announcement about exam schedules"
- Provide actionable guidance: "Focus on Physics (currently 68%)"

**Guidelines:**
- Always verify data from the student's actual database records
- Be precise with numbers and percentages
- Suggest specific action items
- Use emojis sparingly but effectively (📚, ✅, ⚠️)
- If data is unavailable, say so and guide them to take action
- Keep responses concise (2-3 sentences max)
- Always end with a helpful suggestion or question

**Examples of Good Responses:**
- "Your attendance is at 72% - attend the next 4 Physics classes to reach 75%. Safe attendance! 📚"
- "You have 4 classes today: DSA (9:00), OOP (11:00), Database (1:00), Web Dev (3:00). Ready to crush it? ✅"
- "Check out the new placement announcement - TCS is hiring for internships! 🎯"
"""

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Intelligent Student Assistant
    Uses student data from database for precise, context-aware responses.
    """
    user = db.query(User).filter(User.email == request.user_email).first()
    if not user:
        return ChatResponse(response="User not found. Please login first.")
    
    # Gather student context from database
    attendance = get_student_attendance(db, request.user_email)
    timetable = db.query(Timetable).filter(
        Timetable.dept == user.dept,
        Timetable.section == user.section,
        Timetable.sem == user.sem
    ).all()
    
    announcements = db.query(Announcement).filter(
        (Announcement.target_dept == user.dept) | (Announcement.target_dept == "ALL")
    ).order_by(Announcement.date.desc()).limit(5).all()
    
    # Build context message
    context_msg = f"""
User: {user.name} ({user.roll_number})
Department: {user.dept}, Section {user.section}, Semester {user.sem}

Current Attendance: {attendance.overall_percentage}% ({attendance.overall_status})
Low attendance subjects:
"""
    
    for subject in attendance.subjects:
        if subject.percentage < 75:
            context_msg += f"\n- {subject.subject_name}: {subject.percentage}% (need {subject.classes_needed} classes)"
    
    # Use Groq API if available, otherwise generate local response
    if GROQ_API_KEY:
        response_text = await get_assistant_response_from_groq(
            request.message, 
            context_msg, 
            user, 
            attendance, 
            timetable
        )
    else:
        response_text = generate_assistant_local_response(
            request.message,
            user,
            attendance,
            timetable,
            announcements
        )
    
    return ChatResponse(response=response_text)

async def get_assistant_response_from_groq(message: str, context: str, user, attendance, timetable) -> str:
    """Get response from Groq API"""
    try:
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        
        prompt = f"""{ASSISTANT_SYSTEM_PROMPT}

{context}

Student Question: {message}

Respond with accurate, actionable guidance."""
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": "mixtral-8x7b-32768",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 200,
                    "temperature": 0.7
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Groq API error: {e}")
    
    # Fallback to local response
    return generate_assistant_local_response(message, user, attendance, timetable, [])

def generate_assistant_local_response(message: str, user, attendance, timetable, announcements) -> str:
    """Generate intelligent local response based on student data"""
    msg_lower = message.lower()
    
    # Attendance queries
    if any(word in msg_lower for word in ["attendance", "percentage", "bunk", "safe"]):
        if attendance.overall_status == "NO_DATA":
            return "📊 No attendance data available yet. Once your classes are recorded, I can help you track progress!"
        
        low_subjects = [s for s in attendance.subjects if s.percentage < 75]
        if low_subjects:
            worst = min(low_subjects, key=lambda x: x.percentage)
            return f"⚠️ Your {worst.subject_name} is at {worst.percentage}% - attend {worst.classes_needed} more classes to reach 75%! You've got this! 💪"
        else:
            safe_bunks = sum(s.safe_bunks or 0 for s in attendance.subjects) // len(attendance.subjects) if attendance.subjects else 0
            return f"✅ Great attendance! You're at {attendance.overall_percentage}% overall. You have ~{safe_bunks} safe bunks per subject. Keep it up! 🎯"
    
    # Schedule queries
    if any(word in msg_lower for word in ["schedule", "timetable", "class", "today", "tomorrow"]):
        from datetime import datetime
        today = datetime.now().strftime("%A")
        today_classes = [t for t in timetable if t.day_of_week == today]
        
        if not timetable:
            return "📅 No timetable data found. Ask your admin to upload the schedule!"
        
        if today_classes:
            classes_info = "\n".join([f"• {c.subject_name} at {c.period_slots} in {c.room_number}" for c in today_classes])
            return f"📚 Your classes today ({today}):\n{classes_info}\n\nReady to learn? Let's go! 🚀"
        else:
            return f"🎉 No classes today ({today})! Perfect time for self-study or revision. 📖"
    
    # General help
    if "help" in msg_lower or "what can" in msg_lower or "how" in msg_lower:
        return "I'm your smart campus assistant! 🎓 I can help with:\n• Attendance tracking & planning\n• Your daily schedule\n• College announcements\n• Study resources\nWhat do you need help with?"
    
    # Default response
    return f"Got it! 👋 I'm here to help with your attendance, schedule, and college info. Try asking about your attendance percentage or today's schedule!"

# ============== INITIALIZATION ==============

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "Student Management Portal",
        "version": "3.0",
        "status": "running",
        "assistant": "Intelligent Student Assistant"
    }
