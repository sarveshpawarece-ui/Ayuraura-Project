import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    with TestClient(app) as test_c:
        yield

client = TestClient(app)

def get_token_for_user(email: str, role: str = "STUDENT", password: str = "AyurSetu@2026") -> str:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code == 200:
        return response.json()["access_token"]

    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": role, "full_name": f"{role.title()} Test User"}
    )
    assert reg_response.status_code in [200, 201]

    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]

# Unique user emails for test isolation
uid = uuid.uuid4().hex[:6]
student_email = f"student_comm_{uid}@ayursetu.edu"
peer_email = f"peer_comm_{uid}@ayursetu.edu"
faculty_email = f"faculty_comm_{uid}@ayursetu.edu"
admin_email = f"admin_comm_{uid}@ayursetu.edu"


def test_phase1_community_discussions_and_bookmarks():
    student_token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Fetch categories
    res_cat = client.get("/api/v1/community/categories", headers=headers)
    assert res_cat.status_code == 200
    categories = res_cat.json()
    assert len(categories) >= 1
    category_id = categories[0]["id"]

    # 2. Create discussion post
    post_payload = {
        "title": f"Doshic Assessment in Rheumatoid Arthritis {uid}",
        "content": "Discussing Ama and Vata involvement in Amavata pathogenesis. Any classical references from Madhava Nidana?",
        "category_id": category_id,
        "subject_name": "Roga Nidana",
        "topic": "Amavata Pathogenesis",
        "academic_year": "3rd Prof",
        "post_type": "STUDY_TIP",
        "resource_url": "https://ayursetu.edu/resources/amavata-flowchart.pdf"
    }
    res_create = client.post("/api/v1/community/discussions", json=post_payload, headers=headers)
    assert res_create.status_code in [200, 201]
    post = res_create.json()
    assert post["title"] == post_payload["title"]
    assert post["subject_name"] == "Roga Nidana"
    post_id = post["id"]

    # 3. Retrieve discussions with filter
    res_list = client.get(f"/api/v1/community/discussions?subject=Roga Nidana&post_type=STUDY_TIP", headers=headers)
    assert res_list.status_code == 200
    posts = res_list.json()
    assert any(p["id"] == post_id for p in posts)

    # 4. Add comment to discussion
    comment_payload = {
        "content": "Refer to Madhava Nidana Chapter 25 for detailed lakshanas."
    }
    res_comment = client.post(f"/api/v1/community/discussions/{post_id}/comments", json=comment_payload, headers=headers)
    assert res_comment.status_code in [200, 201]
    comment_data = res_comment.json()
    assert comment_data["content"] == comment_payload["content"]

    # 5. Bookmark toggle
    res_bm = client.post(f"/api/v1/community/discussions/{post_id}/bookmark", headers=headers)
    assert res_bm.status_code == 200
    bm_res = res_bm.json()
    assert bm_res["bookmarked"] is True
    assert bm_res["post_id"] == post_id

    # 6. Verify discussion details includes comment and bookmark state
    res_detail = client.get(f"/api/v1/community/discussions/{post_id}", headers=headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["is_bookmarked"] is True
    assert len(detail["comments"]) >= 1


def test_phase2_faculty_qa_with_privacy():
    student_token = get_token_for_user(student_email, role="STUDENT")
    peer_token = get_token_for_user(peer_email, role="STUDENT")
    faculty_token = get_token_for_user(faculty_email, role="FACULTY")

    # 1. Student submits a question with peer anonymity
    q_payload = {
        "title": f"Bhasma Marana Temperature Verification {uid}",
        "question_text": "What is the exact Gaja Puta temperature curve recommended in Rasatarangini for Swarna Bhasma?",
        "subject_name": "Rasa Shastra",
        "topic": "Puta and Marana",
        "academic_year": "2nd Prof",
        "is_anonymous_to_peers": True
    }
    res_ask = client.post("/api/v1/community/faculty-qa", json=q_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res_ask.status_code in [200, 201]
    q_data = res_ask.json()
    assert q_data["status"] == "OPEN"
    question_id = q_data["id"]

    # 2. Peer views question -> Identity masked
    res_peer_list = client.get("/api/v1/community/faculty-qa", headers={"Authorization": f"Bearer {peer_token}"})
    assert res_peer_list.status_code == 200
    peer_questions = res_peer_list.json()
    target_q = next((q for q in peer_questions if q["id"] == question_id), None)
    assert target_q is not None
    assert target_q["is_anonymous"] is True
    assert "Student Test User" not in target_q["author_name"]
    assert "BAMS Scholar" in target_q["author_name"]

    # 3. Faculty answers the question
    ans_payload = {
        "faculty_answer": "In Rasatarangini Taranga 15, Gaja Puta attains approximately 800°C–950°C maintained uniformly using 1000 wild cow-dung cakes (Vanopala).",
        "reference_text": "Rasatarangini Taranga 15, Shloka 42-45"
    }
    res_ans = client.post(f"/api/v1/community/faculty-qa/{question_id}/answer", json=ans_payload, headers={"Authorization": f"Bearer {faculty_token}"})
    assert res_ans.status_code in [200, 201]
    answered_q = res_ans.json()
    assert answered_q["status"] == "ANSWERED"
    assert answered_q["faculty_answer"] == ans_payload["faculty_answer"]
    assert answered_q["faculty_name"] is not None


def test_phase3_expert_sessions_and_registration():
    student_token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. List expert sessions
    res_sessions = client.get("/api/v1/community/expert-sessions", headers=headers)
    assert res_sessions.status_code == 200
    sessions = res_sessions.json()
    assert len(sessions) >= 1
    session_id = sessions[0]["id"]
    # Check that real meeting link / recording structure is present without fake live video claims
    assert "meeting_link" in sessions[0]
    assert "learning_objectives" in sessions[0]

    # 2. Register / RSVP
    res_reg = client.post(f"/api/v1/community/expert-sessions/{session_id}/register", headers=headers)
    assert res_reg.status_code == 200
    assert res_reg.json()["registered"] is True

    # 3. Repeat registration is idempotent
    res_reg_again = client.post(f"/api/v1/community/expert-sessions/{session_id}/register", headers=headers)
    assert res_reg_again.status_code == 200
    assert res_reg_again.json()["registered"] is True


def test_phase4_student_collaboration_study_groups():
    student_token = get_token_for_user(student_email, role="STUDENT")
    peer_token = get_token_for_user(peer_email, role="STUDENT")

    # 1. Create a private study group with passcode
    group_payload = {
        "title": f"Charaka Samhita Shloka Circle {uid}",
        "description": "Daily shloka recitation and anvaya breakdown.",
        "subject_name": "Sanskrit & Samhita",
        "academic_year": "1st Prof",
        "topic_focus": "Sutra Sthana Chapters 1-10",
        "max_members": 10,
        "is_private": True,
        "passcode": "AYUR123"
    }
    res_create_grp = client.post("/api/v1/community/study-groups", json=group_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res_create_grp.status_code in [200, 201]
    group = res_create_grp.json()
    assert group["title"] == group_payload["title"]
    assert group["member_count"] == 1
    assert group["is_private"] is True
    group_id = group["id"]

    # 2. Peer attempts to join with wrong passcode -> 400 Bad Request
    res_fail_join = client.post(f"/api/v1/community/study-groups/{group_id}/join", json={"passcode": "WRONG_PASS"}, headers={"Authorization": f"Bearer {peer_token}"})
    assert res_fail_join.status_code == 400

    # 3. Peer joins with correct passcode -> Success
    res_join = client.post(f"/api/v1/community/study-groups/{group_id}/join", json={"passcode": "AYUR123"}, headers={"Authorization": f"Bearer {peer_token}"})
    assert res_join.status_code == 200
    assert res_join.json()["joined"] is True

    # 4. Add a shared resource to group
    res_resource = client.post(
        f"/api/v1/community/study-groups/{group_id}/resources",
        json={"title": "Sutra Sthana Ch 1 Anvaya Notes", "url": "https://ayursetu.edu/notes/sutra1.pdf", "file_type": "PDF"},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_resource.status_code in [200, 201]
    assert res_resource.json()["title"] == "Sutra Sthana Ch 1 Anvaya Notes"

    # 5. Post study circle discussion message
    res_msg = client.post(
        f"/api/v1/community/study-groups/{group_id}/discussions",
        json={"content": "Let's review Shloka 15 tomorrow at 7 AM."},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_msg.status_code in [200, 201]
    assert res_msg.json()["content"] == "Let's review Shloka 15 tomorrow at 7 AM."


def test_phase5_educational_feedback_anti_manipulation():
    student_token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    target_id = f"session_test_{uid}"
    feedback_payload = {
        "target_type": "SESSION",
        "target_id": target_id,
        "rating": 5,
        "review_text": "Exceptional clinical correlation of Dhatu Poshana Nyaya!",
        "is_public": True
    }

    # 1. Submit rating
    res_fb = client.post("/api/v1/community/feedback", json=feedback_payload, headers=headers)
    assert res_fb.status_code in [200, 201]
    fb_data = res_fb.json()
    assert fb_data["rating"] == 5

    # 2. Check aggregate metrics
    res_agg = client.get(f"/api/v1/community/feedback/aggregate?target_type=SESSION&target_id={target_id}", headers=headers)
    assert res_agg.status_code == 200
    agg = res_agg.json()
    assert agg["total_ratings"] == 1
    assert agg["average_rating"] == 5.0

    # 3. Anti-manipulation: Repeat rating by same user should update rather than duplicate
    updated_payload = {
        "target_type": "SESSION",
        "target_id": target_id,
        "rating": 4,
        "review_text": "Updated feedback: good pace, but needed 10 more minutes for Q&A.",
        "is_public": True
    }
    res_fb_up = client.post("/api/v1/community/feedback", json=updated_payload, headers=headers)
    assert res_fb_up.status_code in [200, 201]

    res_agg_after = client.get(f"/api/v1/community/feedback/aggregate?target_type=SESSION&target_id={target_id}", headers=headers)
    assert res_agg_after.status_code == 200
    agg_after = res_agg_after.json()
    assert agg_after["total_ratings"] == 1  # Still 1, NOT 2!
    assert agg_after["average_rating"] == 4.0


def test_phase6_community_moderation_and_safety():
    student_token = get_token_for_user(student_email, role="STUDENT")
    faculty_token = get_token_for_user(faculty_email, role="FACULTY")

    # 1. Student reports inappropriate content
    report_payload = {
        "target_type": "DISCUSSION",
        "target_id": f"post_spam_{uid}",
        "reason": "Spam or promotional pharmaceutical advertising",
        "details": "User is promoting commercial unregistered products."
    }
    res_report = client.post("/api/v1/community/moderation/report", json=report_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res_report.status_code in [200, 201]
    assert res_report.json()["status"] in ["PENDING", "RECEIVED"]

    # 2. Faculty / Authorized moderator issues a moderation action
    action_payload = {
        "target_type": "DISCUSSION",
        "target_id": f"post_spam_{uid}",
        "action_taken": "WARN_USER",
        "reason": "Content violated academic community advertising guidelines.",
        "notes": "First warning issued with educational reminder."
    }
    res_action = client.post("/api/v1/community/moderation/action", json=action_payload, headers={"Authorization": f"Bearer {faculty_token}"})
    assert res_action.status_code in [200, 201]
    audit_data = res_action.json()
    assert audit_data["action_taken"] == "WARN_USER"
    assert audit_data["reason"] == action_payload["reason"]


def test_phase7_ai_community_integration():
    student_token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. AI Community Summarize & Follow-up Questions
    sum_payload = {
        "title": "Pathogenesis of Tamaka Shwasa (Bronchial Asthma)",
        "content": "Vata dosha aggravated by cold and dust enters Pranavaha Srotas, provoking Kapha and obstructing airways, leading to paroxysmal wheezing and dyspnea relieved in upright posture."
    }
    res_sum = client.post("/api/v1/community/ai/summarize", json=sum_payload, headers=headers)
    assert res_sum.status_code == 200
    ai_sum = res_sum.json()
    assert ai_sum["is_ai_generated"] is True
    assert "faculty" not in ai_sum["response_type"].lower() or "assistant" in ai_sum["disclaimer"].lower()
    assert len(ai_sum["key_points"]) >= 1
    assert len(ai_sum["follow_up_questions"]) >= 1

    # 2. AI Community Simplify Explanation
    simp_payload = {
        "sanskrit_or_clinical_concept": "Rasavaha Srotodushti Lakshana: Ashraddha, Aruchi, Asyavairasya, Arasajnata",
        "target_audience": "1st Prof BAMS student"
    }
    res_simp = client.post("/api/v1/community/ai/simplify", json=simp_payload, headers=headers)
    assert res_simp.status_code == 200
    ai_simp = res_simp.json()
    assert ai_simp["is_ai_generated"] is True
    assert len(ai_simp["simplified_text"]) > 20

    # 3. AI Community Ask Topic Guidance
    topic_payload = {
        "topic": "Saptadhatu formation via Ksheeradadhi Nyaya",
        "context": "Exam revision for Kriya Sharira"
    }
    res_topic = client.post("/api/v1/community/ai/ask-topic", json=topic_payload, headers=headers)
    assert res_topic.status_code == 200
    ai_topic = res_topic.json()
    assert ai_topic["is_ai_generated"] is True
    assert "Ksheeradadhi" in ai_topic["simplified_text"] or len(ai_topic["suggested_resources"]) >= 1


def test_phase8_notifications_and_preferences():
    student_token = get_token_for_user(student_email, role="STUDENT")
    headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Fetch notifications
    res_notif = client.get("/api/v1/community/notifications", headers=headers)
    assert res_notif.status_code == 200
    notifs = res_notif.json()
    assert isinstance(notifs, (list, dict))

    # 2. Get notification preferences
    res_prefs = client.get("/api/v1/community/notifications/preferences", headers=headers)
    assert res_prefs.status_code == 200
    prefs = res_prefs.json()
    assert "notify_faculty_replies" in prefs
    assert "notify_session_reminders" in prefs

    # 3. Update notification preferences
    update_prefs = {
        "notify_faculty_replies": True,
        "notify_session_announcements": True,
        "notify_session_reminders": True,
        "notify_study_group_activity": False,
        "notify_discussion_replies": True,
        "notify_recordings_available": True
    }
    res_update_prefs = client.put("/api/v1/community/notifications/preferences", json=update_prefs, headers=headers)
    assert res_update_prefs.status_code == 200
    updated = res_update_prefs.json()
    assert updated["notify_study_group_activity"] is False
    assert updated["notify_faculty_replies"] is True
