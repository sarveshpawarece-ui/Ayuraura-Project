import pytest
import uuid
from datetime import date, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.domain import StudentProfile
from app.models.expert_guidance import (
    ExpertProfile,
    ExpertSession,
    SessionType,
    SessionLevel,
    SessionStatus,
    SessionVisibility,
    SessionRating,
    ExpertFollow,
    SessionParticipant,
    SessionQuestion
)
from app.core.security import get_password_hash, create_access_token
from app.services.expert_recommendation import compute_bayesian_rating, ExpertRecommendationService

client = TestClient(app)

@pytest.mark.asyncio
async def test_expert_guidance_system_end_to_end():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        unique_suffix = uuid.uuid4().hex[:6]

        # 1. Setup Doctor User & Expert Profile
        doc_email = f"expert_doc_{unique_suffix}@ayursetu.in"
        doc_user = User(
            email=doc_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.DOCTOR,
            is_active=True,
            is_verified=True
        )
        db.add(doc_user)
        await db.flush()

        expert1 = ExpertProfile(
            user_id=doc_user.id,
            full_name="Vaidya Dr. Rajeshwari Sharma",
            role=UserRole.DOCTOR,
            professional_title="Professor of Panchakarma",
            institution_or_clinic="AIIA New Delhi",
            qualifications="BAMS, MD (Ayurveda), PhD",
            specialization="Panchakarma",
            areas_of_expertise=["Panchakarma", "Virechana", "Snehapana"],
            subjects=["Kaya Chikitsa", "Panchakarma"],
            years_of_experience=15,
            average_rating=4.9,
            total_ratings=140,
            completed_sessions_count=35,
            followers_count=100
        )
        db.add(expert1)
        await db.flush()

        # 2. Setup Student User
        st_email = f"student_guidance_{unique_suffix}@ayursetu.in"
        st_user = User(
            email=st_email,
            hashed_password=get_password_hash("password123"),
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(st_user)
        await db.flush()

        st_profile = StudentProfile(
            user_id=st_user.id,
            full_name="Pooja Kulkarni",
            interests=["Panchakarma", "Clinical Practice"]
        )
        db.add(st_profile)
        await db.commit()

        doc_token = create_access_token(doc_user.id, role="DOCTOR")
        st_token = create_access_token(st_user.id, role="STUDENT")

        # 3. Test Doctor Session Creation (Live Lecture)
        create_payload = {
            "title": f"Clinical Mastery of Virechana {unique_suffix}",
            "description": "Comprehensive clinical protocol for Virechana purgation therapy.",
            "session_type": "LIVE_LECTURE",
            "category": "Panchakarma",
            "topics": ["Snehapana", "Virechana Vegas", "Complications"],
            "level": "ADVANCED",
            "scheduled_date": str(date.today()),
            "start_time": "10:00 AM",
            "duration_minutes": 60,
            "max_students": 200,
            "language": "English / Hindi",
            "recording_available": True
        }

        res = client.post(
            "/api/v1/guidance/sessions",
            json=create_payload,
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        assert res.status_code == 200, res.text
        sess_data = res.json()
        session_id = sess_data["id"]
        assert sess_data["title"] == create_payload["title"]
        assert sess_data["status"] == "SCHEDULED"

        # 4. Test Student Follows Expert
        follow_res = client.post(
            f"/api/v1/guidance/experts/{expert1.id}/follow",
            headers={"Authorization": f"Bearer {st_token}"}
        )
        assert follow_res.status_code == 200
        assert follow_res.json()["is_following"] is True

        # 5. Test Student Discovery Feed
        feed_res = client.get(
            "/api/v1/guidance/sessions/discovery",
            headers={"Authorization": f"Bearer {st_token}"}
        )
        assert feed_res.status_code == 200
        feed_data = feed_res.json()
        assert "recommended_sessions" in feed_data
        assert "top_experts" in feed_data
        assert any(e["full_name"] == expert1.full_name for e in feed_data["top_experts"])

        # 6. Test Doctor Starts Live Session (Transition to LIVE)
        status_res = client.put(
            f"/api/v1/guidance/sessions/{session_id}/status",
            json={"status": "LIVE"},
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "LIVE"

        # 7. Test Student Joins Live Session
        join_res = client.post(
            f"/api/v1/guidance/sessions/{session_id}/join-live",
            headers={"Authorization": f"Bearer {st_token}"}
        )
        assert join_res.status_code == 200
        assert join_res.json()["has_attended_live"] is True

        # 8. Test Student Posts Q&A Question
        q_res = client.post(
            f"/api/v1/guidance/sessions/{session_id}/questions",
            json={"question_text": "How do we adjust Snehapana dosage in patients with Madhyama Koshtha?"},
            headers={"Authorization": f"Bearer {st_token}"}
        )
        assert q_res.status_code == 200
        q_id = q_res.json()["id"]

        # 9. Test Doctor Answers Question
        ans_res = client.post(
            f"/api/v1/guidance/sessions/{session_id}/questions/{q_id}/answer",
            json={"answer_text": "Start with Hrasiyasi Matra (30ml) and titrate daily according to Jirana Kala."},
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        assert ans_res.status_code == 200
        assert ans_res.json()["is_answered"] is True

        # 10. Test Doctor Ends Live Session (Transition to COMPLETED & Generates Recording)
        end_res = client.put(
            f"/api/v1/guidance/sessions/{session_id}/status",
            json={"status": "COMPLETED", "recording_available": True},
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        assert end_res.status_code == 200
        assert end_res.json()["status"] == "COMPLETED"
        assert end_res.json()["recording_available"] is True
        assert end_res.json()["recording_url"] is not None

        # 11. Test Student Submits Multi-Category Rating
        rating_payload = {
            "overall_rating": 5.0,
            "rating_knowledge": 5,
            "rating_teaching_quality": 5,
            "rating_clarity": 5,
            "rating_practical_value": 5,
            "rating_engagement": 5,
            "rating_usefulness": 5,
            "review_text": "Outstanding clinical case demonstration on Virechana dosage titration!"
        }
        rate_res = client.post(
            f"/api/v1/guidance/sessions/{session_id}/rate",
            json=rating_payload,
            headers={"Authorization": f"Bearer {st_token}"}
        )
        assert rate_res.status_code == 200
        assert rate_res.json()["overall_rating"] == 5.0

        # 12. Test Bayesian Recommendation Fairness Test
        # Expert A has 5.0 from 1 review. Expert B has 4.8 from 150 reviews.
        # Bayesian formula: (10 * 4.5 + avg * count) / (10 + count)
        bayes_a = compute_bayesian_rating(5.0, 1)    # (45 + 5) / 11 = 4.545
        bayes_b = compute_bayesian_rating(4.8, 150)  # (45 + 720) / 160 = 4.781
        assert bayes_b > bayes_a, "Bayesian scoring must favor high-confidence high-volume ratings over single 5.0 outlier"

        # 13. Test Doctor Analytics
        analytics_res = client.get(
            "/api/v1/guidance/doctor/analytics",
            headers={"Authorization": f"Bearer {doc_token}"}
        )
        assert analytics_res.status_code == 200
        analytics_data = analytics_res.json()
        assert analytics_data["total_sessions"] >= 1
        assert analytics_data["average_rating"] >= 4.5
