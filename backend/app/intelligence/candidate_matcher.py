from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.domain import ProficiencyLevel

PROFICIENCY_SCORES = {
    ProficiencyLevel.NOVICE: 0.25,
    ProficiencyLevel.INTERMEDIATE: 0.50,
    ProficiencyLevel.ADVANCED: 0.75,
    ProficiencyLevel.EXPERT: 1.00,
}

class CandidateMatcher:
    """
    Explainable Candidate Matching & Ranking Engine for AyurSetu Industry Partners.
    """

    def calculate_fit_score(
        self,
        student_skills: List[Dict[str, Any]], # [{skill_id, name, proficiency_level}]
        opportunity_skills: List[Dict[str, Any]] # [{skill_id, name, min_proficiency, is_mandatory}]
    ) -> Dict[str, Any]:
        if not opportunity_skills:
            return {"fit_score": 100.0, "match_explanation": "No specific skill requirements listed for this opportunity."}

        student_map = {s["name"].lower(): PROFICIENCY_SCORES.get(s["proficiency_level"], 0.25) for s in student_skills}
        
        mandatory_matched = 0
        total_mandatory = 0
        weighted_score = 0.0
        total_weight = 0.0

        matched_skills = []
        lacking_skills = []

        for opp_skill in opportunity_skills:
            name_lower = opp_skill["name"].lower()
            min_score = PROFICIENCY_SCORES.get(opp_skill["min_proficiency"], 0.25)
            is_mandatory = opp_skill.get("is_mandatory", True)
            weight = 2.0 if is_mandatory else 1.0
            
            total_weight += weight
            if is_mandatory:
                total_mandatory += 1

            student_score = student_map.get(name_lower, 0.0)

            if student_score >= min_score:
                if is_mandatory:
                    mandatory_matched += 1
                weighted_score += weight
                matched_skills.append(opp_skill["name"])
            elif student_score > 0:
                weighted_score += (student_score / min_score) * weight
                lacking_skills.append(f"{opp_skill['name']} (Partial)")
            else:
                lacking_skills.append(f"{opp_skill['name']} (Missing)")

        base_fit = (weighted_score / total_weight) * 100.0 if total_weight > 0 else 100.0

        # Penalty if mandatory skills are missing
        if total_mandatory > 0 and mandatory_matched < total_mandatory:
            mandatory_penalty = (mandatory_matched / total_mandatory)
            final_score = round(base_fit * mandatory_penalty, 2)
        else:
            final_score = round(base_fit, 2)

        explanation = f"Matched {len(matched_skills)}/{len(opportunity_skills)} required skills ({final_score}% overall fit)."
        if lacking_skills:
            explanation += f" Gap in: {', '.join(lacking_skills)}."

        return {
            "fit_score": final_score,
            "matched_skills": matched_skills,
            "lacking_skills": lacking_skills,
            "explanation": explanation
        }

candidate_matcher = CandidateMatcher()
