import sqlite3
import uuid
from datetime import datetime

conn = sqlite3.connect('ayursetu_dev.db')
c = conn.cursor()

print("--- SEEDING DEMO PROFILES, POSTINGS & APPLICATIONS ---")

# 1. Student Profiles
students = [
    {
        "user_id": "7fb6631ad18e4726913c3b0eb1a3c79c", # student@ayursetu.local
        "email": "student@ayursetu.local",
        "full_name": "Priya Sharma",
        "college": "National Institute of Ayurveda, Jaipur",
        "year": 4,
        "cgpa": 8.85
    },
    {
        "user_id": "2d512a818c3046bc9d12a849767746ec", # student@ayursetu.in
        "email": "student@ayursetu.in",
        "full_name": "Aarav Patel",
        "college": "Government Ayurved College, Pune",
        "year": 5,
        "cgpa": 9.10
    }
]

student_profile_ids = {}

for s in students:
    c.execute("SELECT id FROM student_profiles WHERE user_id = ?", (s["user_id"],))
    row = c.fetchone()
    if row:
        sp_id = row[0]
        c.execute("UPDATE student_profiles SET full_name = ?, college_name = ?, course = 'BAMS', current_year = ?, cgpa = ? WHERE id = ?",
                  (s["full_name"], s["college"], s["year"], s["cgpa"], sp_id))
        print(f"Updated existing student profile {sp_id} for {s['email']}")
    else:
        sp_id = uuid.uuid4().hex
        now = datetime.now().isoformat()
        c.execute("""
            INSERT INTO student_profiles (id, user_id, full_name, enrollment_number, degree_program, college_name, course, current_year, cgpa, city, state, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'BAMS', ?, 'BAMS', ?, ?, 'Jaipur', 'Rajasthan', ?, ?)
        """, (sp_id, s["user_id"], s["full_name"], f"AYU-{sp_id[:6].upper()}", s["college"], s["year"], s["cgpa"], now, now))
        print(f"Created student profile {sp_id} for {s['email']}")
    student_profile_ids[s["email"]] = sp_id

# 2. Doctors to link
doctors = [
    {
        "user_id": "3e3d5da227fa401f8c4e2674991675bf", # doctor@ayursetu.local
        "email": "doctor@ayursetu.local",
        "doc_profile_id": "767edf35cf774199b4874987b92a8e96",
        "name": "Dr. Rajeshwari Sharma",
        "clinic": "AyurSetu Clinical Wellness Centre"
    },
    {
        "user_id": "b47746b45b494672a9cc8e3d51a9fa3b", # doctor@ayursetu.in
        "email": "doctor@ayursetu.in",
        "doc_profile_id": "089b03c975a84b9daff7b2cfe268e727",
        "name": "Dr. Rajesh Varma, BAMS, MD",
        "clinic": "Varma Ayurvedic Hospital & Research Institute"
    }
]

for d in doctors:
    # Check if doctor has at least 2 postings
    c.execute("SELECT id FROM internship_postings WHERE employer_user_id = ?", (d["user_id"],))
    existing_postings = [r[0] for r in c.fetchall()]
    
    if len(existing_postings) < 2:
        post1_id = uuid.uuid4().hex
        post2_id = uuid.uuid4().hex
        now = datetime.now().isoformat()
        
        # Post 1: Panchakarma
        c.execute("""
            INSERT INTO internship_postings (
                id, employer_user_id, doctor_id, organization_name, organization_type,
                title, description, department, duration_months, mode,
                location_city, location_state, stipend_inr_month, capacity, deadline,
                requirements, skills_required,
                status, specialization, internship_type, duration_text, location_address,
                number_of_seats, start_date, end_date, eligible_courses, eligible_years,
                working_hours, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'CLINIC',
                      'Clinical Panchakarma & Metabolic Disorders Residency',
                      'Immersive 6-month clinical rotation in Shodhana therapies, Nadi Pariksha, and inpatient Ayurvedic treatment protocols.',
                      'Panchakarma', 6, 'ON_SITE', 'Pune', 'Maharashtra', 15000, 5, '2026-11-30',
                      'Completed 3rd year BAMS or Intern BAMS with foundational knowledge of Panchakarma.',
                      '[\"Panchakarma\", \"Nadi Pariksha\", \"Patient History Taking\", \"Abhyanga\", \"Shirodhara\"]',
                      'PUBLISHED', 'Panchakarma', 'CLINICAL', '6 Months Full Time', '108 Ayur Heritage Road, Shivajinagar, Pune',
                      5, '2026-10-01', '2027-03-31', '[\"BAMS\", \"MD Ayurveda\"]', '[\"4th Year\", \"Intern\", \"Graduate\"]',
                      '9:00 AM - 5:00 PM (Mon-Sat)', ?, ?)
        """, (post1_id, d["user_id"], d["doc_profile_id"], d["clinic"], now, now))

        # Post 2: Kayachikitsa
        c.execute("""
            INSERT INTO internship_postings (
                id, employer_user_id, doctor_id, organization_name, organization_type,
                title, description, department, duration_months, mode,
                location_city, location_state, stipend_inr_month, capacity, deadline,
                requirements, skills_required,
                status, specialization, internship_type, duration_text, location_address,
                number_of_seats, start_date, end_date, eligible_courses, eligible_years,
                working_hours, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'HOSPITAL',
                      'Kayachikitsa & Chronic Disease Management Rotation',
                      'Hands-on clinical exposure to managing metabolic syndromes, auto-immune conditions, and classical Rasayana therapies.',
                      'Kayachikitsa', 3, 'HYBRID', 'Pune', 'Maharashtra', 12000, 4, '2026-12-15',
                      'BAMS clinical student with interest in chronic disease diagnosis and herbal pharmacopeia.',
                      '[\"Kayachikitsa\", \"Dosha Assessment\", \"Herbal Formulations\", \"Clinical Case Documentation\"]',
                      'PUBLISHED', 'Kayachikitsa', 'CLINICAL', '3 Months Hybrid', '108 Ayur Heritage Road, Pune',
                      4, '2026-10-15', '2027-01-15', '[\"BAMS\"]', '[\"3rd Year\", \"4th Year\", \"Intern\"]',
                      '9:30 AM - 4:30 PM (Mon-Fri)', ?, ?)
        """, (post2_id, d["user_id"], d["doc_profile_id"], d["clinic"], now, now))
        
        existing_postings = [post1_id, post2_id]
        print(f"Created 2 postings for {d['email']}: {post1_id}, {post2_id}")
    else:
        print(f"Doctor {d['email']} already has {len(existing_postings)} postings.")

    # 3. Create Applications for this Doctor
    # App 1: ACCEPTED candidate (Aarav Patel) -> For Attendance tracking
    c.execute("SELECT id FROM internship_applications WHERE internship_id = ? AND status = 'ACCEPTED'", (existing_postings[0],))
    acc_app = c.fetchone()
    if not acc_app:
        app1_id = uuid.uuid4().hex
        now = datetime.now().isoformat()
        student_prof_id = student_profile_ids["student@ayursetu.in"]
        c.execute("""
            INSERT INTO internship_applications (
                id, internship_id, student_id, cover_note, status, match_score, applied_at, updated_at
            ) VALUES (?, ?, ?, 'Eager to dedicate 6 months towards mastering classical Panchakarma therapies.', 'ACCEPTED', 96, ?, ?)
        """, (app1_id, existing_postings[0], student_prof_id, now, now))
        print(f"Created ACCEPTED application {app1_id} for student Aarav Patel under {d['email']}")

        # Add attendance records for Aarav Patel
        dates_present = [
            ("2026-09-01", "PRESENT", 8.0, "Nadi Pariksha and initial assessment rounds"),
            ("2026-09-02", "PRESENT", 8.0, "Supervised Abhyanga and Swedana protocol"),
            ("2026-09-03", "PRESENT", 8.0, "Shirodhara therapy and patient monitoring"),
            ("2026-09-04", "HALF_DAY", 4.0, "Morning OPD consultations and case notes"),
            ("2026-09-05", "PRESENT", 8.0, "Basti preparation and administration rounds")
        ]
        for dt, st, hrs, rem in dates_present:
            att_id = uuid.uuid4().hex
            c.execute("""
                INSERT INTO internship_attendance_logs (
                    id, application_id, date, is_present, hours_worked, remarks, recorded_at, internship_id, student_id, check_in, check_out, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '09:00 AM', '05:00 PM', ?)
            """, (att_id, app1_id, dt, 1 if st != "ABSENT" else 0, hrs, rem, now, existing_postings[0], student_prof_id, st))
        print(f"Added 5 attendance records for application {app1_id}")

    # App 2: SHORTLISTED candidate (Priya Sharma) -> For issuing Offer Letter in doctor/offers
    c.execute("SELECT id FROM internship_applications WHERE internship_id = ? AND status = 'SHORTLISTED'", (existing_postings[1],))
    sh_app = c.fetchone()
    if not sh_app:
        app2_id = uuid.uuid4().hex
        now = datetime.now().isoformat()
        student_prof_id = student_profile_ids["student@ayursetu.local"]
        c.execute("""
            INSERT INTO internship_applications (
                id, internship_id, student_id, cover_note, status, match_score, applied_at, updated_at, shortlisted_at
            ) VALUES (?, ?, ?, 'Deeply passionate about clinical Kayachikitsa research and classical Rasashastra therapies.', 'SHORTLISTED', 94, ?, ?, ?)
        """, (app2_id, existing_postings[1], student_prof_id, now, now, now))
        print(f"Created SHORTLISTED application {app2_id} for student Priya Sharma under {d['email']}")

conn.commit()
conn.close()
print("--- ALL DATA SEEDED SUCCESSFULLY ---")
