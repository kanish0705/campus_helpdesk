"""Create professional visual diagrams using matplotlib."""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
from pathlib import Path

# Create output directory
output_dir = Path("professional_diagrams")
output_dir.mkdir(exist_ok=True)

# Color scheme
colors = {
    'primary': '#4CAF50',
    'secondary': '#2196F3',
    'accent': '#FF9800',
    'light': '#E8F5E9',
    'dark': '#212121',
    'gray': '#757575',
    'box_light': '#F5F5F5',
    'box_dark': '#333333'
}

# ============= DIAGRAM 1: SYSTEM ARCHITECTURE =============
def create_system_architecture():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Title
    ax.text(5, 9.5, 'Student Management Portal - System Architecture', 
            ha='center', fontsize=16, fontweight='bold', color=colors['dark'])
    
    # Client Layer
    client_box = FancyBboxPatch((0.5, 7.5), 9, 1.2, boxstyle="round,pad=0.1", 
                               edgecolor=colors['primary'], facecolor=colors['light'], linewidth=2)
    ax.add_patch(client_box)
    ax.text(5, 8.3, 'CLIENT LAYER (Browser)', ha='center', fontsize=11, fontweight='bold')
    ax.text(5, 7.85, 'HTML5 | JavaScript | Tailwind CSS | FontAwesome Icons', 
            ha='center', fontsize=9, style='italic')
    
    # Components in Client Layer
    components = ['Login Form', 'Dashboard', 'Admin Panel', 'Student View', 'ChatBot']
    x_pos = [1.2, 2.8, 4.4, 6.0, 7.6]
    for comp, x in zip(components, x_pos):
        comp_box = FancyBboxPatch((x-0.55, 6.2), 1.1, 0.8, boxstyle="round,pad=0.05",
                                 edgecolor=colors['secondary'], facecolor='white', linewidth=1.5)
        ax.add_patch(comp_box)
        ax.text(x, 6.6, comp, ha='center', fontsize=8, fontweight='bold')
    
    # Arrow down
    arrow = FancyArrowPatch((5, 6.1), (5, 5.6), arrowstyle='->', mutation_scale=30, 
                           linewidth=2, color=colors['accent'])
    ax.add_patch(arrow)
    ax.text(5.3, 5.85, 'HTTP/REST', fontsize=8, style='italic')
    
    # API Layer
    api_box = FancyBboxPatch((0.5, 4.4), 9, 1, boxstyle="round,pad=0.1",
                            edgecolor=colors['secondary'], facecolor='#E3F2FD', linewidth=2)
    ax.add_patch(api_box)
    ax.text(5, 5.1, 'API LAYER', ha='center', fontsize=11, fontweight='bold')
    ax.text(5, 4.65, 'FastAPI REST Endpoints (20+ routes)', ha='center', fontsize=9)
    
    # Backend Layer
    backend_box = FancyBboxPatch((0.5, 2.8), 9, 1.4, boxstyle="round,pad=0.1",
                                edgecolor=colors['accent'], facecolor='#FFF3E0', linewidth=2)
    ax.add_patch(backend_box)
    ax.text(5, 3.95, 'BACKEND SERVER (FastAPI on 127.0.0.1:8000)', 
            ha='center', fontsize=11, fontweight='bold')
    
    backend_components = ['Authentication', 'Business Logic', 'Data Validation', 'File Handler']
    x_pos_backend = [1.5, 3.5, 5.5, 7.5]
    for comp, x in zip(backend_components, x_pos_backend):
        comp_box = FancyBboxPatch((x-0.6, 2.95), 1.2, 0.6, boxstyle="round,pad=0.05",
                                 edgecolor=colors['accent'], facecolor='white', linewidth=1)
        ax.add_patch(comp_box)
        ax.text(x, 3.25, comp, ha='center', fontsize=7, fontweight='bold')
    
    # Arrow down
    arrow = FancyArrowPatch((5, 2.75), (5, 2.3), arrowstyle='->', mutation_scale=30,
                           linewidth=2, color=colors['primary'])
    ax.add_patch(arrow)
    ax.text(5.3, 2.5, 'SQL', fontsize=8, style='italic')
    
    # Database Layer
    db_box = FancyBboxPatch((0.5, 0.8), 9, 1.4, boxstyle="round,pad=0.1",
                           edgecolor=colors['primary'], facecolor='#F1F8E9', linewidth=2)
    ax.add_patch(db_box)
    ax.text(5, 1.95, 'DATABASE LAYER (SQLite - campus.db)', 
            ha='center', fontsize=11, fontweight='bold')
    
    tables = ['Users', 'Attendance', 'Timetable', 'Announcements', 'Resources', 'Academic']
    x_pos_db = [1.2, 2.4, 3.6, 4.8, 6.0, 7.2]
    for table, x in zip(tables, x_pos_db):
        db_sym = FancyBboxPatch((x-0.45, 1.0), 0.9, 0.6, boxstyle="round,pad=0.03",
                               edgecolor=colors['primary'], facecolor='white', linewidth=1)
        ax.add_patch(db_sym)
        ax.text(x, 1.3, table, ha='center', fontsize=7, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_1_system_architecture.png', dpi=300, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_1_system_architecture.png")
    plt.close()

# ============= DIAGRAM 2: FRONTEND COMPONENTS =============
def create_frontend_components():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Frontend Components Structure', ha='center', fontsize=16, fontweight='bold')
    
    # Main container
    main_box = FancyBboxPatch((0.3, 0.5), 9.4, 8.5, boxstyle="round,pad=0.15",
                             edgecolor=colors['light'], facecolor=colors['light'], linewidth=2)
    ax.add_patch(main_box)
    ax.text(0.7, 8.7, 'Frontend Components', fontsize=12, fontweight='bold', color=colors['primary'])
    
    # Login Interface
    login_box = FancyBboxPatch((0.8, 7.2), 2.5, 0.9, boxstyle="round,pad=0.08",
                              edgecolor=colors['secondary'], facecolor='white', linewidth=2)
    ax.add_patch(login_box)
    ax.text(2.05, 7.8, 'Login Form', ha='center', fontsize=10, fontweight='bold')
    ax.text(2.05, 7.35, 'Email + Password', ha='center', fontsize=8)
    
    # Dashboard
    dash_box = FancyBboxPatch((3.6, 7.2), 2.5, 0.9, boxstyle="round,pad=0.08",
                             edgecolor=colors['primary'], facecolor='white', linewidth=2)
    ax.add_patch(dash_box)
    ax.text(4.85, 7.8, 'Dashboard View', ha='center', fontsize=10, fontweight='bold')
    ax.text(4.85, 7.35, 'Stats & Overview', ha='center', fontsize=8)
    
    # Admin Panel
    admin_box = FancyBboxPatch((6.4, 7.2), 2.5, 0.9, boxstyle="round,pad=0.08",
                              edgecolor=colors['accent'], facecolor='white', linewidth=2)
    ax.add_patch(admin_box)
    ax.text(7.65, 7.8, 'Admin Panel', ha='center', fontsize=10, fontweight='bold')
    ax.text(7.65, 7.35, 'Management', ha='center', fontsize=8)
    
    # More components
    features = [
        ('Student Schedule', 0.8, 5.8),
        ('Attendance Tracking', 2.35, 5.8),
        ('Timetable Mgmt', 3.9, 5.8),
        ('Announcements', 5.45, 5.8),
        ('Resources Upload', 7.0, 5.8),
        ('Chat Widget', 8.55, 5.8),
    ]
    
    for feature, x, y in features:
        feat_box = FancyBboxPatch((x-0.7, y), 1.4, 0.7, boxstyle="round,pad=0.05",
                                 edgecolor=colors['primary'], facecolor='white', linewidth=1.5)
        ax.add_patch(feat_box)
        ax.text(x, y+0.35, feature, ha='center', fontsize=8, fontweight='bold')
    
    # State Management
    state_box = FancyBboxPatch((0.8, 4.3), 8.8, 1.1, boxstyle="round,pad=0.08",
                              edgecolor=colors['secondary'], facecolor='#E3F2FD', linewidth=1.5)
    ax.add_patch(state_box)
    ax.text(1.1, 5.1, 'State Management', fontsize=10, fontweight='bold')
    ax.text(5.2, 4.65, 'Client-side Global Variables | Local Storage | Session Data', 
            ha='center', fontsize=8)
    
    # Utilities
    util_box = FancyBboxPatch((0.8, 2.7), 8.8, 1.3, boxstyle="round,pad=0.08",
                             edgecolor=colors['accent'], facecolor='#FFF3E0', linewidth=1.5)
    ax.add_patch(util_box)
    ax.text(1.1, 3.75, 'UI/UX Features', fontsize=10, fontweight='bold')
    
    utils = ['Forms & Validation', 'Modals & Dialogs', 'Data Tables', 'Search & Filter', 
             'Export to Excel', 'Real-time Updates']
    x_utils = [1.5, 3.0, 4.5, 6.0, 7.5, 9.0]
    for util, x in zip(utils, x_utils):
        ax.text(x, 3.2, util, ha='center', fontsize=7)
    
    # Integration
    integ_box = FancyBboxPatch((0.8, 0.8), 8.8, 1.5, boxstyle="round,pad=0.08",
                              edgecolor=colors['primary'], facecolor='white', linewidth=1.5)
    ax.add_patch(integ_box)
    ax.text(1.1, 2.0, 'External Integrations', fontsize=10, fontweight='bold')
    
    integrations = [
        'FastAPI Backend\n(REST API)',
        'Firebase Chat\n(Real-time)',
        'Groq API\n(AI Responses)',
        'FontAwesome\n(Icons)',
        'Tailwind CSS\n(Styling)',
    ]
    x_integ = [1.8, 3.5, 5.2, 6.9, 8.6]
    for integ, x in zip(integrations, x_integ):
        integ_sym = FancyBboxPatch((x-0.6, 1.0), 1.2, 0.8, boxstyle="round,pad=0.05",
                                  edgecolor=colors['secondary'], facecolor='white', linewidth=1)
        ax.add_patch(integ_sym)
        ax.text(x, 1.4, integ, ha='center', fontsize=7, multialignment='center')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_2_frontend_components.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_2_frontend_components.png")
    plt.close()

# ============= DIAGRAM 3: DATABASE SCHEMA =============
def create_database_schema():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Database Schema - 7 Main Tables', ha='center', fontsize=16, fontweight='bold')
    
    tables_info = [
        ('Users Table', 0.5, 7.5, ['id (PK)', 'email', 'password_hash', 'name', 'role', 'dept', 'section']),
        ('Attendance', 3.0, 7.5, ['id (PK)', 'student_id (FK)', 'date', 'status', 'subject', 'dept']),
        ('Timetable', 5.5, 7.5, ['id (PK)', 'day_of_week', 'period_slots', 'subject', 'room', 'faculty']),
        ('Announcements', 8.0, 7.5, ['id (PK)', 'title', 'body', 'priority', 'target_depts', 'created_by']),
        ('Academic', 0.5, 4.2, ['id (PK)', 'student_id', 'subject', 'attended', 'total', 'threshold']),
        ('Resources', 3.0, 4.2, ['id (PK)', 'title', 'description', 'resource_type', 'file_path', 'dept']),
        ('StoredResources', 5.5, 4.2, ['id (PK)', 'file_id', 'original_name', 'file_path', 'file_size']),
    ]
    
    for table_name, x, y, fields in tables_info:
        # Table header
        header_box = FancyBboxPatch((x, y), 2.2, 0.5, boxstyle="round,pad=0.05",
                                   edgecolor=colors['secondary'], facecolor=colors['secondary'], linewidth=1.5)
        ax.add_patch(header_box)
        ax.text(x+1.1, y+0.25, table_name, ha='center', fontsize=9, fontweight='bold', color='white')
        
        # Fields
        field_box = FancyBboxPatch((x, y-len(fields)*0.25), 2.2, len(fields)*0.25, 
                                  boxstyle="round,pad=0.05", edgecolor=colors['primary'], 
                                  facecolor='white', linewidth=1)
        ax.add_patch(field_box)
        
        for i, field in enumerate(fields):
            field_y = y - 0.15 - (i * 0.25)
            ax.text(x+0.1, field_y, field, fontsize=6, family='monospace')
    
    # Relationships
    ax.text(5, 3.0, 'Key Relationships', ha='center', fontsize=12, fontweight='bold')
    relationships = [
        'Users → Attendance (1:Many) - Student attends multiple classes',
        'Users → Academic (1:Many) - Student takes multiple subjects',
        'Users → Resources (1:Many) - Admin uploads multiple resources',
        'Resources → StoredResources (1:Many) - Resource has multiple file versions',
    ]
    
    y_rel = 2.65
    for rel in relationships:
        ax.text(0.8, y_rel, '• ' + rel, fontsize=8)
        y_rel -= 0.35
    
    # Database info box
    info_box = FancyBboxPatch((0.5, 0.3), 9, 0.8, boxstyle="round,pad=0.08",
                             edgecolor=colors['primary'], facecolor=colors['light'], linewidth=1.5)
    ax.add_patch(info_box)
    ax.text(5, 0.95, 'SQLite Database (campus.db) | Auto-indexing on: email, role, dept, section', 
            ha='center', fontsize=9, fontweight='bold')
    ax.text(5, 0.55, 'Total Tables: 7 | Total Fields: 50+ | Relationships: Enforced via Foreign Keys', 
            ha='center', fontsize=8, style='italic')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_3_database_schema.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_3_database_schema.png")
    plt.close()

# ============= DIAGRAM 4: AUTH & ACCESS CONTROL =============
def create_auth_control():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Authentication & Role-Based Access Control (RBAC)', 
            ha='center', fontsize=16, fontweight='bold')
    
    # Login Flow
    ax.text(0.8, 8.8, 'Authentication Flow', fontsize=11, fontweight='bold')
    
    login_steps = [
        ('User Enters Email\n& Password', 1.2, 8.0),
        ('Validate Credentials\nvs Database', 2.8, 8.0),
        ('Hash Password\n(SHA-256)', 4.4, 8.0),
        ('Generate Session\nToken', 6.0, 8.0),
        ('Return Success\n& Login', 7.6, 8.0),
    ]
    
    for step, x, y in login_steps:
        step_box = FancyBboxPatch((x-0.55, y-0.35), 1.1, 0.7, boxstyle="round,pad=0.05",
                                 edgecolor=colors['secondary'], facecolor='white', linewidth=1.5)
        ax.add_patch(step_box)
        ax.text(x, y, step, ha='center', fontsize=7, multialignment='center')
        
        if x < 7.6:
            arrow = FancyArrowPatch((x+0.6, y), (x+1.2, y), arrowstyle='->', mutation_scale=15,
                                  linewidth=1.5, color=colors['secondary'])
            ax.add_patch(arrow)
    
    # User Roles
    ax.text(0.8, 6.8, 'User Roles & Permissions', fontsize=11, fontweight='bold')
    
    roles = [
        {'name': 'STUDENT', 'x': 1.5, 'perms': ['View Own Schedule', 'Check Attendance', 'Download Resources', 'View Announcements', 'Chat Support']},
        {'name': 'ADMIN', 'x': 4.0, 'perms': ['Manage Users', 'View All Attendance', 'Create Timetables', 'Post Announcements', 'Upload Resources']},
        {'name': 'FACULTY', 'x': 6.5, 'perms': ['Mark Attendance', 'View Subject Attendance', 'Upload Resources', 'Publish Announcements']},
        {'name': 'SUPERADMIN', 'x': 9.0, 'perms': ['All Permissions', 'System Config', 'Database Management', 'User Role Assignment']},
    ]
    
    for role_info in roles:
        # Role header
        role_box = FancyBboxPatch((role_info['x']-0.7, 6.2), 1.4, 0.45, boxstyle="round,pad=0.05",
                                 edgecolor=colors['accent'], facecolor=colors['accent'], linewidth=1.5)
        ax.add_patch(role_box)
        ax.text(role_info['x'], 6.42, role_info['name'], ha='center', fontsize=9, fontweight='bold', color='white')
        
        # Permissions
        perm_box = FancyBboxPatch((role_info['x']-0.7, 6.2-len(role_info['perms'])*0.3), 1.4, len(role_info['perms'])*0.3,
                                 boxstyle="round,pad=0.05", edgecolor=colors['accent'], facecolor='white', linewidth=1)
        ax.add_patch(perm_box)
        
        for i, perm in enumerate(role_info['perms']):
            perm_y = 6.2 - 0.15 - (i * 0.3)
            ax.text(role_info['x'], perm_y, perm, ha='center', fontsize=5)
    
    # Security Features
    ax.text(0.8, 3.5, 'Security Features', fontsize=11, fontweight='bold')
    
    security_features = [
        'Password Hashing (SHA-256)',
        'Session Token Validation',
        'CORS Protection',
        'Role-Based Route Protection',
        'HTTP-Only Cookies',
        'HTTPS Ready',
    ]
    
    x_sec = [1.2, 3.2, 5.2, 7.2, 9.0]
    for i, feature in enumerate(security_features):
        sec_box = FancyBboxPatch((1.2 + (i % 5)*1.6, 3.0 - (i // 5)*0.6), 1.5, 0.45,
                                boxstyle="round,pad=0.05", edgecolor=colors['primary'],
                                facecolor=colors['light'], linewidth=1)
        ax.add_patch(sec_box)
        ax.text(1.95 + (i % 5)*1.6, 3.225, feature, ha='center', fontsize=7, fontweight='bold')
    
    # Access Control Flow
    ax.text(0.8, 1.3, 'Route Protection Logic', fontsize=11, fontweight='bold')
    
    flow_box = FancyBboxPatch((0.5, 0.3), 9, 0.9, boxstyle="round,pad=0.08",
                             edgecolor=colors['secondary'], facecolor='#E3F2FD', linewidth=1.5)
    ax.add_patch(flow_box)
    ax.text(5, 1.0, '1. Request → Check Token | 2. Verify Token in Session | 3. Check User Role | 4. Compare with Route Permissions | 5. Grant/Deny Access',
            ha='center', fontsize=8)
    ax.text(5, 0.6, 'Invalid Token / Expired Session → Redirect to Login   |   Insufficient Permissions → Show 403 Error',
            ha='center', fontsize=7, style='italic', color=colors['accent'])
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_4_auth_control.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_4_auth_control.png")
    plt.close()

# ============= DIAGRAM 5: DATA FLOW =============
def create_data_flow():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Attendance Recording Data Flow', ha='center', fontsize=16, fontweight='bold')
    
    # Flow steps
    steps = [
        {'title': 'Faculty Opens\nAttendance Page', 'x': 1.5, 'y': 8.2, 'color': colors['secondary']},
        {'title': 'Fetch Student\nList & Timetable', 'x': 4.0, 'y': 8.2, 'color': colors['primary']},
        {'title': 'Display Students\nwith Checkboxes', 'x': 6.5, 'y': 8.2, 'color': colors['accent']},
        {'title': 'Faculty Marks\nAttendance Present', 'x': 1.5, 'y': 5.5, 'color': colors['secondary']},
        {'title': 'Submit POST\nRequest to API', 'x': 4.0, 'y': 5.5, 'color': colors['primary']},
        {'title': 'Validate &\nStore in Database', 'x': 6.5, 'y': 5.5, 'color': colors['accent']},
        {'title': 'Success Message\nto Faculty', 'x': 1.5, 'y': 2.8, 'color': colors['secondary']},
        {'title': 'Student Can View\nAttendance Record', 'x': 4.0, 'y': 2.8, 'color': colors['primary']},
        {'title': 'Generate Report\n& Download', 'x': 6.5, 'y': 2.8, 'color': colors['accent']},
    ]
    
    for i, step in enumerate(steps):
        step_box = FancyBboxPatch((step['x']-0.65, step['y']-0.4), 1.3, 0.8, boxstyle="round,pad=0.08",
                                 edgecolor=step['color'], facecolor='white', linewidth=2)
        ax.add_patch(step_box)
        ax.text(step['x'], step['y'], step['title'], ha='center', fontsize=8, multialignment='center', fontweight='bold')
    
    # Arrows
    arrow_pairs = [
        ((2.15, 8.2), (3.35, 8.2)),  # 1→2
        ((4.65, 8.2), (5.85, 8.2)),  # 2→3
        ((6.5, 7.8), (2.15, 5.95)),  # 3→4
        ((2.15, 5.5), (3.35, 5.5)),  # 4→5
        ((4.65, 5.5), (5.85, 5.5)),  # 5→6
        ((6.5, 5.1), (2.15, 3.15)),  # 6→7
        ((2.15, 2.8), (3.35, 2.8)),  # 7→8
        ((4.65, 2.8), (5.85, 2.8)),  # 8→9
    ]
    
    for start, end in arrow_pairs:
        arrow = FancyArrowPatch(start, end, arrowstyle='->', mutation_scale=20,
                              linewidth=2, color=colors['primary'])
        ax.add_patch(arrow)
    
    # Data details box
    details_y = 1.5
    ax.text(0.8, details_y, 'Data Exchanged:', fontsize=10, fontweight='bold')
    
    details = [
        'Attendance POST: {student_id, subject, date, status, faculty}',
        'Attendance GET: Returns records filtered by date, subject, dept',
        'Response: {success: true, message: "Recorded", record_id: xxx}',
    ]
    
    for i, detail in enumerate(details):
        detail_box = FancyBboxPatch((0.5, details_y-0.3-(i*0.5)), 9, 0.35, boxstyle="round,pad=0.05",
                                   edgecolor=colors['gray'], facecolor=colors['box_light'], linewidth=1)
        ax.add_patch(detail_box)
        ax.text(0.7, details_y-0.15-(i*0.5), detail, fontsize=7, family='monospace')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_5_data_flow.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_5_data_flow.png")
    plt.close()

# ============= DIAGRAM 6: API ENDPOINTS =============
def create_api_endpoints():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'API Endpoints - 20+ Routes', ha='center', fontsize=16, fontweight='bold')
    
    # API Categories (arranged in columns)
    categories = {
        'Authentication': {
            'x': 0.8,
            'endpoints': [
                ('POST', '/auth/login', 'User login'),
                ('POST', '/auth/logout', 'User logout'),
                ('GET', '/auth/status', 'Check session'),
            ]
        },
        'Student Endpoints': {
            'x': 3.3,
            'endpoints': [
                ('GET', '/student/dashboard', 'Get dashboard'),
                ('GET', '/student/attendance', 'View records'),
                ('GET', '/student/schedule', 'View timetable'),
            ]
        },
        'Admin Endpoints': {
            'x': 5.8,
            'endpoints': [
                ('GET', '/admin/users', 'List all users'),
                ('POST', '/admin/users', 'Create user'),
                ('DELETE', '/admin/users/{id}', 'Delete user'),
            ]
        },
        'Resources': {
            'x': 8.3,
            'endpoints': [
                ('GET', '/resources', 'List resources'),
                ('POST', '/resources', 'Upload resource'),
                ('GET', '/resources/download', 'Download file'),
            ]
        },
    }
    
    for cat_name, cat_info in categories.items():
        x = cat_info['x']
        
        # Category header
        cat_box = FancyBboxPatch((x-0.6, 8.5), 1.2, 0.45, boxstyle="round,pad=0.05",
                                edgecolor=colors['secondary'], facecolor=colors['secondary'], linewidth=1.5)
        ax.add_patch(cat_box)
        ax.text(x, 8.725, cat_name, ha='center', fontsize=8, fontweight='bold', color='white')
        
        # Endpoints
        for i, (method, route, desc) in enumerate(cat_info['endpoints']):
            y = 8.1 - (i * 0.8)
            
            # Method badge
            method_color = {
                'GET': colors['primary'],
                'POST': colors['secondary'],
                'PUT': colors['accent'],
                'DELETE': '#F44336',
            }.get(method, colors['gray'])
            
            method_box = FancyBboxPatch((x-0.55, y-0.15), 0.5, 0.3, boxstyle="round,pad=0.02",
                                       edgecolor=method_color, facecolor=method_color, linewidth=1)
            ax.add_patch(method_box)
            ax.text(x-0.3, y, method, ha='center', fontsize=6, fontweight='bold', color='white')
            
            # Endpoint info
            endpoint_text = f'{route}\n{desc}'
            ax.text(x+0.1, y-0.025, endpoint_text, fontsize=5, multialignment='left')
    
    # Response formats
    ax.text(0.8, 3.8, 'Response Formats', fontsize=10, fontweight='bold')
    
    response_samples = [
        'Success (200): {status: "success", data: {...}, message: "OK"}',
        'Error (400): {status: "error", error: "Bad Request", message: "..."}',
        'Unauthorized (401): {status: "error", error: "Unauthorized"}',
        'Forbidden (403): {status: "error", error: "Forbidden - Insufficient Permissions"}',
    ]
    
    y_resp = 3.5
    for resp in response_samples:
        resp_box = FancyBboxPatch((0.5, y_resp-0.2), 9, 0.3, boxstyle="round,pad=0.03",
                                 edgecolor=colors['gray'], facecolor=colors['box_light'], linewidth=0.5)
        ax.add_patch(resp_box)
        ax.text(0.7, y_resp-0.05, resp, fontsize=6, family='monospace')
        y_resp -= 0.5
    
    # Security
    sec_box = FancyBboxPatch((0.5, 0.3), 9, 0.9, boxstyle="round,pad=0.08",
                            edgecolor=colors['primary'], facecolor=colors['light'], linewidth=1.5)
    ax.add_patch(sec_box)
    ax.text(0.8, 1.05, 'Security', fontsize=10, fontweight='bold')
    ax.text(5, 0.75, 'All endpoints require valid session token in headers | Role-based access control enforced',
            ha='center', fontsize=7)
    ax.text(5, 0.45, 'Request: Authorization: Bearer {token}  |  Response includes CORS headers',
            ha='center', fontsize=7, style='italic')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_6_api_endpoints.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_6_api_endpoints.png")
    plt.close()

# ============= DIAGRAM 7: DEPLOYMENT ARCHITECTURE =============
def create_deployment():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Local Deployment Architecture', ha='center', fontsize=16, fontweight='bold')
    
    # Local Machine
    local_box = FancyBboxPatch((0.3, 1), 9.4, 8, boxstyle="round,pad=0.15",
                              edgecolor=colors['primary'], facecolor=colors['light'], linewidth=2)
    ax.add_patch(local_box)
    ax.text(0.7, 8.7, 'Local Machine (Windows/Mac/Linux)', fontsize=11, fontweight='bold', color=colors['primary'])
    
    # Browser
    browser_box = FancyBboxPatch((0.8, 7.5), 3, 1, boxstyle="round,pad=0.08",
                                edgecolor=colors['secondary'], facecolor='white', linewidth=2)
    ax.add_patch(browser_box)
    ax.text(2.3, 8.2, 'Web Browser', ha='center', fontsize=10, fontweight='bold')
    ax.text(2.3, 7.75, 'http://localhost:8000', ha='center', fontsize=8, family='monospace')
    
    # Arrow to API
    arrow = FancyArrowPatch((3.8, 8.0), (5.2, 8.0), arrowstyle='<->', mutation_scale=20,
                           linewidth=2, color=colors['accent'])
    ax.add_patch(arrow)
    ax.text(4.5, 8.25, 'HTTP/REST', fontsize=8, ha='center')
    
    # FastAPI Server
    server_box = FancyBboxPatch((5.2, 7.4), 3.8, 1.2, boxstyle="round,pad=0.08",
                               edgecolor=colors['accent'], facecolor='#FFF3E0', linewidth=2)
    ax.add_patch(server_box)
    ax.text(7.1, 8.3, 'FastAPI Server', ha='center', fontsize=10, fontweight='bold')
    ax.text(7.1, 7.95, 'Process: main.py', ha='center', fontsize=8, family='monospace')
    ax.text(7.1, 7.6, 'Port: 8000 | Host: 127.0.0.1', ha='center', fontsize=7)
    
    # Components inside FastAPI
    components = [
        ('Uvicorn', 6.0, 6.8),
        ('Route Handlers', 7.5, 6.8),
        ('Business Logic', 9.0, 6.8),
    ]
    
    for comp, x, y in components:
        comp_box = FancyBboxPatch((x-0.5, y-0.2), 1, 0.4, boxstyle="round,pad=0.03",
                                 edgecolor=colors['accent'], facecolor='white', linewidth=1)
        ax.add_patch(comp_box)
        ax.text(x, y, comp, ha='center', fontsize=7)
    
    # Database
    arrow_db = FancyArrowPatch((7.1, 7.3), (7.1, 6.5), arrowstyle='<->', mutation_scale=20,
                              linewidth=2, color=colors['primary'])
    ax.add_patch(arrow_db)
    
    db_box = FancyBboxPatch((5.5, 5.5), 3.2, 0.8, boxstyle="round,pad=0.08",
                           edgecolor=colors['primary'], facecolor='#F1F8E9', linewidth=2)
    ax.add_patch(db_box)
    ax.text(7.1, 6.05, 'SQLite Database', ha='center', fontsize=10, fontweight='bold')
    ax.text(7.1, 5.7, 'File: campus.db', ha='center', fontsize=8, family='monospace')
    
    # File Storage
    file_box = FancyBboxPatch((5.5, 4.3), 3.2, 0.8, boxstyle="round,pad=0.08",
                             edgecolor=colors['primary'], facecolor='white', linewidth=1.5)
    ax.add_patch(file_box)
    ax.text(7.1, 4.85, 'File Storage (Resources)', ha='center', fontsize=9, fontweight='bold')
    ax.text(7.1, 4.5, 'Directory: /uploads/*.xlsx', ha='center', fontsize=7, family='monospace')
    
    # Environment info
    env_box = FancyBboxPatch((0.8, 2.8), 8.4, 1.2, boxstyle="round,pad=0.08",
                            edgecolor=colors['secondary'], facecolor='#E3F2FD', linewidth=1.5)
    ax.add_patch(env_box)
    ax.text(1.2, 3.75, 'Environment Setup', fontsize=10, fontweight='bold')
    ax.text(5.0, 3.4, 'Python 3.9+ | Virtual Environment (.venv)', fontsize=8)
    ax.text(5.0, 3.0, 'Package Manager: pip | Dependencies: requirements.txt', fontsize=8)
    
    # Startup process
    startup_box = FancyBboxPatch((0.8, 1.3), 8.4, 1.3, boxstyle="round,pad=0.08",
                                edgecolor=colors['accent'], facecolor='#FFF3E0', linewidth=1.5)
    ax.add_patch(startup_box)
    ax.text(1.2, 2.4, 'Startup Process', fontsize=10, fontweight='bold')
    ax.text(0.95, 2.05, '1. Activate .venv', fontsize=7)
    ax.text(0.95, 1.75, '2. Run: python main.py', fontsize=7, family='monospace')
    ax.text(0.95, 1.45, '3. Server starts on http://127.0.0.1:8000', fontsize=7, family='monospace')
    ax.text(4.5, 2.05, '4. Open browser & navigate to app', fontsize=7)
    ax.text(4.5, 1.75, '5. Database auto-initializes if new', fontsize=7)
    ax.text(4.5, 1.45, '6. Ready for testing & usage!', fontsize=7)
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_7_deployment.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_7_deployment.png")
    plt.close()

# ============= DIAGRAM 8: TECHNOLOGY STACK =============
def create_tech_stack():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    ax.text(5, 9.5, 'Complete Technology Stack', ha='center', fontsize=16, fontweight='bold')
    
    # Frontend Stack
    ax.text(0.8, 9.0, 'Frontend (Client-Side)', fontsize=11, fontweight='bold', 
            bbox=dict(boxstyle='round', facecolor=colors['light'], edgecolor=colors['secondary'], linewidth=1.5))
    
    frontend_techs = [
        ('HTML5', 1.0, 8.3),
        ('Vanilla JS', 2.2, 8.3),
        ('Tailwind CSS', 3.4, 8.3),
        ('FontAwesome', 4.6, 8.3),
        ('Firebase SDK', 5.8, 8.3),
        ('Axios/Fetch', 7.0, 8.3),
    ]
    
    for tech, x, y in frontend_techs:
        tech_box = FancyBboxPatch((x-0.5, y-0.25), 1, 0.5, boxstyle="round,pad=0.05",
                                 edgecolor=colors['secondary'], facecolor='white', linewidth=1.5)
        ax.add_patch(tech_box)
        ax.text(x, y, tech, ha='center', fontsize=8, fontweight='bold')
    
    # Backend Stack
    ax.text(0.8, 7.6, 'Backend (Server-Side)', fontsize=11, fontweight='bold',
            bbox=dict(boxstyle='round', facecolor=colors['light'], edgecolor=colors['accent'], linewidth=1.5))
    
    backend_techs = [
        ('FastAPI', 1.0, 6.9),
        ('Python 3.9+', 2.2, 6.9),
        ('Uvicorn', 3.4, 6.9),
        ('SQLAlchemy', 4.6, 6.9),
        ('Pydantic', 5.8, 6.9),
        ('python-multipart', 7.0, 6.9),
    ]
    
    for tech, x, y in backend_techs:
        tech_box = FancyBboxPatch((x-0.5, y-0.25), 1, 0.5, boxstyle="round,pad=0.05",
                                 edgecolor=colors['accent'], facecolor='white', linewidth=1.5)
        ax.add_patch(tech_box)
        ax.text(x, y, tech, ha='center', fontsize=8, fontweight='bold')
    
    # Database Stack
    ax.text(0.8, 6.2, 'Database & Storage', fontsize=11, fontweight='bold',
            bbox=dict(boxstyle='round', facecolor=colors['light'], edgecolor=colors['primary'], linewidth=1.5))
    
    db_techs = [
        ('SQLite', 1.5, 5.5),
        ('SQL Alchemy ORM', 3.5, 5.5),
        ('Excel (openpyxl)', 5.5, 5.5),
        ('File System', 7.5, 5.5),
    ]
    
    for tech, x, y in db_techs:
        tech_box = FancyBboxPatch((x-0.7, y-0.25), 1.4, 0.5, boxstyle="round,pad=0.05",
                                 edgecolor=colors['primary'], facecolor='white', linewidth=1.5)
        ax.add_patch(tech_box)
        ax.text(x, y, tech, ha='center', fontsize=8, fontweight='bold')
    
    # External Services
    ax.text(0.8, 4.6, 'External Services & APIs', fontsize=11, fontweight='bold',
            bbox=dict(boxstyle='round', facecolor=colors['light'], edgecolor=colors['gray'], linewidth=1.5))
    
    services = [
        ('Firebase\nReal-time DB', 1.2, 3.7),
        ('Groq API\nAI/LLM', 2.8, 3.7),
        ('FontAwesome\nCDN', 4.4, 3.7),
        ('Tailwind\nCDN', 6.0, 3.7),
    ]
    
    for service, x, y in services:
        service_box = FancyBboxPatch((x-0.65, y-0.4), 1.3, 0.8, boxstyle="round,pad=0.05",
                                    edgecolor=colors['gray'], facecolor='white', linewidth=1.5)
        ax.add_patch(service_box)
        ax.text(x, y, service, ha='center', fontsize=7, multialignment='center', fontweight='bold')
    
    # Features/Capabilities
    ax.text(0.8, 2.5, 'Key Features & Capabilities', fontsize=11, fontweight='bold',
            bbox=dict(boxstyle='round', facecolor=colors['light'], edgecolor=colors['secondary'], linewidth=1.5))
    
    features = [
        ('Role-Based\nAccess', 1.2, 1.6),
        ('Real-time\nChat', 2.8, 1.6),
        ('Excel\nUpload/Export', 4.4, 1.6),
        ('Responsive\nUI', 6.0, 1.6),
        ('Session\nManagement', 7.6, 1.6),
    ]
    
    for feature, x, y in features:
        feat_box = FancyBboxPatch((x-0.65, y-0.35), 1.3, 0.7, boxstyle="round,pad=0.05",
                                 edgecolor=colors['secondary'], facecolor='white', linewidth=1)
        ax.add_patch(feat_box)
        ax.text(x, y, feature, ha='center', fontsize=7, multialignment='center')
    
    # Deployment
    deploy_box = FancyBboxPatch((0.5, 0.2), 9, 0.8, boxstyle="round,pad=0.08",
                               edgecolor=colors['primary'], facecolor=colors['light'], linewidth=1.5)
    ax.add_patch(deploy_box)
    ax.text(5, 0.8, 'Deployment: Local Machine (127.0.0.1:8000) | Production Ready for Render/Heroku/AWS',
            ha='center', fontsize=8, fontweight='bold')
    ax.text(5, 0.4, 'Docker Support Available | CORS Enabled | HTTPS Ready',
            ha='center', fontsize=7, style='italic')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'diagram_8_tech_stack.png', dpi=300, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    print("✓ Created: diagram_8_tech_stack.png")
    plt.close()

# ============= RUN ALL DIAGRAMS =============
if __name__ == '__main__':
    print("🎨 Generating Professional Diagrams...\n")
    print("=" * 60)
    
    create_system_architecture()
    create_frontend_components()
    create_database_schema()
    create_auth_control()
    create_data_flow()
    create_api_endpoints()
    create_deployment()
    create_tech_stack()
    
    print("=" * 60)
    print(f"\n✅ All diagrams created successfully!")
    print(f"📁 Location: professional_diagrams/")
    print(f"\n📊 Generated Diagrams:")
    print(f"   1. diagram_1_system_architecture.png")
    print(f"   2. diagram_2_frontend_components.png")
    print(f"   3. diagram_3_database_schema.png")
    print(f"   4. diagram_4_auth_control.png")
    print(f"   5. diagram_5_data_flow.png")
    print(f"   6. diagram_6_api_endpoints.png")
    print(f"   7. diagram_7_deployment.png")
    print(f"   8. diagram_8_tech_stack.png")
    print(f"\n💾 All images are ready to download, print, and share!")
