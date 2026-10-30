from typing import Tuple, Dict, Any

class ProfileCompletionService:
    """
    Service to calculate weighted profile completion percentage and status for Student Profiles.
    Includes Phase 4 Target Career Selection weight (10%).
    """

    def calculate_completion(self, profile: Any, skills_count: int = 0, exp_count: int = 0, proj_count: int = 0) -> Tuple[int, str]:
        score = 0.0

        # 1. Basic Identity (Max 20%)
        identity_fields = [
            getattr(profile, "first_name", None),
            getattr(profile, "last_name", None),
            getattr(profile, "phone", None),
            getattr(profile, "city", None),
            getattr(profile, "bio", None),
        ]
        identity_filled = sum(1 for f in identity_fields if f and str(f).strip())
        score += (identity_filled / len(identity_fields)) * 20.0

        # 2. Academic Information (Max 25%)
        academic_fields = [
            getattr(profile, "college_name", None),
            getattr(profile, "course", None) or getattr(profile, "degree_program", None),
            getattr(profile, "current_year", None) or getattr(profile, "academic_year", None),
            getattr(profile, "graduation_year", None),
            getattr(profile, "cgpa", None),
        ]
        academic_filled = sum(1 for f in academic_fields if f is not None and str(f).strip() != "")
        score += (academic_filled / len(academic_fields)) * 25.0

        # 3. Skills & Interests (Max 25%)
        interests = getattr(profile, "interests", []) or []
        skills_score = min(15.0, skills_count * 5.0)
        interests_score = 10.0 if len(interests) > 0 else 0.0
        score += skills_score + interests_score

        # 4. Experience & Projects (Max 15%)
        exp_score = min(10.0, exp_count * 5.0)
        proj_score = min(5.0, proj_count * 2.5)
        score += exp_score + proj_score

        # 5. Professional Social Links (Max 5%)
        social_fields = [
            getattr(profile, "linkedin_url", None),
            getattr(profile, "github_url", None),
            getattr(profile, "website_url", None),
        ]
        social_filled = sum(1 for f in social_fields if f and str(f).strip())
        score += min(5.0, social_filled * 1.67)

        # 6. Target Career Selection (Max 10%) - Phase 4 Integration
        has_target_career = getattr(profile, "target_career_id", None) is not None or getattr(profile, "target_career_role", None) is not None
        if has_target_career:
            score += 10.0

        final_percentage = min(100, int(round(score)))
        status = "COMPLETE" if final_percentage >= 75 else "INCOMPLETE"

        return final_percentage, status

profile_completion_service = ProfileCompletionService()
