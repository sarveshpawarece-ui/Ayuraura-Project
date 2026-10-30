import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.expert_guidance import (
    ExpertProfile,
    ExpertSession,
    SessionStatus,
    SessionVisibility,
    SessionRating,
    ExpertFollow,
    SessionParticipant
)
from app.models.domain import StudentProfile, CareerRole, StudentSkill

# Platform Constants for Bayesian Confidence Smoothing
PRIOR_MEAN_RATING = 4.5
CONFIDENCE_THRESHOLD = 10

def compute_bayesian_rating(average_rating: float, total_ratings: int, prior_mean: float = PRIOR_MEAN_RATING, threshold: int = CONFIDENCE_THRESHOLD) -> float:
    """
    Computes confidence-adjusted Bayesian average rating to prevent
    an expert with one 5.0 rating from outranking an expert with 4.8 from 150 ratings.
    """
    if total_ratings <= 0:
        return prior_mean
    return (threshold * prior_mean + average_rating * total_ratings) / (threshold + total_ratings)


class ExpertRecommendationService:
    @staticmethod
    async def get_student_signals(db: AsyncSession, student_user_id: Optional[uuid.UUID]) -> Dict[str, Any]:
        """
        Extracts career interests, target roles, skill gaps, and followed experts for personalization.
        """
        signals = {
            "target_career": "Ayurvedic Medical Consultant",
            "interests": ["Kayachikitsa", "Panchakarma", "Dravyaguna", "Clinical Practice"],
            "skill_gaps": ["Panchakarma Protocols", "Pulse Diagnosis (Nadi Pariksha)", "Herbal Formulation"],
            "followed_expert_ids": set(),
            "attended_session_ids": set(),
        }

        if not student_user_id:
            return signals

        # 1. Fetch Student Profile
        res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == student_user_id))
        student = res.scalars().first()
        if student:
            if student.interests:
                signals["interests"] = list(set(signals["interests"] + student.interests))
            if getattr(student, "degree_program", None):
                signals["interests"].append(student.degree_program)
            if getattr(student, "specialization", None):
                signals["interests"].append(student.specialization)

        # 2. Fetch Followed Experts
        follows_res = await db.execute(select(ExpertFollow.expert_user_id).where(ExpertFollow.student_user_id == student_user_id))
        signals["followed_expert_ids"] = set(follows_res.scalars().all())

        # 3. Fetch Attended Sessions
        attended_res = await db.execute(select(SessionParticipant.session_id).where(SessionParticipant.student_user_id == student_user_id))
        signals["attended_session_ids"] = set(attended_res.scalars().all())

        return signals

    @classmethod
    def score_session(cls, session: ExpertSession, signals: Dict[str, Any], expert_map: Dict[uuid.UUID, ExpertProfile]) -> Dict[str, Any]:
        """
        Multi-factor score for an individual session.
        """
        score = 0.0
        reasons = []

        session_category = (session.category or "").lower()
        session_topics = [t.lower() for t in (session.topics or [])]
        session_tags = [t.lower() for t in (session.tags or [])]
        all_session_terms = set([session_category] + session_topics + session_tags)

        # 1. Live Now Boost
        if session.status == SessionStatus.LIVE:
            score += 40.0
            reasons.append("🔥 Streaming Live Now")
        elif session.status == SessionStatus.SCHEDULED:
            # Upcoming within 3 days
            days_until = (session.scheduled_date - date.today()).days
            if 0 <= days_until <= 3:
                score += 20.0
                reasons.append(f"📅 Upcoming in {days_until} days" if days_until > 0 else "📅 Scheduled Today")

        # 2. Follow Affinity (+25 pts)
        if session.expert_user_id in signals["followed_expert_ids"]:
            score += 25.0
            reasons.append(f"👤 By {session.expert_name} (Expert you follow)")

        # 3. Interest & Category Match
        matched_interests = [i for i in signals["interests"] if any(i.lower() in term for term in all_session_terms)]
        if matched_interests:
            match_pts = min(len(matched_interests) * 12.0, 30.0)
            score += match_pts
            reasons.append(f"🎯 Aligns with your interest in {matched_interests[0]}")

        # 4. Target Career Role Match
        career = signals["target_career"].lower()
        if any(term in career for term in all_session_terms) or any(career in term for term in all_session_terms):
            score += 18.0
            reasons.append(f"💼 Relevant to your target career ({signals['target_career']})")

        # 5. Skill Gap Match
        matched_gaps = [g for g in signals["skill_gaps"] if any(g.lower() in term or term in g.lower() for term in all_session_terms)]
        if matched_gaps:
            score += 15.0
            reasons.append(f"⚡ Bridges skill gap: {matched_gaps[0]}")

        # 6. Bayesian Rating Quality of the Expert & Session
        expert = expert_map.get(session.expert_user_id)
        if expert:
            bayes_val = compute_bayesian_rating(expert.average_rating, expert.total_ratings)
            score += (bayes_val - 3.0) * 8.0  # Scale 3.0-5.0 to 0-16 points
            if expert.total_ratings >= 15 and expert.average_rating >= 4.7:
                reasons.append(f"⭐ Top Rated Faculty ({expert.average_rating:.1f} ★ from {expert.total_ratings} reviews)")

        # 7. Recorded Lecture Popularity
        if session.status == SessionStatus.COMPLETED and session.recording_available:
            score += min(session.recording_views_count * 0.1, 10.0)
            if not reasons:
                reasons.append("🎥 High-yield recorded clinical lecture")

        return {
            "score": round(score, 2),
            "reasons": reasons[:3]
        }

    @classmethod
    def score_expert(cls, expert: ExpertProfile, signals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Multi-factor scoring for recommending top experts.
        """
        score = 0.0
        reasons = []

        expert_terms = set(
            [(expert.specialization or "").lower()] +
            [e.lower() for e in (expert.areas_of_expertise or [])] +
            [s.lower() for s in (expert.subjects or [])]
        )

        # 1. Bayesian Rating Confidence
        bayes_score = compute_bayesian_rating(expert.average_rating, expert.total_ratings)
        score += (bayes_score - 3.0) * 15.0  # Up to ~30 points

        if expert.total_ratings >= 20 and expert.average_rating >= 4.7:
            reasons.append(f"⭐ Highly Rated Expert ({expert.average_rating:.1f} ★ from {expert.total_ratings} ratings)")

        # 2. Follow Affinity
        if expert.user_id in signals["followed_expert_ids"]:
            score += 20.0
            reasons.append("👤 You follow this expert")

        # 3. Interest & Specialization Match
        matched_interests = [i for i in signals["interests"] if any(i.lower() in t for t in expert_terms)]
        if matched_interests:
            score += min(len(matched_interests) * 15.0, 35.0)
            reasons.append(f"🌿 Specializes in {matched_interests[0]}")

        # 4. Completed Sessions Productivity
        completed_pts = min(expert.completed_sessions_count * 1.5, 15.0)
        score += completed_pts
        if expert.completed_sessions_count >= 10:
            reasons.append(f"🎓 {expert.completed_sessions_count}+ lectures completed")

        # 5. Experience
        if expert.years_of_experience >= 10:
            score += 10.0
            reasons.append(f"🏥 {expert.years_of_experience}+ years clinical & academic experience")

        return {
            "score": round(score, 2),
            "reasons": reasons[:3]
        }
