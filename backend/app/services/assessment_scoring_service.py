from typing import Dict, List, Tuple, Any
from app.models.domain import QuestionCategory

class AssessmentScoringService:
    """
    Centralized Scoring & Normalization Service for Skill Assessments.
    Calculates weighted skill scores, category proficiencies, overall score, strengths & weaknesses.
    """

    # Configurable Proficiency Thresholds
    STRENGTH_THRESHOLD = 75.0
    WEAKNESS_THRESHOLD = 60.0

    @staticmethod
    def get_proficiency_level(score: float) -> str:
        """
        Maps a normalized score (0-100) to a human-readable proficiency level.
        """
        if score >= 90.0:
            return "EXPERT"
        elif score >= 75.0:
            return "ADVANCED"
        elif score >= 60.0:
            return "INTERMEDIATE"
        elif score >= 40.0:
            return "BASIC"
        else:
            return "BEGINNER"

    def compute_assessment_result(
        self,
        questions: List[Any],
        answers_dict: Dict[Any, Any] # question_id -> selected_option_id
    ) -> Dict[str, Any]:
        """
        Evaluates answers against correct options, calculates skill and category scores,
        determines strengths and weaknesses.
        """
        skill_totals: Dict[Any, Dict[str, float]] = {} # skill_id -> {earned, available, name}
        category_totals: Dict[QuestionCategory, Dict[str, float]] = {} # category -> {earned, available}

        total_earned_weight = 0.0
        total_available_weight = 0.0

        processed_answers = []

        for q in questions:
            q_weight = float(q.weight or 1.0)
            q_skill = q.skill
            q_category = q.category

            # Find correct option for question
            correct_opt = next((opt for opt in q.options if opt.is_correct), None)
            selected_option_id = answers_dict.get(q.id)

            is_correct = False
            raw_score = 0.0
            weighted_score = 0.0

            if selected_option_id and correct_opt and str(selected_option_id) == str(correct_opt.id):
                is_correct = True
                raw_score = 1.0
                weighted_score = q_weight

            total_available_weight += q_weight
            total_earned_weight += weighted_score

            processed_answers.append({
                "question_id": q.id,
                "selected_option_id": selected_option_id,
                "is_correct": is_correct,
                "raw_score": raw_score,
                "weighted_score": weighted_score
            })

            # Accumulate per-skill totals
            if q_skill:
                skill_id = q_skill.id
                if skill_id not in skill_totals:
                    skill_totals[skill_id] = {
                        "skill_name": q_skill.name,
                        "earned": 0.0,
                        "available": 0.0
                    }
                skill_totals[skill_id]["earned"] += weighted_score
                skill_totals[skill_id]["available"] += q_weight

            # Accumulate per-category totals
            if q_category not in category_totals:
                category_totals[q_category] = {"earned": 0.0, "available": 0.0}
            category_totals[q_category]["earned"] += weighted_score
            category_totals[q_category]["available"] += q_weight

        # Calculate overall normalized score
        overall_score = 0.0
        if total_available_weight > 0:
            overall_score = round((total_earned_weight / total_available_weight) * 100.0, 1)

        # Build skill scores & detect strengths/weaknesses
        skill_scores_res = []
        strengths = []
        weaknesses = []

        for skill_id, st in skill_totals.items():
            avail = st["available"]
            earned = st["earned"]
            norm_score = round((earned / avail * 100.0), 1) if avail > 0 else 0.0
            prof_level = self.get_proficiency_level(norm_score)

            skill_scores_res.append({
                "skill_id": skill_id,
                "skill_name": st["skill_name"],
                "earned_weight": round(earned, 2),
                "available_weight": round(avail, 2),
                "score": norm_score,
                "proficiency": prof_level
            })

            if norm_score >= self.STRENGTH_THRESHOLD:
                strengths.append(st["skill_name"])
            elif norm_score < self.WEAKNESS_THRESHOLD:
                weaknesses.append(st["skill_name"])

        # Build category scores
        category_scores_res = []
        for cat, ct in category_totals.items():
            avail = ct["available"]
            earned = ct["earned"]
            norm_score = round((earned / avail * 100.0), 1) if avail > 0 else 0.0
            prof_level = self.get_proficiency_level(norm_score)

            category_scores_res.append({
                "category": cat,
                "earned_weight": round(earned, 2),
                "available_weight": round(avail, 2),
                "score": norm_score,
                "proficiency": prof_level
            })

        return {
            "overall_score": overall_score,
            "processed_answers": processed_answers,
            "skill_scores": skill_scores_res,
            "category_scores": category_scores_res,
            "strengths": strengths,
            "weaknesses": weaknesses
        }

assessment_scoring_service = AssessmentScoringService()
