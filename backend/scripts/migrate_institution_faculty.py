import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "..", "ayursetu_dev.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

def add_col(table, col, col_type):
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added column {col} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {col} already exists in {table}")
        else:
            print(f"Notice for {table}.{col}: {e}")

# 1. Update institution_profiles columns
add_col("institution_profiles", "ncism_approval_number", "VARCHAR(100)")
add_col("institution_profiles", "university_affiliation", "VARCHAR(255)")
add_col("institution_profiles", "verification_documents", "JSON")
add_col("institution_profiles", "verification_submitted_at", "DATETIME")
add_col("institution_profiles", "verification_notes", "TEXT")

# 2. Update faculty_profiles columns
add_col("faculty_profiles", "qualifications", "VARCHAR(255)")
add_col("faculty_profiles", "specialization", "VARCHAR(255)")
add_col("faculty_profiles", "assigned_subjects", "JSON")
add_col("faculty_profiles", "assigned_academic_years", "JSON")
add_col("faculty_profiles", "contact_email", "VARCHAR(255)")
add_col("faculty_profiles", "contact_phone", "VARCHAR(50)")
add_col("faculty_profiles", "bio", "TEXT")
add_col("faculty_profiles", "is_active", "BOOLEAN DEFAULT 1")
add_col("faculty_profiles", "created_at", "DATETIME")
add_col("faculty_profiles", "updated_at", "DATETIME")

# 3. Create institution_invitations table
cur.execute("""
CREATE TABLE IF NOT EXISTS institution_invitations (
    id CHAR(36) PRIMARY KEY,
    institution_id CHAR(36) NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'FACULTY',
    invited_name VARCHAR(255),
    department_id CHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(150),
    designation VARCHAR(100),
    academic_year VARCHAR(50),
    assigned_subjects JSON,
    invitation_token VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invited_by_user_id CHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME,
    accepted_at DATETIME
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_inv_inst_id ON institution_invitations(institution_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_inv_email ON institution_invitations(email)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_inv_token ON institution_invitations(invitation_token)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_inst_inv_status ON institution_invitations(status)")

# 4. Create educational_resources table
cur.execute("""
CREATE TABLE IF NOT EXISTS educational_resources (
    id CHAR(36) PRIMARY KEY,
    institution_id CHAR(36) NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
    faculty_id CHAR(36) NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'NOTES',
    academic_year VARCHAR(50) NOT NULL,
    subject_id VARCHAR(100) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    unit_number INTEGER,
    unit_name VARCHAR(255),
    topic_id VARCHAR(100),
    topic_name VARCHAR(255),
    class_or_batch VARCHAR(100) DEFAULT 'All',
    file_url VARCHAR(500),
    content_text TEXT,
    is_published BOOLEAN NOT NULL DEFAULT 1,
    is_ai_generated BOOLEAN NOT NULL DEFAULT 0,
    ai_disclaimer VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_edu_res_inst_id ON educational_resources(institution_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_edu_res_fac_id ON educational_resources(faculty_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_edu_res_year ON educational_resources(academic_year)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_edu_res_subj ON educational_resources(subject_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_edu_res_pub ON educational_resources(is_published)")

# 5. Create lecture_schedules table
cur.execute("""
CREATE TABLE IF NOT EXISTS lecture_schedules (
    id CHAR(36) PRIMARY KEY,
    institution_id CHAR(36) NOT NULL REFERENCES institution_profiles(id) ON DELETE CASCADE,
    faculty_id CHAR(36) NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject_id VARCHAR(100) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    topic VARCHAR(255),
    session_type VARCHAR(50) NOT NULL DEFAULT 'LECTURE',
    scheduled_date DATE NOT NULL,
    start_time VARCHAR(50) NOT NULL,
    end_time VARCHAR(50) NOT NULL,
    venue_or_link VARCHAR(255),
    session_link VARCHAR(500),
    recording_url VARCHAR(500),
    announcement TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME,
    updated_at DATETIME
)
""")
cur.execute("CREATE INDEX IF NOT EXISTS idx_lec_sched_inst ON lecture_schedules(institution_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_lec_sched_fac ON lecture_schedules(faculty_id)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_lec_sched_date ON lecture_schedules(scheduled_date)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_lec_sched_year ON lecture_schedules(academic_year)")
cur.execute("CREATE INDEX IF NOT EXISTS idx_lec_sched_status ON lecture_schedules(status)")

conn.commit()
conn.close()
print("Migration completed successfully.")
