import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Tuple, Any
from dataclasses import dataclass
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.domain import (
    StudentProfile,
    CareerRole,
    Skill,
    IndustryOpportunity,
    OpportunityRequiredSkill,
    OpportunityCareerRole,
    OpportunityMatch,
    MatchClassification,
    MatchPriority,
    MatchStatus,
    OpportunityStatus,
    ExperienceLevel
)
from app.models.user import User
from app.services.skill_profile_service import skill_profile_service
from app.schemas.matching import (
    MatchWeightConfig,
    CandidateRankItemOut,
    OpportunityCandidateMatrixOut
)
from app.schemas.opportunity import (
    IndustryOpportunityOut,
    OpportunityRequiredSkillOut,
    OpportunityMatchBreakdownOut,
    OpportunityMatchItemOut,
    OpportunityMatchSummaryOut,
    StudentOpportunitiesReportOut
)
from app.schemas.assessment import CareerRoleSimple


@dataclass
class MatchResultDetail:
    match_score: float
    match_classification: MatchClassification
    priority: MatchPriority
    skill_match_score: float
    career_match_score: float
    required_skill_coverage: float
    experience_fit: float
    matched_skills: List[str]
    partial_skills: List[str]
    missing_skills: List[str]
    critical_missing_skills: List[str]
    reason: str


class MatchingEngine:
    DEFAULT_WEIGHTS = MatchWeightConfig(
        skill_match_weight=0.50,
        career_match_weight=0.25,
        required_coverage_weight=0.15,
        experience_fit_weight=0.10
    )

    EXCELLENT_THRESHOLD: float = 85.0
    GOOD_THRESHOLD: float = 70.0
    PARTIAL_THRESHOLD: float = 50.0

    HIGH_PRIORITY_THRESHOLD: float = 80.0
    MEDIUM_PRIORITY_THRESHOLD: float = 50.0

    def normalize_weights(self, weights: Optional[MatchWeightConfig]) -> MatchWeightConfig:
        if not weights:
            return self.DEFAULT_WEIGHTS

        total = (
            weights.skill_match_weight +
            weights.career_match_weight +
            weights.required_coverage_weight +
            weights.experience_fit_weight
        )
        if total <= 0:
            return self.DEFAULT_WEIGHTS

        return MatchWeightConfig(
            skill_match_weight=weights.skill_match_weight / total,
            career_match_weight=weights.career_match_weight / total,
            required_coverage_weight=weights.required_coverage_weight / total,
            experience_fit_weight=weights.experience_fit_weight / total
        )

    def calculate_experience_fit(self, student_level: Optional[str], opp_level: ExperienceLevel) -> float:
        opp_str = opp_level.value if hasattr(opp_level, "value") else str(opp_level)
        fit_matrix = {
            "STUDENT": 100.0,
            "FRESHER": 100.0,
            "ENTRY": 90.0,
            "BEGINNER": 90.0,
            "INTERMEDIATE": 50.0,
            "ADVANCED": 20.0,
            "EXPERIENCED": 10.0,
            "UNKNOWN": 80.0
        }
        return fit_matrix.get(opp_str, 80.0)

    def classify_match(self, score: float) -> MatchClassification:
        if score >= self.EXCELLENT_THRESHOLD:
            return MatchClassification.EXCELLENT
        elif score >= self.GOOD_THRESHOLD:
            return MatchClassification.GOOD
        elif score >= self.PARTIAL_THRESHOLD:
            return MatchClassification.PARTIAL
        else:
            return MatchClassification.LOW

    def calculate_priority(self, score: float) -> MatchPriority:
        if score >= self.HIGH_PRIORITY_THRESHOLD:
            return MatchPriority.HIGH
        elif score >= self.MEDIUM_PRIORITY_THRESHOLD:
            return MatchPriority.MEDIUM
        else:
            return MatchPriority.LOW

    def generate_match_explanation(
        self,
        career_role_name: str,
        career_match_score: float,
        matched_count: int,
        total_req: int,
        critical_missing_skills: List[str]
    ) -> str:
        explanation = (
            f"Your target career is {career_role_name}, which aligns with this opportunity ({career_match_score:.0f}% career relevance). "
            f"You currently meet or exceed {matched_count} of {total_req} required skill thresholds."
        )
        if critical_missing_skills:
            crit_str = ", ".join(critical_missing_skills)
            explanation += f" Note: Critical requirement not yet fully demonstrated in: {crit_str}."

        return explanation


    def calculate_single_match(
        self,
        student_skill_map: Dict[uuid.UUID, float],
        target_career_id: Optional[uuid.UUID],
        target_career_name: str,
        opportunity: IndustryOpportunity,
        weight_config: Optional[MatchWeightConfig] = None
    ) -> MatchResultDetail:
        weights = self.normalize_weights(weight_config)

        # 1. Career Match Score
        career_mapping = next(
            (cr for cr in opportunity.career_roles if cr.career_role_id == target_career_id), None
        ) if target_career_id else None

        career_match_score = (career_mapping.relevance_weight * 100.0) if career_mapping else 50.0

        # 2. Skill Match & Required Skill Coverage
        req_skills = opportunity.required_skills
        weighted_ratios_sum = 0.0
        weights_sum = 0.0
        mandatory_count = 0
        mandatory_met_count = 0

        matched_skills: List[str] = []
        partial_skills: List[str] = []
        missing_skills: List[str] = []
        critical_missing_skills: List[str] = []

        for req_sk in req_skills:
            skill_name = req_sk.skill.name if req_sk.skill else "Skill"
            req_score = req_sk.required_score
            curr_score = student_skill_map.get(req_sk.skill_id)

            w_i = 1.0 if req_sk.is_required else 0.5
            weights_sum += w_i

            if req_sk.is_required:
                mandatory_count += 1

            if curr_score is None:
                ratio = 0.0
                missing_skills.append(skill_name)
                if req_sk.importance == "CRITICAL":
                    critical_missing_skills.append(skill_name)
            else:
                ratio = min(curr_score / req_score, 1.0)
                if curr_score >= req_score:
                    matched_skills.append(skill_name)
                    if req_sk.is_required:
                        mandatory_met_count += 1
                elif curr_score > 0:
                    partial_skills.append(skill_name)
                    if req_sk.is_required and ratio >= 0.90:
                        mandatory_met_count += 1
                    if req_sk.importance == "CRITICAL" and (req_score - curr_score) >= 20.0:
                        critical_missing_skills.append(skill_name)
                else:
                    missing_skills.append(skill_name)
                    if req_sk.importance == "CRITICAL":
                        critical_missing_skills.append(skill_name)

            weighted_ratios_sum += (w_i * ratio)

        skill_match_score = (weighted_ratios_sum / weights_sum * 100.0) if weights_sum > 0 else 50.0
        required_skill_coverage = (mandatory_met_count / mandatory_count * 100.0) if mandatory_count > 0 else 100.0

        # 3. Experience Fit
        experience_fit = self.calculate_experience_fit(None, opportunity.experience_level)

        # 4. Weighted Match Score
        raw_match = (
            (skill_match_score * weights.skill_match_weight) +
            (career_match_score * weights.career_match_weight) +
            (required_skill_coverage * weights.required_coverage_weight) +
            (experience_fit * weights.experience_fit_weight)
        )
        overall_match_score = round(raw_match, 1)

        classification = self.classify_match(overall_match_score)
        priority = self.calculate_priority(overall_match_score)

        reason = self.generate_match_explanation(
            target_career_name,
            career_match_score,
            len(matched_skills),
            len(req_skills),
            critical_missing_skills
        )

        return MatchResultDetail(
            match_score=overall_match_score,
            match_classification=classification,
            priority=priority,
            skill_match_score=round(skill_match_score, 1),
            career_match_score=round(career_match_score, 1),
            required_skill_coverage=round(required_skill_coverage, 1),
            experience_fit=round(experience_fit, 1),
            matched_skills=matched_skills,
            partial_skills=partial_skills,
            missing_skills=missing_skills,
            critical_missing_skills=critical_missing_skills,
            reason=reason
        )

    async def evaluate_student_matches(
        self,
        db: AsyncSession,
        student_profile_id: uuid.UUID,
        weight_config: Optional[MatchWeightConfig] = None
    ) -> StudentOpportunitiesReportOut:
        """
        Evaluates and persists candidate matches for student against active opportunities.
        """
        res_prof = await db.execute(select(StudentProfile).where(StudentProfile.id == student_profile_id))
        student_profile = res_prof.scalars().first()
        if not student_profile or not student_profile.target_career_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target career role not selected."
            )

        target_career_id = student_profile.target_career_id
        res_career = await db.execute(select(CareerRole).where(CareerRole.id == target_career_id))
        career_role_obj = res_career.scalars().first()
        career_role_name = career_role_obj.name if career_role_obj else "Target Role"

        # Authoritative Phase 6 Student Current Skill Profile
        student_skills_report = await skill_profile_service.get_current_skill_profile(db, student_profile_id)
        student_skill_map: Dict[uuid.UUID, float] = {
            s.skill_id: getattr(s, "score", getattr(s, "normalized_score", 0.0)) for s in student_skills_report.skills
        }


        now = datetime.now(timezone.utc)

        # Mark matches for other career roles as OUTDATED
        res_old_matches = await db.execute(
            select(OpportunityMatch).where(
                OpportunityMatch.student_profile_id == student_profile_id,
                OpportunityMatch.career_role_id != target_career_id,
                OpportunityMatch.status == MatchStatus.ACTIVE
            )
        )
        for old_m in res_old_matches.scalars().all():
            old_m.status = MatchStatus.OUTDATED
        await db.flush()

        # Query all active opportunities
        res_opps = await db.execute(
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(IndustryOpportunity.career_roles)
            )
            .where(
                IndustryOpportunity.status == OpportunityStatus.ACTIVE,
                (IndustryOpportunity.application_deadline == None) | (IndustryOpportunity.application_deadline >= now)
            )
        )
        candidate_opportunities = res_opps.scalars().all()

        existing_matches_res = await db.execute(
            select(OpportunityMatch).where(
                OpportunityMatch.student_profile_id == student_profile_id,
                OpportunityMatch.career_role_id == target_career_id,
                OpportunityMatch.status == MatchStatus.ACTIVE
            )
        )
        existing_matches_map = {m.opportunity_id: m for m in existing_matches_res.scalars().all()}

        for opp in candidate_opportunities:
            detail = self.calculate_single_match(
                student_skill_map,
                target_career_id,
                career_role_name,
                opp,
                weight_config
            )

            if opp.id in existing_matches_map:
                m_obj = existing_matches_map[opp.id]
                m_obj.match_score = detail.match_score
                m_obj.match_classification = detail.match_classification
                m_obj.priority = detail.priority
                m_obj.skill_match_score = detail.skill_match_score
                m_obj.career_match_score = detail.career_match_score
                m_obj.required_skill_coverage = detail.required_skill_coverage
                m_obj.experience_fit = detail.experience_fit
                m_obj.matched_skill_count = len(detail.matched_skills)
                m_obj.partial_skill_count = len(detail.partial_skills)
                m_obj.missing_skill_count = len(detail.missing_skills)
                m_obj.critical_missing_skill_count = len(detail.critical_missing_skills)
                m_obj.reason = detail.reason
                m_obj.generated_at = now
            else:
                res_dismissed = await db.execute(
                    select(OpportunityMatch).where(
                        OpportunityMatch.student_profile_id == student_profile_id,
                        OpportunityMatch.opportunity_id == opp.id,
                        OpportunityMatch.career_role_id == target_career_id,
                        OpportunityMatch.status == MatchStatus.DISMISSED
                    )
                )
                if not res_dismissed.scalars().first():
                    new_match = OpportunityMatch(
                        student_profile_id=student_profile_id,
                        opportunity_id=opp.id,
                        career_role_id=target_career_id,
                        match_score=detail.match_score,
                        match_classification=detail.match_classification,
                        priority=detail.priority,
                        skill_match_score=detail.skill_match_score,
                        career_match_score=detail.career_match_score,
                        required_skill_coverage=detail.required_skill_coverage,
                        experience_fit=detail.experience_fit,
                        matched_skill_count=len(detail.matched_skills),
                        partial_skill_count=len(detail.partial_skills),
                        missing_skill_count=len(detail.missing_skills),
                        critical_missing_skill_count=len(detail.critical_missing_skills),
                        reason=detail.reason,
                        status=MatchStatus.ACTIVE,
                        matching_algorithm_version="v2_advanced",
                        generated_at=now
                    )
                    db.add(new_match)

        await db.commit()

        # Build output response
        res_final_matches = await db.execute(
            select(OpportunityMatch)
            .options(
                selectinload(OpportunityMatch.opportunity)
                .selectinload(IndustryOpportunity.required_skills)
                .selectinload(OpportunityRequiredSkill.skill)
            )
            .where(
                OpportunityMatch.student_profile_id == student_profile_id,
                OpportunityMatch.career_role_id == target_career_id,
                OpportunityMatch.status == MatchStatus.ACTIVE
            )
        )
        final_matches = res_final_matches.scalars().all()

        match_items: List[OpportunityMatchItemOut] = []
        exc_cnt = 0
        good_cnt = 0
        part_cnt = 0
        low_cnt = 0
        interns_cnt = 0
        jobs_cnt = 0
        research_cnt = 0

        for m in final_matches:
            opp = m.opportunity
            if not opp:
                continue

            classif_str = m.match_classification.value if hasattr(m.match_classification, "value") else str(m.match_classification)
            prio_str = m.priority.value if hasattr(m.priority, "value") else str(m.priority)

            if classif_str == "EXCELLENT":
                exc_cnt += 1
            elif classif_str == "GOOD":
                good_cnt += 1
            elif classif_str == "PARTIAL":
                part_cnt += 1
            else:
                low_cnt += 1

            opp_type_str = opp.opportunity_type.value if hasattr(opp.opportunity_type, "value") else str(opp.opportunity_type)
            if opp_type_str == "INTERNSHIP":
                interns_cnt += 1
            elif opp_type_str == "JOB":
                jobs_cnt += 1
            elif opp_type_str == "RESEARCH":
                research_cnt += 1

            matched_sk: List[str] = []
            partial_sk: List[str] = []
            missing_sk: List[str] = []
            critical_missing_sk: List[str] = []

            req_sk_outs: List[OpportunityRequiredSkillOut] = []
            for req_sk in opp.required_skills:
                skill_name = req_sk.skill.name if req_sk.skill else "Skill"
                curr_score = student_skill_map.get(req_sk.skill_id)

                req_sk_outs.append(
                    OpportunityRequiredSkillOut(
                        id=req_sk.id,
                        skill_id=req_sk.skill_id,
                        skill_name=skill_name,
                        required_score=req_sk.required_score,
                        importance=req_sk.importance,
                        is_required=req_sk.is_required
                    )
                )

                if curr_score is None:
                    missing_sk.append(skill_name)
                    if req_sk.importance == "CRITICAL":
                        critical_missing_sk.append(skill_name)
                elif curr_score >= req_sk.required_score:
                    matched_sk.append(skill_name)
                elif curr_score > 0:
                    partial_sk.append(skill_name)
                    if req_sk.importance == "CRITICAL" and (req_sk.required_score - curr_score) >= 20.0:
                        critical_missing_sk.append(skill_name)
                else:
                    missing_sk.append(skill_name)
                    if req_sk.importance == "CRITICAL":
                        critical_missing_sk.append(skill_name)

            opp_out = IndustryOpportunityOut(
                id=opp.id,
                title=opp.title,
                description=opp.description,
                responsibilities=opp.responsibilities,
                requirements=opp.requirements,
                opportunity_type=opp_type_str,
                organization_name=opp.organization_name,
                organization_description=opp.organization_description,
                location_text=opp.location_text,
                city=opp.city,
                state=opp.state,
                country=opp.country,
                work_mode=opp.work_mode.value if hasattr(opp.work_mode, "value") else str(opp.work_mode),
                employment_type=opp.employment_type.value if hasattr(opp.employment_type, "value") else str(opp.employment_type),
                experience_level=opp.experience_level.value if hasattr(opp.experience_level, "value") else str(opp.experience_level),
                application_url=opp.application_url,
                source_name=opp.source_name,
                source_type=opp.source_type.value if hasattr(opp.source_type, "value") else str(opp.source_type),
                application_deadline=opp.application_deadline,
                start_date=opp.start_date,
                end_date=opp.end_date,
                salary_min=opp.salary_min,
                salary_max=opp.salary_max,
                salary_currency=opp.salary_currency,
                is_salary_disclosed=opp.is_salary_disclosed,
                status=opp.status.value if hasattr(opp.status, "value") else str(opp.status),
                required_skills=req_sk_outs
            )

            breakdown_out = OpportunityMatchBreakdownOut(
                skill_match_score=m.skill_match_score,
                career_match_score=m.career_match_score,
                required_skill_coverage=m.required_skill_coverage,
                experience_fit=m.experience_fit,
                overall_match_score=m.match_score
            )

            match_items.append(
                OpportunityMatchItemOut(
                    id=m.id,
                    opportunity=opp_out,
                    match_score=m.match_score,
                    match_classification=classif_str,
                    priority=prio_str,
                    breakdown=breakdown_out,
                    matched_skills=matched_sk,
                    partial_skills=partial_sk,
                    missing_skills=missing_sk,
                    critical_missing_skills=critical_missing_sk,
                    reason=m.reason,
                    status=m.status.value if hasattr(m.status, "value") else str(m.status),
                    generated_at=m.generated_at
                )
            )

        match_items.sort(key=lambda x: x.match_score, reverse=True)

        summary = OpportunityMatchSummaryOut(
            total_opportunities=len(match_items),
            excellent=exc_cnt,
            good=good_cnt,
            partial=part_cnt,
            low=low_cnt,
            internships=interns_cnt,
            jobs=jobs_cnt,
            research=research_cnt
        )

        career_simple = CareerRoleSimple(
            id=career_role_obj.id,
            name=career_role_obj.name,
            slug=career_role_obj.slug
        ) if career_role_obj else None

        return StudentOpportunitiesReportOut(
            target_career=career_simple,
            summary=summary,
            opportunities=match_items,
            generated_at=now
        )

    async def rank_candidates_for_opportunity(
        self,
        db: AsyncSession,
        opportunity_id: uuid.UUID,
        top_n: int = 50,
        weight_config: Optional[MatchWeightConfig] = None
    ) -> OpportunityCandidateMatrixOut:
        """
        Ranks candidate students for a given opportunity (for Industry & Faculty dashboards).
        """
        res_opp = await db.execute(
            select(IndustryOpportunity)
            .options(
                selectinload(IndustryOpportunity.required_skills).selectinload(OpportunityRequiredSkill.skill),
                selectinload(IndustryOpportunity.career_roles)
            )
            .where(IndustryOpportunity.id == opportunity_id)
        )
        opp = res_opp.scalars().first()
        if not opp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opportunity not found."
            )

        # Query all student profiles with user info
        res_students = await db.execute(
            select(StudentProfile)
            .options(
                selectinload(StudentProfile.user),
                selectinload(StudentProfile.target_career)
            )
            .where(StudentProfile.target_career_id != None)
        )
        student_profiles = res_students.scalars().all()

        candidate_ranks: List[CandidateRankItemOut] = []
        now = datetime.now(timezone.utc)

        for sp in student_profiles:
            user = sp.user
            if not user or not user.is_active:
                continue

            target_career_name = sp.target_career.name if sp.target_career else "Unspecified Role"

            # Get current skill profile
            skill_report = await skill_profile_service.get_current_skill_profile(db, sp.id)
            student_skill_map = {s.skill_id: getattr(s, "score", getattr(s, "normalized_score", 0.0)) for s in skill_report.skills}


            detail = self.calculate_single_match(
                student_skill_map,
                sp.target_career_id,
                target_career_name,
                opp,
                weight_config
            )

            breakdown_out = OpportunityMatchBreakdownOut(
                skill_match_score=detail.skill_match_score,
                career_match_score=detail.career_match_score,
                required_skill_coverage=detail.required_skill_coverage,
                experience_fit=detail.experience_fit,
                overall_match_score=detail.match_score
            )

            classif_str = detail.match_classification.value if hasattr(detail.match_classification, "value") else str(detail.match_classification)
            prio_str = detail.priority.value if hasattr(detail.priority, "value") else str(detail.priority)

            candidate_ranks.append(
                CandidateRankItemOut(
                    student_profile_id=sp.id,
                    student_name=sp.full_name or user.email,
                    email=user.email,
                    target_career_name=target_career_name,

                    match_score=detail.match_score,
                    match_classification=classif_str,
                    priority=prio_str,
                    breakdown=breakdown_out,
                    matched_skills=detail.matched_skills,
                    partial_skills=detail.partial_skills,
                    missing_skills=detail.missing_skills,
                    critical_missing_skills=detail.critical_missing_skills,
                    reason=detail.reason,
                    generated_at=now
                )
            )

        candidate_ranks.sort(key=lambda x: x.match_score, reverse=True)
        top_candidates = candidate_ranks[:top_n]

        return OpportunityCandidateMatrixOut(
            opportunity_id=opp.id,
            opportunity_title=opp.title,
            organization_name=opp.organization_name,
            total_candidates_evaluated=len(candidate_ranks),
            top_candidates=top_candidates,
            evaluated_at=now
        )


matching_engine = MatchingEngine()
