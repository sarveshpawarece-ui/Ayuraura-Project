import uuid
from typing import List, Optional
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_user, RoleChecker
from app.models.user import User, UserRole
from app.models.expert_guidance import (
    SessionType,
    SessionLevel,
    SessionStatus,
    SessionVisibility,
    ExpertProfile,
    ExpertSession,
    SessionParticipant,
    SessionRating,
    ExpertFollow,
    SessionQuestion,
    SessionReminder
)
from app.models.camps import AppNotification
from app.schemas.expert_guidance import (
    ExpertProfileCreate,
    ExpertProfileResponse,
    SessionCreateRequest,
    RecordedSessionUploadRequest,
    SessionStatusUpdateRequest,
    SessionResponse,
    SessionRatingCreate,
    SessionRatingResponse,
    QuestionCreate,
    AnswerCreate,
    QuestionResponse,
    DiscoveryFeedResponse
)
from app.services.expert_recommendation import (
    ExpertRecommendationService,
    compute_bayesian_rating
)

router = APIRouter(prefix="/guidance", tags=["Expert Guidance & Live Sessions"])


# ============================================================
# HELPER: SERIALIZE SESSION RESPONSE
# ============================================================

def format_session_response(
    session: ExpertSession,
    user_id: Optional[uuid.UUID] = None,
    participation_map: Optional[dict] = None,
    ratings_map: Optional[dict] = None,
    reasons: Optional[List[str]] = None
) -> SessionResponse:
    part = participation_map.get(session.id) if participation_map else None
    has_rated = bool(ratings_map.get(session.id)) if ratings_map else False

    is_registered = bool(part)
    has_attended_live = bool(part and part.attended_live)
    has_watched_recording = bool(part and part.watched_recording)
    # Eligible to rate if attended live, watched recording, or session completed & student registered
    is_eligible = bool(part and (part.attended_live or part.watched_recording or session.status == SessionStatus.COMPLETED))

    return SessionResponse(
        id=session.id,
        expert_user_id=session.expert_user_id,
        expert_profile_id=session.expert_profile_id,
        expert_name=session.expert_name,
        expert_role=session.expert_role,
        institution=session.institution,
        title=session.title,
        description=session.description,
        session_type=session.session_type,
        category=session.category,
        topics=session.topics or [],
        level=session.level,
        scheduled_date=session.scheduled_date,
        start_time=session.start_time,
        end_time=session.end_time,
        duration_minutes=session.duration_minutes,
        max_students=session.max_students,
        language=session.language,
        session_thumbnail=session.session_thumbnail,
        learning_objectives=session.learning_objectives or [],
        prerequisites=session.prerequisites or [],
        tags=session.tags or [],
        visibility=session.visibility,
        status=session.status,
        live_stream_url=session.live_stream_url,
        current_live_attendees=session.current_live_attendees,
        recording_available=session.recording_available,
        recording_url=session.recording_url,
        recording_duration=session.recording_duration,
        recording_views_count=session.recording_views_count,
        average_rating=round(session.average_rating or 0.0, 1),
        total_ratings=session.total_ratings or 0,
        participants_count=session.participants_count or 0,
        is_registered=is_registered,
        has_attended_live=has_attended_live,
        has_watched_recording=has_watched_recording,
        has_rated=has_rated,
        is_eligible_to_rate=is_eligible and not has_rated,
        recommendation_reasons=reasons or [],
        created_at=session.created_at
    )


# ============================================================
# 1. DISCOVERY FEED (Multi-Factor Personalized Hub)
# ============================================================

@router.get("/sessions/discovery", response_model=DiscoveryFeedResponse)
async def get_session_discovery_feed(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns personalized feeds: Live Now, Recommended, Upcoming, Recently Recorded,
    Top Rated Experts, and Followed Experts Sessions.
    """
    student_id = current_user.id

    # 1. Fetch Student Signals & Context
    signals = await ExpertRecommendationService.get_student_signals(db, student_id)

    # 2. Fetch Active Experts
    experts_res = await db.execute(select(ExpertProfile))
    all_experts = experts_res.scalars().all()
    expert_map = {e.user_id: e for e in all_experts}

    # 3. Fetch User Participations & Ratings for Quick Status
    part_res = await db.execute(
        select(SessionParticipant).where(SessionParticipant.student_user_id == student_id)
    )
    part_map = {p.session_id: p for p in part_res.scalars().all()}

    ratings_res = await db.execute(
        select(SessionRating.session_id).where(SessionRating.student_user_id == student_id)
    )
    rated_set = set(ratings_res.scalars().all())

    # 4. Fetch All Sessions
    sessions_res = await db.execute(
        select(ExpertSession)
        .where(ExpertSession.status != SessionStatus.CANCELLED)
        .order_by(desc(ExpertSession.scheduled_date))
    )
    all_sessions = sessions_res.scalars().all()

    # 5. Score & Rank All Sessions
    scored_sessions = []
    for sess in all_sessions:
        score_info = ExpertRecommendationService.score_session(sess, signals, expert_map)
        scored_sessions.append((sess, score_info["score"], score_info["reasons"]))

    scored_sessions.sort(key=lambda x: x[1], reverse=True)

    # Buckets
    live_now = []
    recommended = []
    upcoming = []
    recorded = []
    followed_sessions = []
    career_aligned = []

    for sess, score, reasons in scored_sessions:
        formatted = format_session_response(sess, student_id, part_map, rated_set, reasons)

        if sess.status == SessionStatus.LIVE:
            live_now.append(formatted)
        elif sess.status == SessionStatus.SCHEDULED:
            upcoming.append(formatted)
        elif sess.status == SessionStatus.COMPLETED and sess.recording_available:
            recorded.append(formatted)

        if sess.expert_user_id in signals["followed_expert_ids"]:
            followed_sessions.append(formatted)

        if any("career" in r.lower() or "target" in r.lower() for r in reasons):
            career_aligned.append(formatted)

        # General Recommended (top scoring across all statuses)
        if len(recommended) < 8:
            recommended.append(formatted)

    # 6. Score & Rank Top Experts
    scored_experts = []
    for exp in all_experts:
        exp_score_info = ExpertRecommendationService.score_expert(exp, signals)
        scored_experts.append((exp, exp_score_info["score"]))

    scored_experts.sort(key=lambda x: x[1], reverse=True)

    top_expert_responses = []
    for exp, sc in scored_experts[:6]:
        is_following = exp.user_id in signals["followed_expert_ids"]
        top_expert_responses.append(
            ExpertProfileResponse(
                id=exp.id,
                user_id=exp.user_id,
                full_name=exp.full_name,
                role=exp.role.value if hasattr(exp.role, 'value') else str(exp.role),
                professional_title=exp.professional_title,
                institution_or_clinic=exp.institution_or_clinic,
                qualifications=exp.qualifications,
                specialization=exp.specialization,
                areas_of_expertise=exp.areas_of_expertise or [],
                subjects=exp.subjects or [],
                skills=exp.skills or [],
                languages=exp.languages or [],
                years_of_experience=exp.years_of_experience,
                bio=exp.bio,
                profile_photo_url=exp.profile_photo_url,
                is_verified=exp.is_verified,
                verification_badge_title=exp.verification_badge_title,
                average_rating=round(exp.average_rating or 5.0, 1),
                total_ratings=exp.total_ratings or 0,
                completed_sessions_count=exp.completed_sessions_count or 0,
                total_sessions_count=exp.total_sessions_count or 0,
                followers_count=exp.followers_count or 0,
                bayesian_score=round(compute_bayesian_rating(exp.average_rating, exp.total_ratings), 2),
                is_following=is_following,
                created_at=exp.created_at
            )
        )

    popular_topics = [
        "Panchakarma Detox Protocols",
        "Dravyaguna Herbal Pharmacology",
        "Nadi Pariksha & Pulse Diagnosis",
        "Kayachikitsa Chronic Disease Care",
        "Rasashastra & Bhasma Standardization",
        "Shalya Tantra Ksharsutra Protocols",
        "Clinical Research in Ayurveda"
    ]

    return DiscoveryFeedResponse(
        live_now=live_now,
        recommended_sessions=recommended,
        upcoming_sessions=upcoming[:10],
        recently_recorded=recorded[:10],
        top_experts=top_expert_responses,
        followed_experts_sessions=followed_sessions[:6],
        career_aligned_sessions=career_aligned[:6],
        popular_topics=popular_topics
    )


# ============================================================
# 2. SESSION LISTING & SEARCH
# ============================================================

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(
    category: Optional[str] = None,
    level: Optional[SessionLevel] = None,
    session_type: Optional[SessionType] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter sessions by category, difficulty level, session type, status, and keywords.
    """
    query = select(ExpertSession).order_by(desc(ExpertSession.scheduled_date))

    if category and category.upper() != "ALL":
        query = query.where(ExpertSession.category.ilike(f"%{category}%"))
    if level:
        query = query.where(ExpertSession.level == level)
    if session_type:
        query = query.where(ExpertSession.session_type == session_type)
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(ExpertSession.status == status_filter.upper())
    if search:
        s_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                ExpertSession.title.ilike(s_term),
                ExpertSession.description.ilike(s_term),
                ExpertSession.expert_name.ilike(s_term),
                ExpertSession.category.ilike(s_term)
            )
        )

    res = await db.execute(query)
    sessions = res.scalars().all()

    # User context
    part_res = await db.execute(
        select(SessionParticipant).where(SessionParticipant.student_user_id == current_user.id)
    )
    part_map = {p.session_id: p for p in part_res.scalars().all()}

    ratings_res = await db.execute(
        select(SessionRating.session_id).where(SessionRating.student_user_id == current_user.id)
    )
    rated_set = set(ratings_res.scalars().all())

    return [format_session_response(s, current_user.id, part_map, rated_set) for s in sessions]


# ============================================================
# 3. SESSION DETAILS
# ============================================================

@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session_details(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    part_res = await db.execute(
        select(SessionParticipant).where(
            SessionParticipant.session_id == session_id,
            SessionParticipant.student_user_id == current_user.id
        )
    )
    part = part_res.scalars().first()
    part_map = {session_id: part} if part else {}

    rating_res = await db.execute(
        select(SessionRating).where(
            SessionRating.session_id == session_id,
            SessionRating.student_user_id == current_user.id
        )
    )
    rated_set = {session_id} if rating_res.scalars().first() else set()

    return format_session_response(session, current_user.id, part_map, rated_set)


# ============================================================
# 4. SESSION CREATION & UPLOAD (DOCTOR / FACULTY)
# ============================================================

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    payload: SessionCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Doctors and Faculty create upcoming live lectures, mentorships, workshops, etc.
    """
    if current_user.role not in [UserRole.DOCTOR, UserRole.FACULTY, UserRole.ADMIN, UserRole.INSTITUTION]:
        raise HTTPException(status_code=403, detail="Only Doctors and Faculty can create sessions")

    # Get or create expert profile
    exp_res = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == current_user.id))
    expert_prof = exp_res.scalars().first()

    expert_name = expert_prof.full_name if expert_prof else current_user.email
    institution = expert_prof.institution_or_clinic if expert_prof else "AyurSetu Academy"

    session = ExpertSession(
        expert_user_id=current_user.id,
        expert_profile_id=expert_prof.id if expert_prof else None,
        expert_name=expert_name,
        expert_role=current_user.role.value,
        institution=institution,
        title=payload.title,
        description=payload.description,
        session_type=payload.session_type,
        category=payload.category,
        topics=payload.topics,
        level=payload.level,
        scheduled_date=payload.scheduled_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        duration_minutes=payload.duration_minutes,
        max_students=payload.max_students,
        language=payload.language,
        session_thumbnail=payload.session_thumbnail or "/assets/session-thumb-default.jpg",
        learning_objectives=payload.learning_objectives,
        prerequisites=payload.prerequisites,
        tags=payload.tags,
        visibility=payload.visibility,
        status=SessionStatus.SCHEDULED,
        recording_available=payload.recording_available,
        live_stream_url=payload.live_stream_url or "https://meet.google.com/ayu-live-stream"
    )

    db.add(session)

    if expert_prof:
        expert_prof.total_sessions_count = (expert_prof.total_sessions_count or 0) + 1

    await db.commit()
    await db.refresh(session)

    # Notify followers of the expert
    if expert_prof:
        follows_res = await db.execute(select(ExpertFollow).where(ExpertFollow.expert_user_id == current_user.id))
        followers = follows_res.scalars().all()
        for f in followers:
            notif = AppNotification(
                user_id=f.student_user_id,
                title=f"New Session by {expert_name}",
                message=f"{expert_name} scheduled a new session: '{session.title}' on {session.scheduled_date}.",
                notification_type="SESSION_ANNOUNCEMENT"
            )
            db.add(notif)
        await db.commit()

    return format_session_response(session, current_user.id)


@router.post("/sessions/upload-recorded", response_model=SessionResponse)
async def upload_recorded_session(
    payload: RecordedSessionUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Doctors and Faculty upload an existing recorded clinical lecture.
    """
    if current_user.role not in [UserRole.DOCTOR, UserRole.FACULTY, UserRole.ADMIN, UserRole.INSTITUTION]:
        raise HTTPException(status_code=403, detail="Only Doctors and Faculty can upload recorded sessions")

    exp_res = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == current_user.id))
    expert_prof = exp_res.scalars().first()

    expert_name = expert_prof.full_name if expert_prof else current_user.email
    institution = expert_prof.institution_or_clinic if expert_prof else "AyurSetu Academy"

    session = ExpertSession(
        expert_user_id=current_user.id,
        expert_profile_id=expert_prof.id if expert_prof else None,
        expert_name=expert_name,
        expert_role=current_user.role.value,
        institution=institution,
        title=payload.title,
        description=payload.description,
        session_type=SessionType.RECORDED_LECTURE,
        category=payload.category,
        topics=payload.topics,
        level=payload.level,
        scheduled_date=date.today(),
        start_time="On Demand",
        duration_minutes=payload.duration_minutes,
        language=payload.language,
        session_thumbnail=payload.session_thumbnail or "/assets/session-thumb-default.jpg",
        learning_objectives=payload.learning_objectives,
        prerequisites=payload.prerequisites,
        tags=payload.tags,
        visibility=payload.visibility,
        status=SessionStatus.COMPLETED,
        recording_available=True,
        recording_url=payload.video_url,
        recording_duration=payload.duration_minutes * 60,
        recording_uploaded_at=datetime.now(timezone.utc)
    )

    db.add(session)

    if expert_prof:
        expert_prof.total_sessions_count = (expert_prof.total_sessions_count or 0) + 1
        expert_prof.completed_sessions_count = (expert_prof.completed_sessions_count or 0) + 1

    await db.commit()
    await db.refresh(session)
    return format_session_response(session, current_user.id)


# ============================================================
# 5. LIVE SESSION STATUS CONTROLS (START / END LIVE)
# ============================================================

@router.put("/sessions/{session_id}/status", response_model=SessionResponse)
async def update_session_status(
    session_id: uuid.UUID,
    payload: SessionStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.expert_user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to manage this session")

    old_status = session.status
    session.status = payload.status

    if payload.live_stream_url:
        session.live_stream_url = payload.live_stream_url
    if payload.recording_url:
        session.recording_url = payload.recording_url
    if payload.recording_available is not None:
        session.recording_available = payload.recording_available

    # Transition to LIVE
    if payload.status == SessionStatus.LIVE and old_status != SessionStatus.LIVE:
        session.started_at = datetime.now(timezone.utc)

    # Transition to COMPLETED
    if payload.status == SessionStatus.COMPLETED and old_status != SessionStatus.COMPLETED:
        session.ended_at = datetime.now(timezone.utc)
        if session.recording_available and not session.recording_url:
            session.recording_url = "https://www.w3schools.com/html/mov_bbb.mp4"  # Default video demo stream
            session.recording_duration = session.duration_minutes * 60
            session.recording_uploaded_at = datetime.now(timezone.utc)

        # Update expert profile completed count
        if session.expert_profile_id:
            exp_res = await db.execute(select(ExpertProfile).where(ExpertProfile.id == session.expert_profile_id))
            expert_prof = exp_res.scalars().first()
            if expert_prof:
                expert_prof.completed_sessions_count = (expert_prof.completed_sessions_count or 0) + 1

    await db.commit()
    await db.refresh(session)
    return format_session_response(session, current_user.id)


# ============================================================
# 6. STUDENT ACTIONS: REGISTER / JOIN LIVE / WATCH RECORDING
# ============================================================

@router.post("/sessions/{session_id}/register", response_model=SessionResponse)
async def register_for_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    part_res = await db.execute(
        select(SessionParticipant).where(
            SessionParticipant.session_id == session_id,
            SessionParticipant.student_user_id == current_user.id
        )
    )
    participant = part_res.scalars().first()

    if not participant:
        participant = SessionParticipant(
            session_id=session_id,
            student_user_id=current_user.id,
            student_name=current_user.email,
            student_email=current_user.email
        )
        db.add(participant)
        session.participants_count = (session.participants_count or 0) + 1
        await db.commit()

    part_map = {session_id: participant}
    return format_session_response(session, current_user.id, part_map)


@router.post("/sessions/{session_id}/join-live", response_model=SessionResponse)
async def join_live_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    part_res = await db.execute(
        select(SessionParticipant).where(
            SessionParticipant.session_id == session_id,
            SessionParticipant.student_user_id == current_user.id
        )
    )
    participant = part_res.scalars().first()

    if not participant:
        participant = SessionParticipant(
            session_id=session_id,
            student_user_id=current_user.id,
            student_name=current_user.email,
            student_email=current_user.email,
            attended_live=True,
            live_joined_at=datetime.now(timezone.utc),
            is_eligible_to_rate=True
        )
        db.add(participant)
        session.participants_count = (session.participants_count or 0) + 1
    else:
        participant.attended_live = True
        participant.live_joined_at = datetime.now(timezone.utc)
        participant.is_eligible_to_rate = True

    session.current_live_attendees = max(1, (session.current_live_attendees or 0) + 1)
    await db.commit()

    part_map = {session_id: participant}
    return format_session_response(session, current_user.id, part_map)


@router.post("/sessions/{session_id}/watch-recording", response_model=SessionResponse)
async def watch_session_recording(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.recording_available:
        raise HTTPException(status_code=400, detail="Recording is not available for this session")

    session.recording_views_count = (session.recording_views_count or 0) + 1

    part_res = await db.execute(
        select(SessionParticipant).where(
            SessionParticipant.session_id == session_id,
            SessionParticipant.student_user_id == current_user.id
        )
    )
    participant = part_res.scalars().first()

    if not participant:
        participant = SessionParticipant(
            session_id=session_id,
            student_user_id=current_user.id,
            student_name=current_user.email,
            student_email=current_user.email,
            watched_recording=True,
            is_eligible_to_rate=True
        )
        db.add(participant)
    else:
        participant.watched_recording = True
        participant.is_eligible_to_rate = True

    await db.commit()
    part_map = {session_id: participant}
    return format_session_response(session, current_user.id, part_map)


# ============================================================
# 7. MULTI-CATEGORY SESSION RATING & EXPERT RECALCULATION
# ============================================================

@router.post("/sessions/{session_id}/rate", response_model=SessionRatingResponse)
async def submit_session_rating(
    session_id: uuid.UUID,
    payload: SessionRatingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a multi-dimensional rating for a completed session.
    Enforces 1 rating per student and recalculates the expert's aggregate and Bayesian score.
    """
    res = await db.execute(select(ExpertSession).where(ExpertSession.id == session_id))
    session = res.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check existing rating
    rating_res = await db.execute(
        select(SessionRating).where(
            SessionRating.session_id == session_id,
            SessionRating.student_user_id == current_user.id
        )
    )
    rating = rating_res.scalars().first()

    if rating:
        # Update existing rating
        rating.overall_rating = payload.overall_rating
        rating.rating_knowledge = payload.rating_knowledge
        rating.rating_teaching_quality = payload.rating_teaching_quality
        rating.rating_clarity = payload.rating_clarity
        rating.rating_practical_value = payload.rating_practical_value
        rating.rating_engagement = payload.rating_engagement
        rating.rating_usefulness = payload.rating_usefulness
        rating.review_text = payload.review_text
    else:
        rating = SessionRating(
            session_id=session_id,
            expert_user_id=session.expert_user_id,
            student_user_id=current_user.id,
            student_name=current_user.email,
            overall_rating=payload.overall_rating,
            rating_knowledge=payload.rating_knowledge,
            rating_teaching_quality=payload.rating_teaching_quality,
            rating_clarity=payload.rating_clarity,
            rating_practical_value=payload.rating_practical_value,
            rating_engagement=payload.rating_engagement,
            rating_usefulness=payload.rating_usefulness,
            review_text=payload.review_text
        )
        db.add(rating)

    await db.flush()

    # 1. Recalculate Session Average Rating
    all_sess_ratings_res = await db.execute(
        select(func.avg(SessionRating.overall_rating), func.count(SessionRating.id))
        .where(SessionRating.session_id == session_id)
    )
    avg_sess_rating, count_sess_rating = all_sess_ratings_res.first()
    session.average_rating = float(avg_sess_rating or payload.overall_rating)
    session.total_ratings = int(count_sess_rating or 1)

    # 2. Recalculate Expert Profile Aggregates & Bayesian Score
    exp_res = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == session.expert_user_id))
    expert_prof = exp_res.scalars().first()

    if expert_prof:
        all_exp_ratings_res = await db.execute(
            select(func.avg(SessionRating.overall_rating), func.count(SessionRating.id))
            .where(SessionRating.expert_user_id == session.expert_user_id)
        )
        exp_avg, exp_cnt = all_exp_ratings_res.first()
        expert_prof.average_rating = float(exp_avg or payload.overall_rating)
        expert_prof.total_ratings = int(exp_cnt or 1)
        expert_prof.bayesian_score = compute_bayesian_rating(expert_prof.average_rating, expert_prof.total_ratings)

    await db.commit()
    await db.refresh(rating)

    return SessionRatingResponse(
        id=rating.id,
        session_id=rating.session_id,
        expert_user_id=rating.expert_user_id,
        student_user_id=rating.student_user_id,
        student_name=rating.student_name,
        overall_rating=rating.overall_rating,
        rating_knowledge=rating.rating_knowledge,
        rating_teaching_quality=rating.rating_teaching_quality,
        rating_clarity=rating.rating_clarity,
        rating_practical_value=rating.rating_practical_value,
        rating_engagement=rating.rating_engagement,
        rating_usefulness=rating.rating_usefulness,
        review_text=rating.review_text,
        created_at=rating.created_at
    )


@router.get("/sessions/{session_id}/ratings", response_model=List[SessionRatingResponse])
async def get_session_ratings(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(SessionRating)
        .where(SessionRating.session_id == session_id)
        .order_by(desc(SessionRating.created_at))
    )
    ratings = res.scalars().all()
    return [
        SessionRatingResponse(
            id=r.id,
            session_id=r.session_id,
            expert_user_id=r.expert_user_id,
            student_user_id=r.student_user_id,
            student_name=r.student_name,
            overall_rating=r.overall_rating,
            rating_knowledge=r.rating_knowledge,
            rating_teaching_quality=r.rating_teaching_quality,
            rating_clarity=r.rating_clarity,
            rating_practical_value=r.rating_practical_value,
            rating_engagement=r.rating_engagement,
            rating_usefulness=r.rating_usefulness,
            review_text=r.review_text,
            created_at=r.created_at
        )
        for r in ratings
    ]


# ============================================================
# 8. EXPERT FOLLOWING & PROFILE DETAILS
# ============================================================

@router.get("/experts", response_model=List[ExpertProfileResponse])
async def list_experts(
    expertise: Optional[str] = None,
    search: Optional[str] = None,
    min_rating: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(ExpertProfile).order_by(desc(ExpertProfile.bayesian_score))

    if search:
        s_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                ExpertProfile.full_name.ilike(s_term),
                ExpertProfile.specialization.ilike(s_term),
                ExpertProfile.institution_or_clinic.ilike(s_term)
            )
        )

    res = await db.execute(query)
    experts = res.scalars().all()

    # Filter in Python for JSON areas_of_expertise and min_rating
    filtered = []
    for e in experts:
        if expertise and expertise.upper() != "ALL":
            exp_terms = [e.specialization.lower()] + [a.lower() for a in (e.areas_of_expertise or [])]
            if not any(expertise.lower() in t for t in exp_terms):
                continue
        if min_rating and (e.average_rating or 0) < min_rating:
            continue
        filtered.append(e)

    # Check follow state
    follows_res = await db.execute(
        select(ExpertFollow.expert_user_id).where(ExpertFollow.student_user_id == current_user.id)
    )
    followed_set = set(follows_res.scalars().all())

    return [
        ExpertProfileResponse(
            id=e.id,
            user_id=e.user_id,
            full_name=e.full_name,
            role=e.role.value if hasattr(e.role, 'value') else str(e.role),
            professional_title=e.professional_title,
            institution_or_clinic=e.institution_or_clinic,
            qualifications=e.qualifications,
            specialization=e.specialization,
            areas_of_expertise=e.areas_of_expertise or [],
            subjects=e.subjects or [],
            skills=e.skills or [],
            languages=e.languages or [],
            years_of_experience=e.years_of_experience,
            bio=e.bio,
            profile_photo_url=e.profile_photo_url,
            is_verified=e.is_verified,
            verification_badge_title=e.verification_badge_title,
            average_rating=round(e.average_rating or 5.0, 1),
            total_ratings=e.total_ratings or 0,
            completed_sessions_count=e.completed_sessions_count or 0,
            total_sessions_count=e.total_sessions_count or 0,
            followers_count=e.followers_count or 0,
            bayesian_score=round(compute_bayesian_rating(e.average_rating, e.total_ratings), 2),
            is_following=e.user_id in followed_set,
            created_at=e.created_at
        )
        for e in filtered
    ]


@router.get("/experts/{expert_id}", response_model=ExpertProfileResponse)
async def get_expert_profile(
    expert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check by ExpertProfile.id or User.id
    res = await db.execute(
        select(ExpertProfile).where(
            or_(ExpertProfile.id == expert_id, ExpertProfile.user_id == expert_id)
        )
    )
    e = res.scalars().first()
    if not e:
        raise HTTPException(status_code=404, detail="Expert profile not found")

    follows_res = await db.execute(
        select(ExpertFollow).where(
            ExpertFollow.expert_user_id == e.user_id,
            ExpertFollow.student_user_id == current_user.id
        )
    )
    is_following = bool(follows_res.scalars().first())

    return ExpertProfileResponse(
        id=e.id,
        user_id=e.user_id,
        full_name=e.full_name,
        role=e.role.value if hasattr(e.role, 'value') else str(e.role),
        professional_title=e.professional_title,
        institution_or_clinic=e.institution_or_clinic,
        qualifications=e.qualifications,
        specialization=e.specialization,
        areas_of_expertise=e.areas_of_expertise or [],
        subjects=e.subjects or [],
        skills=e.skills or [],
        languages=e.languages or [],
        years_of_experience=e.years_of_experience,
        bio=e.bio,
        profile_photo_url=e.profile_photo_url,
        is_verified=e.is_verified,
        verification_badge_title=e.verification_badge_title,
        average_rating=round(e.average_rating or 5.0, 1),
        total_ratings=e.total_ratings or 0,
        completed_sessions_count=e.completed_sessions_count or 0,
        total_sessions_count=e.total_sessions_count or 0,
        followers_count=e.followers_count or 0,
        bayesian_score=round(compute_bayesian_rating(e.average_rating, e.total_ratings), 2),
        is_following=is_following,
        created_at=e.created_at
    )


@router.post("/experts/{expert_id}/follow")
async def toggle_follow_expert(
    expert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle follow/unfollow for an expert. Updates followers count and returns new state.
    """
    res = await db.execute(
        select(ExpertProfile).where(
            or_(ExpertProfile.id == expert_id, ExpertProfile.user_id == expert_id)
        )
    )
    expert = res.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert profile not found")

    follows_res = await db.execute(
        select(ExpertFollow).where(
            ExpertFollow.expert_user_id == expert.user_id,
            ExpertFollow.student_user_id == current_user.id
        )
    )
    follow_rec = follows_res.scalars().first()

    if follow_rec:
        await db.delete(follow_rec)
        expert.followers_count = max(0, (expert.followers_count or 1) - 1)
        is_following = False
        msg = f"You unfollowed {expert.full_name}"
    else:
        new_follow = ExpertFollow(
            student_user_id=current_user.id,
            expert_user_id=expert.user_id,
            expert_profile_id=expert.id
        )
        db.add(new_follow)
        expert.followers_count = (expert.followers_count or 0) + 1
        is_following = True
        msg = f"You are now following {expert.full_name}"

    await db.commit()
    return {
        "is_following": is_following,
        "followers_count": expert.followers_count,
        "message": msg
    }


# ============================================================
# 9. Q&A AND REAL-TIME QUESTIONS
# ============================================================

@router.get("/sessions/{session_id}/questions", response_model=List[QuestionResponse])
async def get_session_questions(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(SessionQuestion)
        .where(SessionQuestion.session_id == session_id)
        .order_by(desc(SessionQuestion.upvotes_count), desc(SessionQuestion.created_at))
    )
    questions = res.scalars().all()
    return [
        QuestionResponse(
            id=q.id,
            session_id=q.session_id,
            user_id=q.user_id,
            user_name=q.user_name,
            user_role=q.user_role,
            question_text=q.question_text,
            answer_text=q.answer_text,
            answered_by_user_id=q.answered_by_user_id,
            answered_at=q.answered_at,
            is_answered=q.is_answered,
            upvotes_count=q.upvotes_count,
            created_at=q.created_at
        )
        for q in questions
    ]


@router.post("/sessions/{session_id}/questions", response_model=QuestionResponse)
async def post_session_question(
    session_id: uuid.UUID,
    payload: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = SessionQuestion(
        session_id=session_id,
        user_id=current_user.id,
        user_name=current_user.email,
        user_role=current_user.role.value,
        question_text=payload.question_text
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)

    return QuestionResponse(
        id=question.id,
        session_id=question.session_id,
        user_id=question.user_id,
        user_name=question.user_name,
        user_role=question.user_role,
        question_text=question.question_text,
        answer_text=question.answer_text,
        answered_by_user_id=question.answered_by_user_id,
        answered_at=question.answered_at,
        is_answered=question.is_answered,
        upvotes_count=question.upvotes_count,
        created_at=question.created_at
    )


@router.post("/sessions/{session_id}/questions/{q_id}/answer", response_model=QuestionResponse)
async def answer_session_question(
    session_id: uuid.UUID,
    q_id: uuid.UUID,
    payload: AnswerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(SessionQuestion).where(
            SessionQuestion.id == q_id,
            SessionQuestion.session_id == session_id
        )
    )
    question = res.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    question.answer_text = payload.answer_text
    question.answered_by_user_id = current_user.id
    question.answered_at = datetime.now(timezone.utc)
    question.is_answered = True

    await db.commit()
    await db.refresh(question)

    return QuestionResponse(
        id=question.id,
        session_id=question.session_id,
        user_id=question.user_id,
        user_name=question.user_name,
        user_role=question.user_role,
        question_text=question.question_text,
        answer_text=question.answer_text,
        answered_by_user_id=question.answered_by_user_id,
        answered_at=question.answered_at,
        is_answered=question.is_answered,
        upvotes_count=question.upvotes_count,
        created_at=question.created_at
    )


# ============================================================
# 10. DOCTOR / FACULTY SESSION STUDIO & ANALYTICS
# ============================================================

@router.get("/doctor/my-sessions", response_model=List[SessionResponse])
async def get_doctor_my_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(
        select(ExpertSession)
        .where(ExpertSession.expert_user_id == current_user.id)
        .order_by(desc(ExpertSession.created_at))
    )
    sessions = res.scalars().all()
    return [format_session_response(s, current_user.id) for s in sessions]


@router.get("/doctor/analytics")
async def get_doctor_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exp_res = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == current_user.id))
    expert = exp_res.scalars().first()

    sess_res = await db.execute(
        select(
            func.count(ExpertSession.id),
            func.sum(ExpertSession.participants_count),
            func.sum(ExpertSession.recording_views_count)
        ).where(ExpertSession.expert_user_id == current_user.id)
    )
    total_sess, total_participants, total_views = sess_res.first()

    ratings_res = await db.execute(
        select(
            func.avg(SessionRating.overall_rating),
            func.count(SessionRating.id),
            func.avg(SessionRating.rating_knowledge),
            func.avg(SessionRating.rating_teaching_quality),
            func.avg(SessionRating.rating_clarity),
            func.avg(SessionRating.rating_practical_value),
            func.avg(SessionRating.rating_engagement),
            func.avg(SessionRating.rating_usefulness)
        ).where(SessionRating.expert_user_id == current_user.id)
    )
    avg_r, cnt_r, r_k, r_t, r_c, r_p, r_e, r_u = ratings_res.first()

    # Recent reviews
    rev_res = await db.execute(
        select(SessionRating)
        .where(SessionRating.expert_user_id == current_user.id)
        .order_by(desc(SessionRating.created_at))
        .limit(5)
    )
    recent_reviews = rev_res.scalars().all()

    return {
        "expert_name": expert.full_name if expert else current_user.email,
        "specialization": expert.specialization if expert else "Ayurveda",
        "followers_count": expert.followers_count if expert else 0,
        "total_sessions": total_sess or 0,
        "total_students_reached": (total_participants or 0) + (total_views or 0),
        "total_recording_views": total_views or 0,
        "average_rating": round(float(avg_r or (expert.average_rating if expert else 5.0)), 1),
        "total_ratings": cnt_r or (expert.total_ratings if expert else 0),
        "bayesian_score": round(compute_bayesian_rating(float(avg_r or 5.0), cnt_r or 0), 2),
        "category_ratings": {
            "knowledge": round(float(r_k or 5.0), 1),
            "teaching_quality": round(float(r_t or 5.0), 1),
            "clarity": round(float(r_c or 5.0), 1),
            "practical_value": round(float(r_p or 5.0), 1),
            "engagement": round(float(r_e or 5.0), 1),
            "usefulness": round(float(r_u or 5.0), 1)
        },
        "recent_feedback": [
            {
                "student_name": r.student_name,
                "rating": r.overall_rating,
                "review": r.review_text,
                "date": r.created_at.strftime("%b %d, %Y") if r.created_at else "Recent"
            }
            for r in recent_reviews if r.review_text
        ]
    }
