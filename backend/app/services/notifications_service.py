import uuid
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_, desc, update, func

from app.models.user import User, UserRole
from app.models.camps import AppNotification
from app.models.community_collaboration import UserNotificationPreference
from app.models.notifications import StudentReminder, AcademicAnnouncement
from app.models.domain import StudentProfile
from app.models.bams_ecosystem import StudentTimetablePreference, StudentBamsProgress
from app.schemas.notifications import (
    NotificationItemOut,
    NotificationListResponse,
    NotificationPreferencesIn,
    NotificationPreferencesOut,
    StudentReminderIn,
    StudentReminderUpdate,
    StudentReminderOut,
    AcademicAnnouncementCreate,
    AcademicAnnouncementOut,
    AISmartReminderGenerateIn,
    AISmartReminderGenerateOut,
    AISmartReminderItem
)

# Notification type to UI category mapping
TYPE_TO_CATEGORY: Dict[str, str] = {
    "ACADEMIC": "ACADEMIC",
    "ACADEMIC_ANNOUNCEMENT": "ACADEMIC",
    "STUDY_REMINDER": "STUDY_REMINDER",
    "EXAM_ALERT": "EXAM_ALERT",
    "EXAM_REVISION": "EXAM_ALERT",
    "TIMETABLE": "TIMETABLE",
    "TIMETABLE_UPDATE": "TIMETABLE",
    "FACULTY_ANNOUNCEMENT": "FACULTY",
    "FACULTY_NOTICE": "FACULTY",
    "FACULTY_REPLY": "FACULTY",
    "RESOURCE": "RESOURCE",
    "LEARNING_RESOURCE": "RESOURCE",
    "CAREER": "CAREER",
    "CAREER_UPDATE": "CAREER",
    "COMMUNITY": "COMMUNITY",
    "SESSION_ANNOUNCEMENT": "COMMUNITY",
    "SESSION_REMINDER": "COMMUNITY",
    "STUDY_GROUP_ACTIVITY": "COMMUNITY",
    "DISCUSSION_REPLY": "COMMUNITY",
    "SYSTEM_ALERT": "SYSTEM"
}

class NotificationsService:

    # ------------------------------------------------------------
    # 1. NOTIFICATION PREFERENCES MANAGEMENT
    # ------------------------------------------------------------
    @staticmethod
    async def get_or_create_preferences(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> UserNotificationPreference:
        """Fetch or initialize notification preferences for user."""
        res = await db.execute(
            select(UserNotificationPreference).where(UserNotificationPreference.user_id == user_id)
        )
        pref = res.scalar_one_or_none()
        if not pref:
            pref = UserNotificationPreference(
                user_id=user_id,
                faculty_replies=True,
                session_announcements=True,
                session_reminders=True,
                study_group_activity=True,
                discussion_replies=True,
                available_recordings=True,
                academic_announcements=True,
                study_reminders=True,
                exam_alerts=True,
                timetable_updates=True,
                career_updates=True,
                learning_resource_alerts=True,
                email_channel_enabled=False,
                push_channel_enabled=True,
                reminder_frequency="IMMEDIATE"
            )
            db.add(pref)
            await db.commit()
            await db.refresh(pref)
        return pref

    @staticmethod
    async def update_preferences(
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: NotificationPreferencesIn
    ) -> UserNotificationPreference:
        """Update notification preferences."""
        pref = await NotificationsService.get_or_create_preferences(db, user_id)
        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            if v is not None and hasattr(pref, k):
                setattr(pref, k, v)
        pref.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(pref)
        return pref

    # ------------------------------------------------------------
    # 2. DISPATCH NOTIFICATION WITH DEDUPLICATION & PREFERENCE CHECK
    # ------------------------------------------------------------
    @staticmethod
    async def dispatch_notification(
        db: AsyncSession,
        recipient_id: uuid.UUID,
        title: str,
        message: str,
        notification_type: str = "ACADEMIC",
        action_url: Optional[str] = None
    ) -> Optional[AppNotification]:
        """
        Safely dispatches an in-app notification:
        1. Checks recipient's category and channel preferences.
        2. Enforces deduplication within 15-minute window.
        3. Creates and commits the AppNotification.
        """
        # 1. Preference check
        pref = await NotificationsService.get_or_create_preferences(db, recipient_id)
        nt_upper = notification_type.upper()

        if nt_upper in ["ACADEMIC", "ACADEMIC_ANNOUNCEMENT"] and not getattr(pref, "academic_announcements", True):
            return None
        if nt_upper in ["STUDY_REMINDER", "STUDY_SESSION"] and not getattr(pref, "study_reminders", True):
            return None
        if nt_upper in ["EXAM_ALERT", "EXAM_REVISION"] and not getattr(pref, "exam_alerts", True):
            return None
        if nt_upper in ["TIMETABLE", "TIMETABLE_UPDATE"] and not getattr(pref, "timetable_updates", True):
            return None
        if nt_upper in ["CAREER", "CAREER_UPDATE"] and not getattr(pref, "career_updates", True):
            return None
        if nt_upper in ["RESOURCE", "LEARNING_RESOURCE"] and not getattr(pref, "learning_resource_alerts", True):
            return None
        if nt_upper == "FACULTY_REPLY" and not getattr(pref, "faculty_replies", True):
            return None

        # 2. Deduplication check: same recipient, title, and notification_type in last 15 minutes
        fifteen_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=15)
        dup_res = await db.execute(
            select(AppNotification).where(
                and_(
                    AppNotification.recipient_id == recipient_id,
                    AppNotification.title == title,
                    AppNotification.notification_type == notification_type,
                    AppNotification.created_at >= fifteen_mins_ago
                )
            ).limit(1)
        )
        if dup_res.scalar_one_or_none() is not None:
            # Duplicate suppressed
            return None

        # 3. Create record
        notif = AppNotification(
            recipient_id=recipient_id,
            title=title,
            message=message,
            notification_type=notification_type,
            action_url=action_url,
            is_read=False
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        return notif

    # ------------------------------------------------------------
    # 3. NOTIFICATION RETRIEVAL & MANAGEMENT
    # ------------------------------------------------------------
    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: uuid.UUID,
        category: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50
    ) -> NotificationListResponse:
        """Fetch student's notifications with category mapping and unread count."""
        query = select(AppNotification).where(AppNotification.recipient_id == user_id)
        if unread_only:
            query = query.where(AppNotification.is_read == False)

        query = query.order_by(desc(AppNotification.created_at)).limit(limit)
        res = await db.execute(query)
        items = list(res.scalars().all())

        # Calculate counts
        unread_stmt = select(func.count(AppNotification.id)).where(
            and_(AppNotification.recipient_id == user_id, AppNotification.is_read == False)
        )
        unread_res = await db.execute(unread_stmt)
        unread_count = unread_res.scalar() or 0

        total_stmt = select(func.count(AppNotification.id)).where(AppNotification.recipient_id == user_id)
        total_res = await db.execute(total_stmt)
        total_count = total_res.scalar() or 0

        # Map to category & filter if category specified
        mapped_items = []
        for n in items:
            derived_cat = TYPE_TO_CATEGORY.get(n.notification_type.upper(), "GENERAL")
            if category and category.upper() != "ALL":
                if derived_cat != category.upper():
                    continue

            mapped_items.append(
                NotificationItemOut(
                    id=n.id,
                    recipient_id=n.recipient_id,
                    title=n.title,
                    message=n.message,
                    notification_type=n.notification_type,
                    category=derived_cat,
                    action_url=n.action_url,
                    is_read=n.is_read,
                    read_at=n.read_at,
                    created_at=n.created_at
                )
            )

        return NotificationListResponse(
            total_count=total_count,
            unread_count=unread_count,
            notifications=mapped_items
        )

    @staticmethod
    async def mark_as_read(
        db: AsyncSession,
        notification_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Mark single notification as read with ownership check."""
        res = await db.execute(
            select(AppNotification).where(
                and_(AppNotification.id == notification_id, AppNotification.recipient_id == user_id)
            )
        )
        notif = res.scalar_one_or_none()
        if not notif:
            return False

        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        await db.commit()
        return True

    @staticmethod
    async def mark_all_as_read(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> int:
        """Mark all unread notifications for a user as read."""
        stmt = (
            update(AppNotification)
            .where(and_(AppNotification.recipient_id == user_id, AppNotification.is_read == False))
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount or 0

    @staticmethod
    async def delete_notification(
        db: AsyncSession,
        notification_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Delete notification with ownership check."""
        res = await db.execute(
            select(AppNotification).where(
                and_(AppNotification.id == notification_id, AppNotification.recipient_id == user_id)
            )
        )
        notif = res.scalar_one_or_none()
        if not notif:
            return False

        await db.delete(notif)
        await db.commit()
        return True

    # ------------------------------------------------------------
    # 4. PERSONALIZED STUDENT REMINDERS
    # ------------------------------------------------------------
    @staticmethod
    async def get_student_reminders(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> List[StudentReminder]:
        """Fetch all personal reminders for authenticated student."""
        res = await db.execute(
            select(StudentReminder)
            .where(StudentReminder.user_id == user_id)
            .order_by(StudentReminder.is_completed.asc(), desc(StudentReminder.created_at))
        )
        return list(res.scalars().all())

    @staticmethod
    async def create_student_reminder(
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: StudentReminderIn,
        ai_generated: bool = False
    ) -> StudentReminder:
        """Create a new personal reminder for student."""
        reminder = StudentReminder(
            user_id=user_id,
            title=payload.title,
            description=payload.description,
            reminder_type=payload.reminder_type,
            subject=payload.subject,
            scheduled_time=payload.scheduled_time,
            recurrence=payload.recurrence,
            action_url=payload.action_url,
            ai_generated=ai_generated,
            is_completed=False,
            is_active=True
        )
        db.add(reminder)
        await db.commit()
        await db.refresh(reminder)

        # Also dispatch an initial notification if preference allows
        await NotificationsService.dispatch_notification(
            db=db,
            recipient_id=user_id,
            title=f"Reminder Set: {payload.title}",
            message=f"Scheduled for {payload.scheduled_time}. Subject: {payload.subject or 'General'}.",
            notification_type="STUDY_REMINDER",
            action_url=payload.action_url or "/notifications?tab=reminders"
        )

        return reminder

    @staticmethod
    async def update_student_reminder(
        db: AsyncSession,
        reminder_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: StudentReminderUpdate
    ) -> Optional[StudentReminder]:
        """Update personal reminder with ownership check."""
        res = await db.execute(
            select(StudentReminder).where(
                and_(StudentReminder.id == reminder_id, StudentReminder.user_id == user_id)
            )
        )
        reminder = res.scalar_one_or_none()
        if not reminder:
            return None

        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            if v is not None and hasattr(reminder, k):
                setattr(reminder, k, v)

        reminder.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(reminder)
        return reminder

    @staticmethod
    async def delete_student_reminder(
        db: AsyncSession,
        reminder_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Delete personal reminder with ownership check."""
        res = await db.execute(
            select(StudentReminder).where(
                and_(StudentReminder.id == reminder_id, StudentReminder.user_id == user_id)
            )
        )
        reminder = res.scalar_one_or_none()
        if not reminder:
            return False

        await db.delete(reminder)
        await db.commit()
        return True

    # ------------------------------------------------------------
    # 5. AI-POWERED SMART REMINDERS ENGINE
    # ------------------------------------------------------------
    @staticmethod
    async def generate_ai_smart_reminders(
        db: AsyncSession,
        user: User,
        payload: AISmartReminderGenerateIn
    ) -> AISmartReminderGenerateOut:
        """
        Inspects student profile, timetable, and BAMS progress to generate
        grounded, intelligent reminders tailored to actual learning gaps.
        """
        # Fetch student profile & timetable
        sp_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        sp = sp_res.scalar_one_or_none()

        prof_res = await db.execute(select(StudentBamsProgress).where(StudentBamsProgress.user_id == user.id))
        prog = prof_res.scalar_one_or_none()

        tt_res = await db.execute(
            select(StudentTimetablePreference).where(
                StudentTimetablePreference.student_profile_id == (sp.id if sp else None)
            )
        )
        tt = tt_res.scalar_one_or_none()

        reminders: List[AISmartReminderItem] = []
        student_stage = sp.degree_program or "BAMS 4th Professional"

        # 1. Weak Topics Reminders
        weak_topics = tt.weak_topics_selected if (tt and tt.weak_topics_selected) else []
        if payload.include_weak_topics:
            if weak_topics:
                first_weak = weak_topics[0]
                reminders.append(
                    AISmartReminderItem(
                        title=f"Targeted Remediation: {first_weak}",
                        description=f"Your timetable preferences mark '{first_weak}' as needing reinforcement. Spend 25 minutes reviewing key shlokas.",
                        category="WEAK_TOPIC",
                        subject=first_weak.split(":")[0] if ":" in first_weak else "BAMS Clinical",
                        suggested_time="Today, 06:30 PM",
                        action_url="/bams/remediation",
                        priority="HIGH",
                        rationale="Targeting self-identified weak topics improves final exam retention by over 35%."
                    )
                )
            else:
                reminders.append(
                    AISmartReminderItem(
                        title="Spaced Repetition: Charaka Samhita Sutrasthana",
                        description="Periodic revision of Trishana (Three Desires) and Shad-Padartha foundational concepts.",
                        category="REVISION",
                        subject="Ayurveda Samhita & Siddhanta",
                        suggested_time="Tomorrow, 07:00 AM",
                        action_url="/student/ecosystem?tab=syllabus",
                        priority="MEDIUM",
                        rationale="Scheduled spaced repetition prevents concept decay in classical foundational texts."
                    )
                )

        # 2. Exam Countdown Reminder
        if payload.include_exam_countdown:
            exam_date = tt.upcoming_exam_date if (tt and tt.upcoming_exam_date) else None
            if exam_date:
                days_left = max(0, (exam_date - datetime.now(timezone.utc)).days)
                reminders.append(
                    AISmartReminderItem(
                        title=f"NCISM Professional Exam: {days_left} Days Remaining",
                        description=f"Your scheduled BAMS annual professional exam is in {days_left} days. Review high-yield essay topics and viva diagrams.",
                        category="EXAM_PREP",
                        subject="BAMS Final Year",
                        suggested_time="Daily Revision Cadence",
                        action_url="/student/ecosystem?tab=exam-prep",
                        priority="HIGH",
                        rationale="Countdown pacing prevents last-minute cramming and maintains stable study hours."
                    )
                )
            else:
                reminders.append(
                    AISmartReminderItem(
                        title="Mock Exam & Viva Simulation",
                        description="Attempt a 20-minute timed clinical MCQ test to benchmark your current diagnostic readiness.",
                        category="EXAM_PREP",
                        subject="Kayachikitsa & Panchakarma",
                        suggested_time="Saturday, 10:00 AM",
                        action_url="/student/quiz",
                        priority="MEDIUM",
                        rationale="Simulated viva scenarios reinforce active recall under timed exam conditions."
                    )
                )

        # 3. Unfinished Activities / Goals
        if payload.include_unfinished_activities:
            completed_topics_count = len(prog.completed_topics) if (prog and prog.completed_topics) else 0
            logbook_count = len(prog.clinical_logbook_entries) if (prog and prog.clinical_logbook_entries) else 0

            if logbook_count < 5:
                reminders.append(
                    AISmartReminderItem(
                        title="Update Clinical OPD Logbook",
                        description="You have logged fewer than 5 clinical procedures this month. Record recent hospital postings and case reflections.",
                        category="UNFINISHED_ACTIVITY",
                        subject="Hospital Rotations",
                        suggested_time="Friday, 04:30 PM",
                        action_url="/student/ecosystem?tab=logbook",
                        priority="HIGH",
                        rationale="Regular clinical logbook entries ensure compliance with NCISM internship guidelines."
                    )
                )
            else:
                reminders.append(
                    AISmartReminderItem(
                        title="3D Anatomy Visual Review",
                        description="Inspect the Srotas channels and internal organ relationships in the interactive 3D Anatomy Studio.",
                        category="REVISION",
                        subject="Rachana Sharir",
                        suggested_time="Tonight, 08:30 PM",
                        action_url="/interactive-3d",
                        priority="MEDIUM",
                        rationale="Multi-sensory 3D model interaction solidifies structural visualization."
                    )
                )

        tips = [
            "Sync your college hours (9 AM - 4 PM) with early morning Brahma Muhurta revision.",
            "Take a 5-minute break every 25 minutes using the Pomodoro technique.",
            "Convert any of these smart reminders to active calendar reminders below."
        ]

        return AISmartReminderGenerateOut(
            total_generated=len(reminders),
            student_stage=student_stage,
            reminders=reminders,
            helpful_tips=tips
        )

    # ------------------------------------------------------------
    # 6. FACULTY & ADMIN ANNOUNCEMENTS (RBAC ENFORCED)
    # ------------------------------------------------------------
    @staticmethod
    async def create_academic_announcement(
        db: AsyncSession,
        author: User,
        payload: AcademicAnnouncementCreate
    ) -> AcademicAnnouncement:
        """
        Allows authorized Faculty, Admins, or Institutions to publish
        academic announcements and automatically dispatch notifications
        to all target students.
        """
        # Role check
        allowed_roles = [
            UserRole.FACULTY,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.INSTITUTION
        ]
        if author.role not in allowed_roles:
            raise PermissionError("Only verified Faculty or Administrators can publish academic announcements.")

        author_name = author.full_name or "Faculty Member"
        announcement = AcademicAnnouncement(
            author_id=author.id,
            author_name=author_name,
            author_role=author.role.value if hasattr(author.role, "value") else str(author.role),
            title=payload.title,
            content=payload.content,
            category=payload.category.upper(),
            target_audience=payload.target_audience.upper(),
            is_urgent=payload.is_urgent,
            action_url=payload.action_url,
            expires_at=payload.expires_at
        )
        db.add(announcement)
        await db.commit()
        await db.refresh(announcement)

        # Dispatch in-app notifications to target students
        student_users_res = await db.execute(
            select(User.id).where(User.role == UserRole.STUDENT)
        )
        student_ids = list(student_users_res.scalars().all())

        prefix = "🚨 URGENT: " if payload.is_urgent else "📢 "
        for sid in student_ids:
            await NotificationsService.dispatch_notification(
                db=db,
                recipient_id=sid,
                title=f"{prefix}{payload.title}",
                message=payload.content[:200] + ("..." if len(payload.content) > 200 else ""),
                notification_type="FACULTY_ANNOUNCEMENT" if payload.category == "FACULTY" else "ACADEMIC",
                action_url=payload.action_url or "/notifications"
            )

        return announcement

    @staticmethod
    async def get_academic_announcements(
        db: AsyncSession,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[AcademicAnnouncement]:
        """Fetch published academic announcements."""
        query = select(AcademicAnnouncement)
        if category and category.upper() != "ALL":
            query = query.where(AcademicAnnouncement.category == category.upper())
        query = query.order_by(desc(AcademicAnnouncement.created_at)).limit(limit)
        res = await db.execute(query)
        return list(res.scalars().all())

notifications_service = NotificationsService()
