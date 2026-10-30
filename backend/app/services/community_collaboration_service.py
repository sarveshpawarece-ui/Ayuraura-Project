import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload, joinedload
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.domain import StudentProfile, FacultyProfile
from app.models.forum import (
    ForumCategory,
    ForumPost,
    ForumComment,
    ForumPostReaction,
    ForumReport
)
from app.models.expert_guidance import (
    ExpertSession,
    SessionParticipant,
    SessionReminder
)
from app.models.camps import AppNotification
from app.models.community_collaboration import (
    DiscussionBookmark,
    FacultyQuestion,
    StudyGroup,
    StudyGroupMember,
    StudyGroupDiscussion,
    EducationalFeedback,
    CommunityModerationAction,
    UserRestriction,
    UserNotificationPreference
)
from app.schemas.community_collaboration import (
    DiscussionPostCreateIn,
    DiscussionCommentCreateIn,
    FacultyQuestionCreateIn,
    FacultyAnswerSubmitIn,
    StudyGroupCreateIn,
    StudyGroupJoinIn,
    StudyGroupResourceAddIn,
    StudyGroupDiscussionCreateIn,
    EducationalFeedbackSubmitIn,
    CommunityReportCreateIn,
    ModerationActionIn,
    UserRestrictionIn,
    NotificationPreferencesIn
)


def _to_uuid(val: Any) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


class CommunityCollaborationService:

    # ============================================================
    # NOTIFICATION DISPATCH HELPER
    # ============================================================
    @classmethod
    async def dispatch_notification(
        cls,
        db: AsyncSession,
        recipient_id: uuid.UUID,
        title: str,
        message: str,
        notification_type: str,
        action_url: Optional[str] = None
    ) -> Optional[AppNotification]:
        # Check recipient's notification preferences
        stmt = select(UserNotificationPreference).where(UserNotificationPreference.user_id == recipient_id)
        pref = (await db.execute(stmt)).scalar_one_or_none()

        if pref:
            if notification_type == "FACULTY_REPLY" and not pref.faculty_replies:
                return None
            if notification_type == "SESSION_ANNOUNCEMENT" and not pref.session_announcements:
                return None
            if notification_type == "SESSION_REMINDER" and not pref.session_reminders:
                return None
            if notification_type == "STUDY_GROUP_ACTIVITY" and not pref.study_group_activity:
                return None
            if notification_type == "DISCUSSION_REPLY" and not pref.discussion_replies:
                return None
            if notification_type == "RECORDING_AVAILABLE" and not pref.available_recordings:
                return None

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
        return notif

    # ============================================================
    # USER RESTRICTION CHECK (PHASE 6)
    # ============================================================
    @classmethod
    async def assert_not_restricted(cls, db: AsyncSession, user_id: uuid.UUID):
        stmt = select(UserRestriction).where(UserRestriction.user_id == user_id)
        restriction = (await db.execute(stmt)).scalar_one_or_none()
        if restriction and restriction.is_restricted:
            if restriction.restricted_until and restriction.restricted_until < datetime.now(timezone.utc):
                # Restriction has expired
                restriction.is_restricted = False
                await db.commit()
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Community privileges restricted: {restriction.restriction_reason}"
                )

    # ============================================================
    # PHASE 1: DISCUSSIONS & COMMUNITY
    # ============================================================
    @classmethod
    async def list_discussions(
        cls,
        db: AsyncSession,
        category_slug: Optional[str] = None,
        subject_id: Optional[str] = None,
        academic_year: Optional[str] = None,
        post_type: Optional[str] = None,
        search_query: Optional[str] = None,
        only_bookmarked: bool = False,
        current_user: Optional[User] = None
    ) -> List[Dict[str, Any]]:
        query = (
            select(ForumPost, User.email, User.role, ForumCategory.name.label("category_name"))
            .join(User, ForumPost.author_id == User.id)
            .join(ForumCategory, ForumPost.category_id == ForumCategory.id)
            .where(ForumPost.moderation_status == "PUBLISHED")
        )

        if category_slug:
            query = query.where(ForumCategory.slug == category_slug)
        if subject_id:
            query = query.where(or_(
                ForumPost.subject_id == subject_id,
                ForumPost.subject_name == subject_id,
                ForumPost.subject_name.ilike(f"%{subject_id}%")
            ))
        if academic_year:
            query = query.where(ForumPost.academic_year == academic_year)
        if post_type:
            query = query.where(ForumPost.post_type == post_type)
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.where(or_(
                ForumPost.title.ilike(term),
                ForumPost.content.ilike(term),
                ForumPost.topic.ilike(term)
            ))

        if only_bookmarked and current_user:
            query = query.join(DiscussionBookmark, and_(
                DiscussionBookmark.post_id == ForumPost.id,
                DiscussionBookmark.user_id == current_user.id
            ))

        query = query.order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc())
        results = (await db.execute(query)).all()

        user_bookmarks = set()
        user_upvotes = set()
        if current_user:
            b_stmt = select(DiscussionBookmark.post_id).where(DiscussionBookmark.user_id == current_user.id)
            user_bookmarks = set((await db.execute(b_stmt)).scalars().all())

            r_stmt = select(ForumPostReaction.post_id).where(ForumPostReaction.user_id == current_user.id)
            user_upvotes = set((await db.execute(r_stmt)).scalars().all())

        items = []
        for post, author_email, author_role, category_name in results:
            author_display = author_email.split("@")[0].replace(".", " ").title() if author_email else "Ayurvedic Scholar"
            items.append({
                "id": post.id,
                "category_id": post.category_id,
                "category_name": category_name,
                "author_id": post.author_id,
                "author_name": author_display,
                "author_role": author_role.value if hasattr(author_role, "value") else str(author_role),
                "title": post.title,
                "content": post.content,
                "subject_id": post.subject_id,
                "subject_name": post.subject_name,
                "topic": post.topic,
                "academic_year": post.academic_year,
                "post_type": post.post_type,
                "resource_url": post.resource_url,
                "tags": post.tags or [],
                "views_count": post.views_count,
                "upvotes_count": post.upvotes_count,
                "comments_count": post.comments_count,
                "bookmarks_count": post.bookmarks_count or 0,
                "is_pinned": post.is_pinned,
                "is_solved": post.is_solved,
                "is_bookmarked_by_user": post.id in user_bookmarks,
                "is_upvoted_by_user": post.id in user_upvotes,
                "ai_summary": post.ai_summary,
                "ai_followups": post.ai_followups or [],
                "created_at": post.created_at,
                "updated_at": post.updated_at
            })
        return items

    @classmethod
    async def create_discussion(
        cls,
        db: AsyncSession,
        user: User,
        data: DiscussionPostCreateIn
    ) -> Dict[str, Any]:
        await cls.assert_not_restricted(db, user.id)

        # Resolve category
        category = None
        if data.category_id:
            try:
                c_uuid = uuid.UUID(str(data.category_id))
                category = await db.get(ForumCategory, c_uuid)
            except (ValueError, TypeError):
                pass
        if not category and data.category_slug:
            stmt = select(ForumCategory).where(ForumCategory.slug == data.category_slug)
            category = (await db.execute(stmt)).scalars().first()

        if not category:
            # Fallback to first active category
            stmt = select(ForumCategory).where(ForumCategory.is_active == True).order_by(ForumCategory.display_order.asc()).limit(1)
            category = (await db.execute(stmt)).scalars().first()

        if not category:
            raise HTTPException(status_code=400, detail="No active discussion category found.")

        sub_id = data.subject_id or (data.subject_name.lower().replace(" ", "-") if data.subject_name else None)
        post = ForumPost(
            category_id=category.id,
            author_id=user.id,
            title=data.title.strip(),
            content=data.content.strip(),
            subject_id=sub_id,
            subject_name=data.subject_name,
            topic=data.topic,
            academic_year=data.academic_year or "1st Year",
            post_type=data.post_type or "DISCUSSION",
            resource_url=data.resource_url,
            tags=data.tags or [],
            moderation_status="PUBLISHED"
        )
        db.add(post)
        await db.commit()
        await db.refresh(post)

        return {
            "id": post.id,
            "category_id": post.category_id,
            "category_name": category.name,
            "author_id": post.author_id,
            "author_name": user.full_name or "Ayurvedic Scholar",
            "author_role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "title": post.title,
            "content": post.content,
            "subject_id": post.subject_id,
            "subject_name": post.subject_name,
            "topic": post.topic,
            "academic_year": post.academic_year,
            "post_type": post.post_type,
            "resource_url": post.resource_url,
            "tags": post.tags or [],
            "views_count": 0,
            "upvotes_count": 0,
            "comments_count": 0,
            "bookmarks_count": 0,
            "is_pinned": False,
            "is_solved": False,
            "is_bookmarked_by_user": False,
            "is_upvoted_by_user": False,
            "ai_summary": None,
            "ai_followups": [],
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }

    @classmethod
    async def get_discussion_detail(
        cls,
        db: AsyncSession,
        post_id: uuid.UUID,
        current_user: Optional[User] = None
    ) -> Dict[str, Any]:
        p_id = _to_uuid(post_id)
        stmt = (
            select(ForumPost, User.email, User.role, ForumCategory.name.label("category_name"))
            .join(User, ForumPost.author_id == User.id)
            .join(ForumCategory, ForumPost.category_id == ForumCategory.id)
            .where(ForumPost.id == p_id)
        )
        res = (await db.execute(stmt)).first()
        if not res:
            raise HTTPException(status_code=404, detail="Discussion post not found.")

        post, author_email, author_role, category_name = res
        author_display = author_email.split("@")[0].replace(".", " ").title() if author_email else "Ayurvedic Scholar"

        # Increment view count
        post.views_count = (post.views_count or 0) + 1
        await db.commit()

        # Fetch comments
        c_stmt = (
            select(ForumComment, User.email, User.role)
            .join(User, ForumComment.author_id == User.id)
            .where(and_(ForumComment.post_id == p_id, ForumComment.moderation_status == "PUBLISHED"))
            .order_by(ForumComment.created_at.asc())
        )
        comments_raw = (await db.execute(c_stmt)).all()

        comments = []
        for comm, c_email, c_author_role in comments_raw:
            role_str = c_author_role.value if hasattr(c_author_role, "value") else str(c_author_role)
            c_name = c_email.split("@")[0].replace(".", " ").title() if c_email else "Ayurvedic Contributor"
            comments.append({
                "id": comm.id,
                "post_id": comm.post_id,
                "author_id": comm.author_id,
                "author_name": c_name,
                "author_role": role_str,
                "content": comm.content,
                "upvotes_count": comm.upvotes_count or 0,
                "is_accepted_answer": comm.is_accepted_answer,
                "is_faculty_answer": role_str == "FACULTY",
                "created_at": comm.created_at
            })

        is_bm = False
        is_up = False
        if current_user:
            b_stmt = select(DiscussionBookmark).where(and_(
                DiscussionBookmark.post_id == p_id,
                DiscussionBookmark.user_id == current_user.id
            ))
            is_bm = (await db.execute(b_stmt)).scalar_one_or_none() is not None

            r_stmt = select(ForumPostReaction).where(and_(
                ForumPostReaction.post_id == p_id,
                ForumPostReaction.user_id == current_user.id
            ))
            is_up = (await db.execute(r_stmt)).scalar_one_or_none() is not None

        return {
            "id": post.id,
            "category_id": post.category_id,
            "category_name": category_name,
            "author_id": post.author_id,
            "author_name": author_display,
            "author_role": author_role.value if hasattr(author_role, "value") else str(author_role),
            "title": post.title,
            "content": post.content,
            "subject_id": post.subject_id,
            "subject_name": post.subject_name,
            "topic": post.topic,
            "academic_year": post.academic_year,
            "post_type": post.post_type,
            "resource_url": post.resource_url,
            "tags": post.tags or [],
            "views_count": post.views_count,
            "upvotes_count": post.upvotes_count,
            "comments_count": len(comments),
            "bookmarks_count": post.bookmarks_count or 0,
            "is_pinned": post.is_pinned,
            "is_solved": post.is_solved,
            "is_bookmarked_by_user": is_bm,
            "is_upvoted_by_user": is_up,
            "ai_summary": post.ai_summary,
            "ai_followups": post.ai_followups or [],
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "comments": comments
        }

    @classmethod
    async def add_comment(
        cls,
        db: AsyncSession,
        user: User,
        post_id: uuid.UUID,
        data: DiscussionCommentCreateIn
    ) -> Dict[str, Any]:
        await cls.assert_not_restricted(db, user.id)
        p_id = _to_uuid(post_id)
        post = await db.get(ForumPost, p_id)
        if not post:
            raise HTTPException(status_code=404, detail="Discussion post not found.")
        if post.is_locked:
            raise HTTPException(status_code=400, detail="This discussion post is locked from further replies.")

        comment = ForumComment(
            post_id=p_id,
            author_id=user.id,
            parent_comment_id=data.parent_comment_id,
            content=data.content.strip(),
            moderation_status="PUBLISHED"
        )
        db.add(comment)
        post.comments_count = (post.comments_count or 0) + 1
        await db.commit()
        await db.refresh(comment)

        # Notify post author if different user
        if post.author_id != user.id:
            await cls.dispatch_notification(
                db=db,
                recipient_id=post.author_id,
                title="New Reply on your Discussion",
                message=f"{user.full_name or 'A community member'} replied to: '{post.title[:45]}...'",
                notification_type="DISCUSSION_REPLY",
                action_url=f"/community-forum?post={str(post.id)}"
            )

        role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
        return {
            "id": comment.id,
            "post_id": comment.post_id,
            "author_id": comment.author_id,
            "author_name": user.full_name or "Ayurvedic Contributor",
            "author_role": role_str,
            "content": comment.content,
            "upvotes_count": 0,
            "is_accepted_answer": False,
            "is_faculty_answer": role_str == "FACULTY",
            "created_at": comment.created_at
        }

    @classmethod
    async def toggle_bookmark(
        cls,
        db: AsyncSession,
        user: User,
        post_id: uuid.UUID
    ) -> Dict[str, Any]:
        p_id = _to_uuid(post_id)
        post = await db.get(ForumPost, p_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found.")

        stmt = select(DiscussionBookmark).where(and_(
            DiscussionBookmark.user_id == user.id,
            DiscussionBookmark.post_id == p_id
        ))
        bm = (await db.execute(stmt)).scalar_one_or_none()

        if bm:
            await db.delete(bm)
            post.bookmarks_count = max(0, (post.bookmarks_count or 1) - 1)
            is_bm = False
        else:
            new_bm = DiscussionBookmark(user_id=user.id, post_id=p_id)
            db.add(new_bm)
            post.bookmarks_count = (post.bookmarks_count or 0) + 1
            is_bm = True

        await db.commit()
        return {
            "post_id": str(p_id),
            "is_bookmarked": is_bm,
            "bookmarks_count": post.bookmarks_count
        }

    # ============================================================
    # PHASE 2: FACULTY Q&A
    # ============================================================
    @classmethod
    async def create_faculty_question(
        cls,
        db: AsyncSession,
        student: User,
        data: FacultyQuestionCreateIn
    ) -> Dict[str, Any]:
        await cls.assert_not_restricted(db, student.id)

        # Find student's institution profile if available
        inst_id = None
        s_prof_stmt = select(StudentProfile).where(StudentProfile.user_id == student.id)
        s_prof = (await db.execute(s_prof_stmt)).scalar_one_or_none()
        if s_prof and s_prof.institution_id:
            inst_id = s_prof.institution_id

        fq = FacultyQuestion(
            student_id=student.id,
            faculty_id=data.faculty_id,
            institution_id=inst_id,
            subject_id=data.subject_id,
            subject_name=data.subject_name,
            topic=data.topic,
            academic_year=data.academic_year,
            title=data.title.strip(),
            question_text=data.question_text.strip(),
            is_anonymous_to_peers=data.is_anonymous_to_peers,
            status="OPEN"
        )
        db.add(fq)
        await db.commit()
        await db.refresh(fq)

        # Notify assigned faculty or notify institutional faculty
        if data.faculty_id:
            await cls.dispatch_notification(
                db=db,
                recipient_id=data.faculty_id,
                title="New Student Academic Question",
                message=f"Student submitted question on {data.subject_name}: '{data.title[:45]}...'",
                notification_type="FACULTY_REPLY",
                action_url="/faculty/dashboard"
            )

        student_display = "Anonymous Student" if data.is_anonymous_to_peers else (student.full_name or "BAMS Student")

        return {
            "id": fq.id,
            "student_id": fq.student_id,
            "student_display_name": student_display,
            "subject_id": fq.subject_id,
            "subject_name": fq.subject_name,
            "topic": fq.topic,
            "academic_year": fq.academic_year,
            "title": fq.title,
            "question_text": fq.question_text,
            "is_anonymous_to_peers": fq.is_anonymous_to_peers,
            "status": fq.status,
            "faculty_id": fq.faculty_id,
            "faculty_name": None,
            "faculty_answer": None,
            "answered_at": None,
            "ai_simplified_explanation": None,
            "created_at": fq.created_at,
            "updated_at": fq.updated_at
        }

    @classmethod
    async def list_faculty_questions(
        cls,
        db: AsyncSession,
        subject_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        search_query: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> List[Dict[str, Any]]:
        query = (
            select(
                FacultyQuestion,
                User.email.label("student_email"),
                User.role.label("student_role")
            )
            .join(User, FacultyQuestion.student_id == User.id)
        )

        if subject_id:
            query = query.where(FacultyQuestion.subject_id == subject_id)
        if status_filter:
            query = query.where(FacultyQuestion.status == status_filter)
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.where(or_(
                FacultyQuestion.title.ilike(term),
                FacultyQuestion.question_text.ilike(term),
                FacultyQuestion.subject_name.ilike(term),
                FacultyQuestion.topic.ilike(term)
            ))

        query = query.order_by(FacultyQuestion.created_at.desc())
        results = (await db.execute(query)).all()

        items = []
        for fq, student_email, student_role in results:
            # Privacy Protection: If anonymous to peers and viewer is not author and not faculty, mask name
            is_viewer_author = current_user and current_user.id == fq.student_id
            is_viewer_faculty = current_user and current_user.role == UserRole.FACULTY
            raw_student_name = student_email.split("@")[0].replace(".", " ").title() if student_email else "Ayurvedic Student"
            if fq.is_anonymous_to_peers and not is_viewer_author and not is_viewer_faculty:
                display_name = f"BAMS Scholar ({fq.academic_year})"
            else:
                display_name = raw_student_name

            faculty_name = None
            if fq.answered_by_user_id:
                fac_user = await db.get(User, fq.answered_by_user_id)
                if fac_user:
                    faculty_name = fac_user.full_name or "Faculty Member"

            items.append({
                "id": fq.id,
                "student_id": fq.student_id,
                "student_display_name": display_name,
                "subject_id": fq.subject_id,
                "subject_name": fq.subject_name,
                "topic": fq.topic,
                "academic_year": fq.academic_year,
                "title": fq.title,
                "question_text": fq.question_text,
                "is_anonymous_to_peers": fq.is_anonymous_to_peers,
                "status": fq.status,
                "faculty_id": fq.faculty_id,
                "faculty_name": faculty_name,
                "faculty_answer": fq.faculty_answer,
                "answered_at": fq.answered_at,
                "ai_simplified_explanation": fq.ai_simplified_explanation,
                "created_at": fq.created_at,
                "updated_at": fq.updated_at
            })
        return items

    @classmethod
    async def answer_faculty_question(
        cls,
        db: AsyncSession,
        faculty_user: User,
        question_id: uuid.UUID,
        data: FacultyAnswerSubmitIn
    ) -> Dict[str, Any]:
        if faculty_user.role != UserRole.FACULTY and faculty_user.role != UserRole.DOCTOR:
            raise HTTPException(status_code=403, detail="Only authorized faculty or doctors can answer educational questions.")

        q_id = _to_uuid(question_id)
        fq = await db.get(FacultyQuestion, q_id)
        if not fq:
            raise HTTPException(status_code=404, detail="Faculty question not found.")

        fq.faculty_answer = data.answer.strip()
        fq.answered_by_user_id = faculty_user.id
        fq.answered_at = datetime.now(timezone.utc)
        fq.status = "ANSWERED"
        fq.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(fq)

        # Send notification to the student
        await cls.dispatch_notification(
            db=db,
            recipient_id=fq.student_id,
            title="Faculty Answered Your Question",
            message=f"{faculty_user.full_name or 'Faculty'} provided an answer to: '{fq.title[:45]}...'",
            notification_type="FACULTY_REPLY",
            action_url="/community-forum?tab=qa"
        )

        return {
            "id": fq.id,
            "status": fq.status,
            "faculty_name": faculty_user.full_name or "Faculty Member",
            "faculty_answer": fq.faculty_answer,
            "answered_at": fq.answered_at
        }

    # ============================================================
    # PHASE 4: STUDENT COLLABORATION / STUDY GROUPS
    # ============================================================
    @classmethod
    async def create_study_group(
        cls,
        db: AsyncSession,
        user: User,
        data: StudyGroupCreateIn
    ) -> Dict[str, Any]:
        await cls.assert_not_restricted(db, user.id)

        group = StudyGroup(
            creator_id=user.id,
            name=data.name.strip(),
            description=data.description.strip(),
            subject_id=data.subject_id,
            subject_name=data.subject_name,
            academic_year=data.academic_year,
            topic_focus=data.topic_focus,
            max_members=data.max_members,
            is_private=data.is_private,
            passcode=data.passcode.strip() if data.passcode else None,
            resources=[]
        )
        db.add(group)
        await db.commit()
        await db.refresh(group)

        # Creator automatically joins as ADMIN member
        member = StudyGroupMember(
            group_id=group.id,
            user_id=user.id,
            role="ADMIN"
        )
        db.add(member)
        await db.commit()

        return {
            "id": group.id,
            "creator_id": group.creator_id,
            "creator_name": user.full_name or "Study Group Founder",
            "name": group.name,
            "description": group.description,
            "subject_id": group.subject_id,
            "subject_name": group.subject_name,
            "academic_year": group.academic_year,
            "topic_focus": group.topic_focus,
            "max_members": group.max_members,
            "current_members_count": 1,
            "is_private": group.is_private,
            "resources": [],
            "is_user_member": True,
            "created_at": group.created_at
        }

    @classmethod
    async def list_study_groups(
        cls,
        db: AsyncSession,
        subject_id: Optional[str] = None,
        academic_year: Optional[str] = None,
        search_query: Optional[str] = None,
        current_user: Optional[User] = None
    ) -> List[Dict[str, Any]]:
        query = (
            select(
                StudyGroup,
                User.email.label("creator_email"),
                func.count(StudyGroupMember.id).label("members_count")
            )
            .join(User, StudyGroup.creator_id == User.id)
            .outerjoin(StudyGroupMember, StudyGroup.id == StudyGroupMember.group_id)
            .group_by(StudyGroup.id, User.email)
        )

        if subject_id:
            query = query.where(StudyGroup.subject_id == subject_id)
        if academic_year:
            query = query.where(StudyGroup.academic_year == academic_year)
        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.where(or_(
                StudyGroup.name.ilike(term),
                StudyGroup.description.ilike(term),
                StudyGroup.subject_name.ilike(term),
                StudyGroup.topic_focus.ilike(term)
            ))

        query = query.order_by(StudyGroup.created_at.desc())
        results = (await db.execute(query)).all()

        user_joined_group_ids = set()
        if current_user:
            m_stmt = select(StudyGroupMember.group_id).where(StudyGroupMember.user_id == current_user.id)
            user_joined_group_ids = set((await db.execute(m_stmt)).scalars().all())

        items = []
        for group, creator_email, members_count in results:
            creator_display = creator_email.split("@")[0].replace(".", " ").title() if creator_email else "Study Group Leader"
            items.append({
                "id": group.id,
                "creator_id": group.creator_id,
                "creator_name": creator_display,
                "name": group.name,
                "description": group.description,
                "subject_id": group.subject_id,
                "subject_name": group.subject_name,
                "academic_year": group.academic_year,
                "topic_focus": group.topic_focus,
                "max_members": group.max_members,
                "current_members_count": members_count or 0,
                "is_private": group.is_private,
                "resources": group.resources or [],
                "is_user_member": group.id in user_joined_group_ids,
                "created_at": group.created_at
            })
        return items

    @classmethod
    async def join_study_group(
        cls,
        db: AsyncSession,
        user: User,
        group_id: uuid.UUID,
        passcode: Optional[str] = None
    ) -> Dict[str, Any]:
        await cls.assert_not_restricted(db, user.id)
        g_id = _to_uuid(group_id)
        group = await db.get(StudyGroup, g_id)
        if not group:
            raise HTTPException(status_code=404, detail="Study group not found.")

        # Check existing membership
        existing_stmt = select(StudyGroupMember).where(and_(
            StudyGroupMember.group_id == g_id,
            StudyGroupMember.user_id == user.id
        ))
        existing = (await db.execute(existing_stmt)).scalar_one_or_none()
        if existing:
            return {"status": "ALREADY_MEMBER", "message": "You are already a member of this study group."}

        # Check capacity
        count_stmt = select(func.count(StudyGroupMember.id)).where(StudyGroupMember.group_id == g_id)
        current_count = (await db.execute(count_stmt)).scalar_one()
        if current_count >= group.max_members:
            raise HTTPException(status_code=400, detail="This study group has reached maximum member capacity.")

        # Check passcode for private groups
        if group.is_private:
            if not passcode or passcode.strip() != group.passcode:
                raise HTTPException(status_code=400, detail="Invalid study group passcode.")

        member = StudyGroupMember(
            group_id=g_id,
            user_id=user.id,
            role="MEMBER"
        )
        db.add(member)
        await db.commit()

        # Notify group creator
        if group.creator_id != user.id:
            await cls.dispatch_notification(
                db=db,
                recipient_id=group.creator_id,
                title="New Study Group Member",
                message=f"{user.email.split('@')[0]} joined your study group: '{group.name}'",
                notification_type="STUDY_GROUP_ACTIVITY",
                action_url=f"/community-forum?tab=groups&group={str(group.id)}"
            )

        return {"status": "SUCCESS", "joined": True, "message": f"Successfully joined {group.name}!"}

    @classmethod
    async def add_group_resource(
        cls,
        db: AsyncSession,
        user: User,
        group_id: uuid.UUID,
        data: StudyGroupResourceAddIn
    ) -> Dict[str, Any]:
        g_id = _to_uuid(group_id)
        group = await db.get(StudyGroup, g_id)
        if not group:
            raise HTTPException(status_code=404, detail="Study group not found.")

        # Check membership
        m_stmt = select(StudyGroupMember).where(and_(
            StudyGroupMember.group_id == g_id,
            StudyGroupMember.user_id == user.id
        ))
        if not (await db.execute(m_stmt)).scalar_one_or_none():
            raise HTTPException(status_code=403, detail="You must be a member of this study group to share resources.")

        res_list = list(group.resources or [])
        res_list.append({
            "id": str(uuid.uuid4()),
            "title": data.title.strip(),
            "url": data.url.strip(),
            "resource_type": getattr(data, "resource_type", "NOTES") or getattr(data, "file_type", "NOTES"),
            "shared_by_name": user.email.split("@")[0].title() if user.email else "Scholar",
            "shared_at": datetime.now(timezone.utc).isoformat()
        })
        group.resources = res_list
        await db.commit()
        return {"status": "SUCCESS", "title": data.title.strip(), "resources": group.resources}

    @classmethod
    async def list_group_discussions(
        cls,
        db: AsyncSession,
        user: User,
        group_id: uuid.UUID
    ) -> List[Dict[str, Any]]:
        g_id = _to_uuid(group_id)
        stmt = (
            select(StudyGroupDiscussion, User.email)
            .join(User, StudyGroupDiscussion.author_id == User.id)
            .where(StudyGroupDiscussion.group_id == g_id)
            .order_by(StudyGroupDiscussion.created_at.asc())
        )
        results = (await db.execute(stmt)).all()
        return [
            {
                "id": d.id,
                "group_id": d.group_id,
                "author_id": d.author_id,
                "author_name": u_email.split("@")[0].replace(".", " ").title() if u_email else "Scholar",
                "title": d.title,
                "content": d.content,
                "created_at": d.created_at
            }
            for d, u_email in results
        ]

    @classmethod
    async def post_group_discussion(
        cls,
        db: AsyncSession,
        user: User,
        group_id: uuid.UUID,
        content: str,
        title: str = "Discussion"
    ) -> Dict[str, Any]:
        g_id = _to_uuid(group_id)
        group = await db.get(StudyGroup, g_id)
        if not group:
            raise HTTPException(status_code=404, detail="Study group not found.")

        disc = StudyGroupDiscussion(
            group_id=g_id,
            author_id=user.id,
            title=title.strip() if title else "Discussion",
            content=content.strip()
        )
        db.add(disc)
        await db.commit()
        await db.refresh(disc)

        return {
            "id": disc.id,
            "group_id": disc.group_id,
            "author_id": disc.author_id,
            "author_name": user.email.split("@")[0].replace(".", " ").title() if user.email else "Scholar",
            "title": disc.title,
            "content": disc.content,
            "created_at": disc.created_at
        }

    # ============================================================
    # PHASE 5: EDUCATIONAL FEEDBACK & RATINGS (ANTI-MANIPULATION)
    # ============================================================
    @classmethod
    async def submit_feedback(
        cls,
        db: AsyncSession,
        user: User,
        data: EducationalFeedbackSubmitIn
    ) -> Dict[str, Any]:
        # Validate rating scale
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be an integer between 1 and 5.")

        fb_text = getattr(data, "review_text", None) or getattr(data, "feedback_text", None) or ""
        fb_title = getattr(data, "target_title", None) or f"{data.target_type} {data.target_id}"

        # Anti-manipulation: Check existing feedback for (user_id, target_type, target_id)
        stmt = select(EducationalFeedback).where(and_(
            EducationalFeedback.user_id == user.id,
            EducationalFeedback.target_type == data.target_type,
            EducationalFeedback.target_id == data.target_id
        ))
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            # Update existing submission rather than duplicating
            existing.rating = data.rating
            existing.feedback_text = fb_text
            existing.is_public = data.is_public
            existing.target_title = fb_title
            await db.commit()
            fb = existing
            msg = "Feedback rating updated successfully."
        else:
            fb = EducationalFeedback(
                user_id=user.id,
                target_type=data.target_type,
                target_id=data.target_id,
                target_title=fb_title,
                rating=data.rating,
                feedback_text=fb_text,
                is_public=data.is_public,
                moderation_status="APPROVED"
            )
            db.add(fb)
            await db.commit()
            await db.refresh(fb)
            msg = "Educational feedback recorded successfully."

        return {
            "id": fb.id,
            "status": "RECORDED",
            "message": msg,
            "rating": fb.rating,
            "review_text": fb.feedback_text,
            "is_public": fb.is_public
        }

    @classmethod
    async def get_feedback_summary(
        cls,
        db: AsyncSession,
        target_type: str,
        target_id: str
    ) -> Dict[str, Any]:
        stmt = select(EducationalFeedback).where(and_(
            EducationalFeedback.target_type == target_type,
            EducationalFeedback.target_id == target_id,
            EducationalFeedback.moderation_status == "APPROVED"
        ))
        feedbacks = (await db.execute(stmt)).scalars().all()

        total = len(feedbacks)
        if total == 0:
            return {
                "target_type": target_type,
                "target_id": target_id,
                "average_rating": 0.0,
                "total_ratings": 0,
                "rating_breakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                "public_reviews": []
            }

        breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        sum_rating = 0
        public_reviews = []
        for fb in feedbacks:
            r = fb.rating
            breakdown[r] = breakdown.get(r, 0) + 1
            sum_rating += r
            if fb.is_public:
                u = await db.get(User, fb.user_id)
                u_name = u.email.split("@")[0].replace(".", " ").title() if u and u.email else "Ayurvedic Reviewer"
                u_role = u.role.value if u and hasattr(u.role, "value") else str(u.role) if u else "STUDENT"
                public_reviews.append({
                    "id": fb.id,
                    "user_id": fb.user_id,
                    "user_name": u_name,
                    "user_role": u_role,
                    "target_type": fb.target_type,
                    "target_id": fb.target_id,
                    "rating": fb.rating,
                    "review_text": fb.feedback_text or "",
                    "is_public": fb.is_public,
                    "created_at": fb.created_at
                })

        avg = round(sum_rating / total, 2)
        return {
            "target_type": target_type,
            "target_id": target_id,
            "average_rating": avg,
            "total_ratings": total,
            "rating_breakdown": breakdown,
            "public_reviews": public_reviews[:20]
        }

    # ============================================================
    # PHASE 6: COMMUNITY MODERATION AND SAFETY
    # ============================================================
    @classmethod
    async def create_report(
        cls,
        db: AsyncSession,
        user: User,
        data: CommunityReportCreateIn
    ) -> Dict[str, Any]:
        report = ForumReport(
            reporter_id=user.id,
            reason=data.reason,
            details=f"[{data.target_type}:{data.target_id}] {data.details or ''}",
            status="PENDING"
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)

        return {
            "id": report.id,
            "reporter_id": report.reporter_id,
            "target_type": data.target_type,
            "target_id": data.target_id,
            "reason": report.reason,
            "details": data.details,
            "status": report.status,
            "created_at": report.created_at
        }

    @classmethod
    async def execute_moderation_action(
        cls,
        db: AsyncSession,
        moderator: User,
        data: ModerationActionIn
    ) -> Dict[str, Any]:
        if moderator.role not in [UserRole.ADMIN, UserRole.INSTITUTION, UserRole.FACULTY]:
            raise HTTPException(status_code=403, detail="Authorized moderator role required.")

        act = getattr(data, "action_taken", None) or getattr(data, "action", "WARN_USER")

        # Apply action
        if data.target_type in ["POST", "DISCUSSION"]:
            try:
                post_id = _to_uuid(data.target_id)
                post = await db.get(ForumPost, post_id)
                if post:
                    if act in ["HIDE_POST", "HIDE_CONTENT"]:
                        post.moderation_status = "HIDDEN"
                    elif act in ["REMOVE_POST", "DELETE_CONTENT"]:
                        post.moderation_status = "REMOVED"
                    elif act == "DISMISS_REPORT":
                        post.moderation_status = "PUBLISHED"
            except Exception:
                pass

        elif data.target_type == "COMMENT":
            try:
                comm_id = _to_uuid(data.target_id)
                comment = await db.get(ForumComment, comm_id)
                if comment:
                    if act in ["HIDE_POST", "REMOVE_POST", "HIDE_CONTENT", "DELETE_CONTENT"]:
                        comment.moderation_status = "REMOVED"
            except Exception:
                pass

        # Record audit log
        action_log = CommunityModerationAction(
            moderator_id=moderator.id,
            action=act,
            target_type=data.target_type,
            target_id=data.target_id,
            reason=data.reason,
            notes=data.notes
        )
        db.add(action_log)
        await db.commit()
        await db.refresh(action_log)

        mod_name = moderator.email.split("@")[0].replace(".", " ").title() if moderator.email else "Academic Moderator"

        return {
            "id": action_log.id,
            "moderator_id": action_log.moderator_id,
            "moderator_name": mod_name,
            "action": act,
            "action_taken": act,
            "target_type": action_log.target_type,
            "target_id": action_log.target_id,
            "reason": action_log.reason,
            "notes": action_log.notes,
            "created_at": action_log.created_at
        }

    @classmethod
    async def restrict_user(
        cls,
        db: AsyncSession,
        moderator: User,
        data: UserRestrictionIn
    ) -> Dict[str, Any]:
        if moderator.role not in [UserRole.ADMIN, UserRole.INSTITUTION]:
            raise HTTPException(status_code=403, detail="Authorized administrator or institution role required.")

        stmt = select(UserRestriction).where(UserRestriction.user_id == data.user_id)
        existing = (await db.execute(stmt)).scalar_one_or_none()

        until = datetime.now(timezone.utc) + timedelta(days=data.restricted_days) if data.restricted_days > 0 else None

        if existing:
            existing.is_restricted = data.is_restricted
            existing.restricted_until = until
            existing.restriction_reason = data.reason
            restriction = existing
        else:
            restriction = UserRestriction(
                user_id=data.user_id,
                is_restricted=data.is_restricted,
                restricted_until=until,
                restriction_reason=data.reason
            )
            db.add(restriction)

        # Audit record
        audit = CommunityModerationAction(
            moderator_id=moderator.id,
            action="RESTRICT_USER" if data.is_restricted else "UNRESTRICT_USER",
            target_type="USER",
            target_id=str(data.user_id),
            reason=data.reason,
            notes=f"Restricted for {data.restricted_days} days."
        )
        db.add(audit)
        await db.commit()

        return {
            "user_id": str(data.user_id),
            "is_restricted": restriction.is_restricted,
            "restricted_until": restriction.restricted_until,
            "reason": restriction.restriction_reason
        }

    # ============================================================
    # PHASE 8: NOTIFICATIONS & PREFERENCES
    # ============================================================
    @classmethod
    async def get_user_notifications(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 50
    ) -> Dict[str, Any]:
        stmt = (
            select(AppNotification)
            .where(AppNotification.recipient_id == user_id)
            .order_by(AppNotification.created_at.desc())
            .limit(limit)
        )
        notifs = (await db.execute(stmt)).scalars().all()
        unread_count = sum(1 for n in notifs if not n.is_read)

        return {
            "unread_count": unread_count,
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "notification_type": n.notification_type,
                    "action_url": n.action_url,
                    "is_read": n.is_read,
                    "created_at": n.created_at
                }
                for n in notifs
            ]
        }

    @classmethod
    async def mark_notification_read(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        notification_id: uuid.UUID
    ) -> Dict[str, Any]:
        n_id = _to_uuid(notification_id)
        notif = await db.get(AppNotification, n_id)
        if not notif or notif.recipient_id != user_id:
            raise HTTPException(status_code=404, detail="Notification not found.")

        notif.is_read = True
        notif.read_at = datetime.now(timezone.utc)
        await db.commit()
        return {"id": str(notif.id), "is_read": True}

    @classmethod
    async def mark_all_notifications_read(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        stmt = select(AppNotification).where(and_(
            AppNotification.recipient_id == user_id,
            AppNotification.is_read == False
        ))
        notifs = (await db.execute(stmt)).scalars().all()
        now = datetime.now(timezone.utc)
        for n in notifs:
            n.is_read = True
            n.read_at = now
        await db.commit()
        return {"status": "SUCCESS", "marked_read_count": len(notifs)}

    @classmethod
    async def get_notification_preferences(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        stmt = select(UserNotificationPreference).where(UserNotificationPreference.user_id == user_id)
        pref = (await db.execute(stmt)).scalar_one_or_none()

        if not pref:
            pref = UserNotificationPreference(user_id=user_id)
            db.add(pref)
            await db.commit()
            await db.refresh(pref)

        return {
            "id": pref.id,
            "user_id": pref.user_id,
            "notify_faculty_replies": pref.faculty_replies,
            "notify_session_announcements": pref.session_announcements,
            "notify_session_reminders": pref.session_reminders,
            "notify_study_group_activity": pref.study_group_activity,
            "notify_discussion_replies": pref.discussion_replies,
            "notify_recordings_available": pref.available_recordings,
            "faculty_replies": pref.faculty_replies,
            "session_announcements": pref.session_announcements,
            "session_reminders": pref.session_reminders,
            "study_group_activity": pref.study_group_activity,
            "discussion_replies": pref.discussion_replies,
            "available_recordings": pref.available_recordings,
            "updated_at": pref.updated_at
        }

    @classmethod
    async def update_notification_preferences(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        data: NotificationPreferencesIn
    ) -> Dict[str, Any]:
        stmt = select(UserNotificationPreference).where(UserNotificationPreference.user_id == user_id)
        pref = (await db.execute(stmt)).scalar_one_or_none()

        if not pref:
            pref = UserNotificationPreference(user_id=user_id)
            db.add(pref)

        def get_val(attr1, attr2):
            v1 = getattr(data, attr1, None)
            if v1 is not None:
                return v1
            return getattr(data, attr2, None)

        val = get_val("notify_faculty_replies", "faculty_replies")
        if val is not None:
            pref.faculty_replies = val

        val = get_val("notify_session_announcements", "session_announcements")
        if val is not None:
            pref.session_announcements = val

        val = get_val("notify_session_reminders", "session_reminders")
        if val is not None:
            pref.session_reminders = val

        val = get_val("notify_study_group_activity", "study_group_activity")
        if val is not None:
            pref.study_group_activity = val

        val = get_val("notify_discussion_replies", "discussion_replies")
        if val is not None:
            pref.discussion_replies = val

        val = get_val("notify_recordings_available", "available_recordings")
        if val is not None:
            pref.available_recordings = val

        pref.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(pref)

        return {
            "id": pref.id,
            "user_id": pref.user_id,
            "notify_faculty_replies": pref.faculty_replies,
            "notify_session_announcements": pref.session_announcements,
            "notify_session_reminders": pref.session_reminders,
            "notify_study_group_activity": pref.study_group_activity,
            "notify_discussion_replies": pref.discussion_replies,
            "notify_recordings_available": pref.available_recordings,
            "faculty_replies": pref.faculty_replies,
            "session_announcements": pref.session_announcements,
            "session_reminders": pref.session_reminders,
            "study_group_activity": pref.study_group_activity,
            "discussion_replies": pref.discussion_replies,
            "available_recordings": pref.available_recordings,
            "updated_at": pref.updated_at
        }
