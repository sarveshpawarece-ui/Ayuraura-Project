import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_explain_anatomy_educational_and_marma_free():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "structure_name": "Femur (Thigh Bone)",
            "sanskrit_name": "Urvasthi",
            "region": "Bone",
            "mode": "ADVANCED",
            "include_questions": True
        }
        res = await ac.post("/api/v1/ai-ecosystem/anatomy-explainer", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["structure_name"] == "Femur (Thigh Bone)"
        assert "Asthi" in data["classical_correlation"]
        assert "Shalya Tantra" in data["clinical_surgical_significance"]
        # Ensure no Marma points / engine
        assert "marma point" not in data["classical_correlation"].lower()
        assert len(data["step_by_step_physiological_flow"]) > 0
        assert len(data["practice_questions"]) > 0

@pytest.mark.asyncio
async def test_anatomy_question_answering():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "structure_name": "Heart (Hridaya)",
            "sanskrit_name": "Hridaya",
            "system_id": "cardiovascular",
            "question": "What is the relation between Hridaya and Rasavaha Srotas in BAMS Rachana Sharir?",
            "bams_subject": "Rachana Sharir"
        }
        res = await ac.post("/api/v1/ai-ecosystem/anatomy-qa", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert "answer" in data
        assert len(data["classical_treatise_citations"]) > 0
        assert len(data["suggested_followups"]) > 0
        assert "Rasavaha" in data["bams_correlation"]

@pytest.mark.asyncio
async def test_anatomy_quiz_and_flashcards_generation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "structure_name": "Knee Joint Articulation",
            "sanskrit_name": "Janu Sandhi",
            "system_id": "skeletal",
            "bams_year": "1st Year",
            "difficulty": "INTERMEDIATE"
        }
        res = await ac.post("/api/v1/ai-ecosystem/anatomy-quiz", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert len(data["questions"]) >= 3
        q1 = data["questions"][0]
        assert len(q1["options"]) == 4
        assert 0 <= q1["correct_index"] < 4
        assert "explanation" in q1
        assert len(data["flashcards"]) >= 3
        fc1 = data["flashcards"][0]
        assert "front" in fc1
        assert "back" in fc1

@pytest.mark.asyncio
async def test_anatomy_revision_summary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "structure_name": "Stomach (Amashaya)",
            "sanskrit_name": "Amashaya",
            "system_id": "digestive"
        }
        res = await ac.post("/api/v1/ai-ecosystem/anatomy-summary", json=payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert len(data["key_takeaways"]) > 0
        assert len(data["mnemonics"]) > 0
        assert len(data["classical_shlokas"]) > 0
        assert len(data["exam_viva_tips"]) > 0

@pytest.mark.asyncio
async def test_student_anatomy_progress_tracking():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # GET progress
        res_get = await ac.get("/api/v1/ai-ecosystem/anatomy-progress")
        assert res_get.status_code == 200
        get_data = res_get.json()
        assert "completed_structures" in get_data
        assert "recommended_revisions" in get_data

        # POST progress
        payload = {
            "structure_id": "femur_right",
            "system_id": "skeletal",
            "is_completed": True,
            "notes": "Studied Linea Aspera and Greater Trochanter attachments for Rachana Sharir viva."
        }
        res_post = await ac.post("/api/v1/ai-ecosystem/anatomy-progress", json=payload)
        assert res_post.status_code == 200
        post_data = res_post.json()
        assert "femur_right" in post_data["notes"]
        assert post_data["notes"]["femur_right"] == payload["notes"]
