from typing import List, Dict, Any
from app.models.domain import ProficiencyLevel

PROFICIENCY_WEIGHTS = {
    ProficiencyLevel.NOVICE: 1.0,
    ProficiencyLevel.INTERMEDIATE: 2.0,
    ProficiencyLevel.ADVANCED: 3.0,
    ProficiencyLevel.EXPERT: 4.0,
}

class SkillGapAnalyzer:
    """
    Explainable AI Skill Gap Analysis Engine for AyurSetu.
    Computes proficiency delta, match score percentage, and actionable recommendations.
    """

    def analyze_gap(
        self,
        student_skills: List[Dict[str, Any]], # [{skill_id, name, proficiency_level}]
        target_requirements: List[Dict[str, Any]], # [{skill_id, name, required_proficiency, importance_weight}]
    ) -> Dict[str, Any]:
        
        student_skill_map = {
            s["skill_id"]: PROFICIENCY_WEIGHTS.get(s["proficiency_level"], 1.0)
            for s in student_skills
        }

        total_weight = 0.0
        achieved_weight = 0.0

        acquired_skills = []
        missing_skills = []
        recommendations = []

        for req in target_requirements:
            skill_id = req["skill_id"]
            skill_name = req["name"]
            req_level = req["required_proficiency"]
            target_val = PROFICIENCY_WEIGHTS.get(req_level, 2.0)
            importance = req.get("importance_weight", 1.0)

            total_weight += target_val * importance
            current_val = student_skill_map.get(skill_id, 0.0)

            if current_val >= target_val:
                achieved_weight += target_val * importance
                acquired_skills.append({
                    "skill_id": str(skill_id),
                    "name": skill_name,
                    "status": "MET",
                    "current_level": req_level,
                    "required_level": req_level,
                })
            elif current_val > 0:
                achieved_weight += current_val * importance
                gap_val = target_val - current_val
                missing_skills.append({
                    "skill_id": str(skill_id),
                    "name": skill_name,
                    "status": "PARTIAL",
                    "gap_magnitude": gap_val,
                    "required_level": req_level,
                })
                recommendations.append(
                    f"Upgrade '{skill_name}' from current level to {req_level} through practical hands-on clinical/pharma training."
                )
            else:
                missing_skills.append({
                    "skill_id": str(skill_id),
                    "name": skill_name,
                    "status": "MISSING",
                    "gap_magnitude": target_val,
                    "required_level": req_level,
                })
                recommendations.append(
                    f"Acquire fundamental knowledge and certified training in '{skill_name}' (Target Level: {req_level})."
                )

        match_score = round((achieved_weight / total_weight * 100.0), 2) if total_weight > 0 else 100.0

        return {
            "overall_match_score": match_score,
            "acquired_skills": acquired_skills,
            "missing_skills": missing_skills,
            "recommended_actions": recommendations,
            "explainability_summary": f"Target career match score is {match_score}%. Identified {len(missing_skills)} skill areas requiring development."
        }

skill_gap_analyzer = SkillGapAnalyzer()
