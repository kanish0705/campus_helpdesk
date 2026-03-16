# VARUNA - Student Management Portal
## Professional Mobile-First Campus Assistant

### 🎯 Project Overview
A comprehensive student management system with intelligent AI-powered assistance, mobile-first responsive design, and professional analytics dashboard.

---

## 🏗️ Architecture

### Backend (FastAPI)

#### 1. **Modular Database Schema**
The SQLite database is now organized with four core modular tables:

**Attendance Table**
- Tracks daily class attendance records
- Fields: `student_email`, `subject_name`, `date`, `status`, `dept`, `section`, `sem`

**AttendanceSummary Table** ⭐
- Aggregated attendance per subject with actionable insights
- Fields: `student_email`, `subject_name`, `attended`, `total`, `threshold_target`, `last_updated`
- Enables quick calculations without scanning historical records

**Timetable Table**
- Weekly class schedule organized by day and period
- Fields: `day_of_week`, `period_slots`, `subject_name`, `room_number`, `faculty_name`, `dept`, `section`, `sem`
- Supports responsive schedule rendering

**Announcement Table**
- College announcements and notifications
- Fields: `title`, `body`, `image_url`, `date`, `target_dept`, `priority`
- Supports priority levels: normal, high, urgent

#### 2. **Attendance Calculation Engine** 🧮

Three intelligent calculation functions:

**`calculate_attendance_percentage(attended, total)`**
- Accurate percentage calculation with 2 decimal precision

**`calculate_classes_needed_to_reach_target(attended, total, target=75)`**
- Calculates consecutive classes required to hit 75% attendance
- Formula: `x >= (target * total - 100 * attended) / (100 - target)`
- Returns actionable "attend X classes" guidance

**`calculate_safe_bunks(attended, total, threshold=75)`**
- Calculates how many classes can be skipped while maintaining threshold
- Formula: `x <= (100 * attended - threshold * total) / threshold`
- Returns "You have X safe bunks" encouragement

**Status Classification:**
- 🟢 **SAFE**: ≥ 75%
- 🟡 **WARNING**: 65-74%
- 🔴 **DANGER**: < 65%

#### 3. **Comprehensive Pydantic Schemas**

**Core Schemas:**
- `LoginRequest` - Email + password validation
- `UserResponse` - Safe user profile response
- `AttendanceRecord` - Single subject performance with all metrics
- `AttendanceResponse` - Complete attendance overview
- `TimetableResponse` - Clean schedule data
- `AnnouncementResponse` - Professional announcement format
- `DashboardResponse` - Unified dashboard data
- `QuickSyncResponse` - Fresh data from ERP simulation

#### 4. **Quick Sync Endpoint** 🔄

```
POST /student/quick-sync?email=student@college.edu
```
- Simulates fetching fresh data from external ERP (like Anveshna)
- Returns latest attendance + recent announcements in single call
- Includes sync timestamp and data freshness indicator
- Perfect for mobile "pull to refresh" patterns

#### 5. **VARUNA AI Assistant** 🤖

**System Persona:**
- "You are VARUNA, an intelligent Student Assistant"
- Data-driven, precise, action-oriented
- Uses student's actual database records for responses

**Core Capabilities:**
1. Attendance analysis: "Attend 4 Physics classes to reach 75%"
2. Schedule planning: "You have 3 classes today starting at 9:00 AM"
3. Announcement alerts: "New placement announcement from TCS!"
4. Academic guidance: "Focus on DSA - currently at 68%"

**Smart Fallback:**
- Uses Groq API when GROQ_API_KEY available
- Falls back to intelligent local responses using database context
- Never gives generic responses - always data-driven

---

## 🎨 Frontend (Mobile-First Design)

### 1. **Responsive Layout Architecture**

**Desktop (≥1025px):**
- Fixed left sidebar (264px) for navigation
- Professional two-column dashboard
- Full timetable table view

**Mobile (<1024px):**
- Hidden sidebar (can be toggled)
- Bottom navigation bar (5 items: Home, Schedule, Attendance, Updates, Logout)
- Full-width content
- FAB (Floating Action Button) for chat

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: ≥ 1025px

### 2. **Quick Sync Button** ⚡
- Located in header top-right
- Shows "Quick Sync" with sync icon
- On click:
  - Fetches fresh attendance + announcements
  - Shows syncing animation
  - Updates dashboard in real-time
  - Displays success toast: "✅ Data synced successfully!"

### 3. **Color-Coded Status Rings** 🎨

**Attendance Circle Progress:**
- SVG circular progress indicator
- **Green** (#10b981) for SAFE (≥75%)
- **Amber** (#f59e0b) for WARNING (65-74%)
- **Red** (#ef4444) for DANGER (<65%)
- Center displays percentage rounded to whole number

**Subject Cards:**
- Color-coded progress bars matching status
- Gradient fills (Safe→Green, Warning→Amber, Danger→Red)
- Auto-calculated width based on percentage
- Inline actionable messages:
  - "⚠️ Attend 5 more classes to reach 75%"
  - "✅ You have 3 safe bunks remaining"

### 4. **Announcement Cards** 📢

**Professional Card Design:**
- Hero image area (200px height)
- Title with priority badge
- Truncated body text (100 chars)
- Publication date
- Priority indicators:
  - 🔴 **Urgent** (red background)
  - 🟠 **High** (amber background)
  - 🔵 **Normal** (blue background)
- Hover effect: elevates with shadow

**Image Handling:**
- Displays actual image if `image_url` provided
- Falls back to icon gradient if no image
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

### 5. **Horizontally Scrollable Timetable** 📅

**Table Features:**
- `min-w-full` on desktop for clean layout
- Horizontal scroll on mobile (preserves all columns)
- Striped rows for readability
- Columns: Day, Time, Subject, Room
- Hover states for better UX

**Today's Schedule Card:**
- Prominent section showing only today's classes
- Emoji icons for visual appeal
- Shows subject, time, room, faculty
- Empty state: "🎉 No classes today!"

### 6. **Floating Action Button (FAB) Chat** 💬

**Position & Design:**
- Fixed position: bottom-right
- Mobile: `bottom-20 right-6` (above bottom nav)
- Desktop: `bottom-6 right-6`
- Gradient background (brand primary → secondary)
- Robot icon (fa-robot)
- Hover scale: 1.1x with enhanced shadow

**Chat Container:**
- 384px width (w-96)
- Responsive: max 100vw - 2rem on mobile
- 320px height (h-80)
- Smooth animations
- Three sections: Header, Messages, Input

**Chat Interface:**
- VARUNA header with online indicator
- Message history with scrolling
- Bot messages: left-aligned with light background
- User messages: right-aligned with gradient background
- Input field with emoji support
- Send button with paper-plane icon

---

## 🚀 Key Features Implemented

### ✅ Backend Features
- [x] Modular SQLite database with 4 core tables
- [x] Sophisticated attendance calculation engine
- [x] Comprehensive Pydantic validation schemas
- [x] Quick Sync endpoint for ERP integration
- [x] VARUNA AI assistant system
- [x] Local + Groq API fallback for chat
- [x] Admin endpoints for data management
- [x] Proper error handling & validation

### ✅ Frontend Features
- [x] Mobile-first responsive design
- [x] Desktop sidebar + Mobile bottom nav
- [x] Quick Sync button with real-time updates
- [x] Color-coded attendance status (rings + badges)
- [x] Professional announcement cards with images
- [x] Horizontally scrollable timetable
- [x] FAB chat interface with VARUNA
- [x] Toast notifications system
- [x] View switching (Dashboard, Schedule, Attendance, Announcements)
- [x] Attendance progress circles with SVG
- [x] Actionable insights for every subject

---

## 📊 Data Models

### User
```python
id, email, password, name, roll_number, role, dept, section, sem
```

### AttendanceSummary (Core Model)
```python
student_email, subject_name, attended, total
threshold_target (default: 75.0), dept, section, sem, last_updated
```

### Timetable
```python
day_of_week, period_slots, subject_name, room_number
faculty_name (optional), dept, section, sem
```

### Announcement
```python
title, body, image_url (optional), date
target_dept, priority (normal/high/urgent)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /login` - Login with email/password

### Student Endpoints
- `GET /student/dashboard?email=` - Get complete dashboard
- `GET /student/attendance?email=` - Get attendance details
- `GET /student/attendance/{subject}` - Get subject attendance
- `GET /student/timetable?email=` - Get timetable
- `POST /student/quick-sync?email=` - Quick sync with ERP
- `POST /chat` - Chat with VARUNA

### Admin Endpoints
- `POST /admin/attendance` - Record attendance
- `POST /admin/timetable` - Add timetable entry
- `POST /admin/announcement` - Post announcement
- `GET /admin/stats` - Get statistics

---

## 🎨 Color Palette

**Brand:**
- Primary: `#1e3a5f` (Dark Blue)
- Secondary: `#2c5282` (Medium Blue)
- Accent: `#ed8936` (Orange)

**Status:**
- Safe: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)

**Neutrals:**
- Light: `#f8fafc` (Off-white)
- Border: `#e2e8f0` (Light gray)
- Text: `#1f2937` (Dark gray)

---

## 🔄 Workflow Example

### Student Login Flow
1. Enter credentials
2. Backend validates against User table
3. Frontend stores currentUser
4. UI switches to mainDashboard
5. `loadDashboard()` called
6. Fetches `/student/dashboard`
7. Data rendered across all views

### Quick Sync Flow
1. User clicks "Quick Sync" button
2. Button shows syncing animation
3. `POST /student/quick-sync` called
4. Server fetches fresh attendance & announcements
5. Dashboard re-renders with latest data
6. Success toast shown

### Attendance Insight Flow
1. Backend loads AttendanceSummary for student
2. Calculates percentage for each subject
3. Determines status (SAFE/WARNING/DANGER)
4. If < 75%: calculates classes_needed
5. If ≥ 75%: calculates safe_bunks
6. Frontend renders colored progress bar + message

### VARUNA Chat Flow
1. Student types question
2. Frontend sends message to `/chat` endpoint
3. Backend gathers student context (attendance, schedule, announcements)
4. VARUNA system prompt + context sent to Groq API (or local fallback)
5. AI response appears in chat bubble
6. Context-aware, data-driven responses

---

## 📱 Mobile Optimization

### Responsive Breakpoints
- **Mobile First**: Design starts at mobile, scales up
- **Bottom Navigation**: Sticky navigation fixed on mobile
- **Touch-Friendly**: 48px minimum tap targets
- **Readable**: 16px+ font sizes
- **Scrollable Content**: Horizontal scroll for tables
- **FAB Position**: Adjusts above bottom nav on mobile

### Performance Considerations
- Lazy load announcements (display 3, option to view all)
- Cache dashboard data in currentUser object
- Minimal re-renders on view switches
- Efficient DOM manipulation

---

## 🚀 Getting Started

### Start Backend
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Access Frontend
- Open `index.html` in browser
- Backend runs on `http://127.0.0.1:8000`
- Demo credentials:
  - Email: `student1@college.edu`
  - Password: `password123`

### Quick Test
1. Login
2. See dashboard with stats
3. Click "Quick Sync" to refresh
4. Switch to Schedule to see timetable
5. Click Attendance to see color-coded rings
6. Try VARUNA chat with questions like:
   - "What's my attendance?"
   - "When are my classes today?"
   - "How many more classes do I need?"

---

## 📈 Future Enhancements

- [ ] JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] Real ERP API integration
- [ ] Push notifications
- [ ] File uploads for resources
- [ ] Exam schedule management
- [ ] Placement tracker
- [ ] Database backup system
- [ ] Admin dashboard
- [ ] Multi-language support

---

## 🏆 Technical Stack

**Backend:**
- FastAPI 0.109.0
- SQLAlchemy 2.0.25
- SQLite3
- Pydantic 2.5.3
- Groq API (Optional)
- Python 3.8+

**Frontend:**
- HTML5/CSS3
- Tailwind CSS 3
- JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design

---

## 📝 Notes

- All passwords stored in plain text (for demo only - use bcrypt in production)
- Attendance calculations use standard 75% threshold (configurable per subject)
- VARUNA uses actual student data for precise, actionable responses
- Quick Sync simulates ERP integration patterns
- Mobile-first approach ensures excellent mobile experience

---

## 👨‍💻 Developer Contact
Built with ❤️ for modern student management.

---

**Last Updated:** March 16, 2026
**Version:** 3.0 (Professional Mobile-First Release)
