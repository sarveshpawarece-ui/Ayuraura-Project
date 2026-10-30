from app.intelligence.skill_gap_analyzer import skill_gap_analyzer
from app.intelligence.candidate_matcher import candidate_matcher
from app.models.domain import ProficiencyLevel

def test_skill_gap_analyzer():
    student_skills = [
        {"skill_id": "1", "name": "Dravyaguna & Herbal ID", "proficiency_level": ProficiencyLevel.ADVANCED},
        {"skill_id": "2", "name": "Clinical Diagnostics", "proficiency_level": ProficiencyLevel.NOVICE},
    ]

    target_reqs = [
        {"skill_id": "1", "name": "Dravyaguna & Herbal ID", "required_proficiency": ProficiencyLevel.INTERMEDIATE, "importance_weight": 1.0},
        {"skill_id": "2", "name": "Clinical Diagnostics", "required_proficiency": ProficiencyLevel.ADVANCED, "importance_weight": 1.5},
    ]

    result = skill_gap_analyzer.analyze_gap(student_skills, target_reqs)
    assert "overall_match_score" in result
    assert result["overall_match_score"] > 0
    assert len(result["acquired_skills"]) == 1
    assert len(result["missing_skills"]) == 1

def test_candidate_matcher():
    student_skills = [
        {"name": "Phytochemistry & HPLC", "proficiency_level": ProficiencyLevel.ADVANCED},
    ]

    opp_skills = [
        {"name": "Phytochemistry & HPLC", "min_proficiency": ProficiencyLevel.INTERMEDIATE, "is_mandatory": True},
    ]

    fit = candidate_matcher.calculate_fit_score(student_skills, opp_skills)
    assert fit["fit_score"] == 100.0
    assert len(fit["matched_skills"]) == 1
