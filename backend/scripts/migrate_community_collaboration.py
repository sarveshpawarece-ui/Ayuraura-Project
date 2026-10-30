import sqlite3
import os
import sys

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "..", "ayursetu_dev.db")
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # 1. Update forum_posts table
    existing_posts_cols = [c[1] for c in cur.execute("PRAGMA table_info(forum_posts)").fetchall()]
    new_post_cols = [
        ("subject_id", "VARCHAR(100)"),
        ("subject_name", "VARCHAR(255)"),
        ("topic", "VARCHAR(255)"),
        ("academic_year", "VARCHAR(50)"),
        ("post_type", "VARCHAR(50) DEFAULT 'DISCUSSION'"),
        ("resource_url", "VARCHAR(1000)"),
        ("ai_summary", "TEXT"),
        ("ai_followups", "JSON DEFAULT '[]'"),
        ("bookmarks_count", "INTEGER DEFAULT 0")
    ]
    for col_name, col_type in new_post_cols:
        if col_name not in existing_posts_cols:
            print(f"Adding {col_name} to forum_posts...")
            cur.execute(f"ALTER TABLE forum_posts ADD COLUMN {col_name} {col_type}")

    # 2. discussion_bookmarks
    cur.execute("""
    CREATE TABLE IF NOT EXISTS discussion_bookmarks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        post_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        UNIQUE (user_id, post_id)
    );
    """)

    # 3. faculty_questions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS faculty_questions (
        id VARCHAR(36) PRIMARY KEY,
        student_id VARCHAR(36) NOT NULL,
        faculty_id VARCHAR(36),
        institution_id VARCHAR(36),
        subject_id VARCHAR(100) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        topic VARCHAR(255),
        academic_year VARCHAR(50) DEFAULT '1st Year' NOT NULL,
        title VARCHAR(255) NOT NULL,
        question_text TEXT NOT NULL,
        is_anonymous_to_peers BOOLEAN DEFAULT 0 NOT NULL,
        status VARCHAR(50) DEFAULT 'OPEN' NOT NULL,
        faculty_answer TEXT,
        answered_by_user_id VARCHAR(36),
        answered_at TIMESTAMP,
        ai_simplified_explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (answered_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE SET NULL
    );
    """)

    # 4. study_groups
    cur.execute("""
    CREATE TABLE IF NOT EXISTS study_groups (
        id VARCHAR(36) PRIMARY KEY,
        creator_id VARCHAR(36) NOT NULL,
        institution_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        subject_id VARCHAR(100) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        academic_year VARCHAR(50) DEFAULT '1st Year' NOT NULL,
        topic_focus VARCHAR(255),
        max_members INTEGER DEFAULT 15 NOT NULL,
        is_private BOOLEAN DEFAULT 0 NOT NULL,
        passcode VARCHAR(50),
        resources JSON DEFAULT '[]' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (institution_id) REFERENCES institution_profiles(id) ON DELETE SET NULL
    );
    """)

    # 5. study_group_members
    cur.execute("""
    CREATE TABLE IF NOT EXISTS study_group_members (
        id VARCHAR(36) PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        role VARCHAR(50) DEFAULT 'MEMBER' NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (group_id, user_id)
    );
    """)

    # 6. study_group_discussions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS study_group_discussions (
        id VARCHAR(36) PRIMARY KEY,
        group_id VARCHAR(36) NOT NULL,
        author_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 7. educational_feedback
    cur.execute("""
    CREATE TABLE IF NOT EXISTS educational_feedback (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        target_title VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL,
        feedback_text TEXT,
        is_public BOOLEAN DEFAULT 0 NOT NULL,
        moderation_status VARCHAR(50) DEFAULT 'APPROVED' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, target_type, target_id)
    );
    """)

    # 8. community_moderation_actions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS community_moderation_actions (
        id VARCHAR(36) PRIMARY KEY,
        moderator_id VARCHAR(36) NOT NULL,
        action VARCHAR(50) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 9. user_restrictions
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_restrictions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        is_restricted BOOLEAN DEFAULT 1 NOT NULL,
        restricted_until TIMESTAMP,
        restriction_reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 10. user_notification_preferences
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL,
        faculty_replies BOOLEAN DEFAULT 1 NOT NULL,
        session_announcements BOOLEAN DEFAULT 1 NOT NULL,
        session_reminders BOOLEAN DEFAULT 1 NOT NULL,
        study_group_activity BOOLEAN DEFAULT 1 NOT NULL,
        discussion_replies BOOLEAN DEFAULT 1 NOT NULL,
        available_recordings BOOLEAN DEFAULT 1 NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Seed default forum categories if empty
    cat_count = cur.execute("SELECT COUNT(*) FROM forum_categories").fetchone()[0]
    if cat_count == 0:
        import uuid as uuid_pkg
        categories = [
            ("BAMS Subject Discussions", "bams-subjects", "Deep-dive clinical, anatomical, and pharmacological curriculum questions.", "BookOpen", 1),
            ("Clinical Case Studies & Chikitsa", "clinical-cases", "Patient case analyses, panchakarma protocols, and diagnostic discussions.", "Stethoscope", 2),
            ("AIAPGET & NCISM Exam Prep", "exam-prep", "High-yield Shloka memorization, previous year papers, and viva strategies.", "Award", 3),
            ("Study Tips & Revision Resources", "study-tips", "Peer-reviewed mnemonics, study schedules, and Ayurvedic notes.", "Sparkles", 4),
            ("Samhita & Shloka Recitation", "samhita-shloka", "Classical Brihat-trayi & Laghu-trayi textual interpretation.", "Layers", 5)
        ]
        for name, slug, desc, icon, order in categories:
            cat_id = uuid_pkg.uuid4().hex
            cur.execute("""
                INSERT INTO forum_categories (id, name, slug, description, icon_name, display_order, topics_count, posts_count, is_active)
                VALUES (?, ?, ?, ?, ?, ?, 0, 0, 1)
            """, (cat_id, name, slug, desc, icon, order))
        print("Seeded 5 official BAMS forum categories.")

    con.commit()
    con.close()
    print("Community & Collaboration migration completed successfully!")

if __name__ == "__main__":
    migrate()
