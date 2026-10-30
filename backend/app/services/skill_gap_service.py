import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.domain import (
    StudentProfile,
    CareerRole,
    Skill,
    RoleRequiredSkill,
    StudentSkillScore,
    SkillGapSnapshot,
    SkillGapSnapshotItem,
    AssessmentAttempt,
    AttemptStatus
)
from app.schemas.skill_gap import (
    RequiredSkillOut,
    CareerRoleRequiredSkillsOut,
    SkillGapItemOut,
    SkillGapSummaryOut,
    StudentSkillGapReportOut,
    SkillGapHistoryItemOut
)
from app.schemas.assessment import CareerRoleSimple


class SkillGapService:
    ADEQUATE_GAP_MAX: float = 10.0

    IMPORTANCE_WEIGHTS: Dict[str, int] = {
        "CRITICAL": 4,
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1
    }

    def classify_skill_gap(self, current_score: Optional[float], required_score: float) -> Tuple[str, float]:
        """
        Classifies skill gap based on current score vs required score.
        Returns tuple of (classification, gap).
        
        Rules:
        - MISSING: no assessed score exists (current_score is None). Gap = required_score.
        - MASTERED: current_score >= required_score. Gap = 0.0.
        - ADEQUATE: current_score >= required_score - ADEQUATE_GAP_MAX and < required_score. Gap = required_score - current_score.
        - WEAK: current_score < required_score - ADEQUATE_GAP_MAX (even if current_score == 0.0).
        """
        if current_score is None:
            return ("MISSING", float(required_score))

        if current_score >= required_score:
            return ("MASTERED", 0.0)

        gap = max(float(required_score - current_score), 0.0)

        if gap <= self.ADEQUATE_GAP_MAX:
            return ("ADEQUATE", gap)

        return ("WEAK", gap)

    def calculate_gap_priority(self, gap: float, importance: str, classification: str) -> str:
        """
        Calculates gap priority deterministically using importance weight and gap severity.
        """
        if classification == "MASTERED" or gap <= 0.0:
            return "NONE"

        imp_str = str(importance).upper() if importance else "HIGH"

        if classification == "MISSING":
            if imp_str == "CRITICAL":
                return "CRITICAL"
            elif imp_str == "HIGH":
                return "HIGH"
            elif imp_str == "MEDIUM":
                return "MEDIUM"
            else:
                return "LOW"

        imp_weight = self.IMPORTANCE_WEIGHTS.get(imp_str, 2)

        if gap >= 30.0:
            gap_severity = 4
        elif gap >= 20.0:
            gap_severity = 3
        elif gap >= 10.0:
            gap_severity = 2
        else:
            gap_severity = 1

        priority_score = imp_weight * gap_severity

        if priority_score >= 12:
            return "CRITICAL"
        elif priority_score >= 8:
            return "HIGH"
        elif priority_score >= 4:
            return "MEDIUM"
        else:
            return "LOW"

    async def get_role_required_skills(
        self, db: AsyncSession, career_role_id: uuid.UUID
    ) -> CareerRoleRequiredSkillsOut:
        """
        Retrieves target role required skills.
        """
        res_role = await db.execute(
            select(CareerRole).where(CareerRole.id == career_role_id)
        )
        career_role = res_role.scalars().first()
        if not career_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Career role not found"
            )

        res_reqs = await db.execute(
            select(RoleRequiredSkill)
            .options(selectinload(RoleRequiredSkill.skill))
            .where(RoleRequiredSkill.career_role_id == career_role_id)
        )
        req_list = res_reqs.scalars().all()

        skills_out = [
            RequiredSkillOut(
                skill_id=r.skill_id,
                skill_name=r.skill.name if r.skill else "Unknown Skill",
                required_score=r.required_score,
                importance=r.importance,
                is_required=r.is_required
            )
            for r in req_list
        ]

        return CareerRoleRequiredSkillsOut(
            career_role=CareerRoleSimple.model_validate(career_role),
            skills=skills_out
        )

    async def generate_skill_gap_report(
        self, db: AsyncSession, student_profile_id: uuid.UUID
    ) -> StudentSkillGapReportOut:
        """
        Generates comprehensive skill gap report for authenticated student.
        Compares current student skill scores against target role required skills.
        Saves traceable snapshot.
        """
        res_profile = await db.execute(
            select(StudentProfile)
            .options(selectinload(StudentProfile.target_career_role))
            .where(StudentProfile.id == student_profile_id)
        )
        student_profile = res_profile.scalars().first()
        if not student_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )

        if not student_profile.target_career_id or not student_profile.target_career_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target career role not selected. Please select a target career role first."
            )

        career_role = student_profile.target_career_role

        # Check latest submitted assessment attempt
        res_attempt = await db.execute(
            select(AssessmentAttempt)
            .where(
                AssessmentAttempt.student_profile_id == student_profile_id,
                AssessmentAttempt.status == AttemptStatus.SUBMITTED
            )
            .order_by(AssessmentAttempt.submitted_at.desc())
        )
        latest_attempt = res_attempt.scalars().first()

        # Retrieve role required skills
        res_reqs = await db.execute(
            select(RoleRequiredSkill)
            .options(selectinload(RoleRequiredSkill.skill))
            .where(RoleRequiredSkill.career_role_id == career_role.id)
        )
        role_reqs = res_reqs.scalars().all()

        if not role_reqs:
            # Role has no required skills configured yet
            return StudentSkillGapReportOut(
                career_role=CareerRoleSimple.model_validate(career_role),
                summary=SkillGapSummaryOut(),
                skills=[],
                generated_at=datetime.now(timezone.utc)
            )

        # Retrieve current student skill scores
        res_scores = await db.execute(
            select(StudentSkillScore)
            .options(selectinload(StudentSkillScore.skill))
            .where(StudentSkillScore.student_profile_id == student_profile_id)
        )
        student_scores_list = res_scores.scalars().all()
        student_scores_map = {s.skill_id: s.score for s in student_scores_list}

        gap_items: List[SkillGapItemOut] = []
        mastered_cnt = 0
        adequate_cnt = 0
        weak_cnt = 0
        missing_cnt = 0
        critical_gaps_cnt = 0
        high_priority_gaps_cnt = 0

        total_gap_points = 0.0
        total_max_required_points = 0.0

        for r in role_reqs:
            sk = r.skill
            current_score = student_scores_map.get(r.skill_id, None)

            classification, gap = self.classify_skill_gap(current_score, r.required_score)
            priority = self.calculate_gap_priority(gap, r.importance, classification)

            if classification == "MASTERED":
                mastered_cnt += 1
            elif classification == "ADEQUATE":
                adequate_cnt += 1
            elif classification == "WEAK":
                weak_cnt += 1
            elif classification == "MISSING":
                missing_cnt += 1

            if priority == "CRITICAL":
                critical_gaps_cnt += 1
            elif priority == "HIGH":
                high_priority_gaps_cnt += 1

            if r.is_required:
                total_max_required_points += float(r.required_score)
                effective_current = current_score if current_score is not None else 0.0
                total_gap_points += max(float(r.required_score - effective_current), 0.0)

            gap_items.append(
                SkillGapItemOut(
                    skill_id=r.skill_id,
                    skill_name=sk.name if sk else "Unknown Skill",
                    category=sk.category.value if sk and sk.category else "TECHNICAL",
                    current_score=current_score,
                    required_score=r.required_score,
                    gap=gap,
                    classification=classification,
                    priority=priority,
                    importance=r.importance,
                    is_required=r.is_required
                )
            )

        overall_gap_pct = (
            round((total_gap_points / total_max_required_points) * 100.0, 1)
            if total_max_required_points > 0
            else 0.0
        )

        # Sort gap items by Priority order (CRITICAL > HIGH > MEDIUM > LOW > NONE), then Gap desc, then Skill Name
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}
        gap_items.sort(key=lambda x: (priority_order.get(x.priority, 5), -x.gap, x.skill_name))

        summary = SkillGapSummaryOut(
            total_required_skills=len(role_reqs),
            mastered=mastered_cnt,
            adequate=adequate_cnt,
            weak=weak_cnt,
            missing=missing_cnt,
            critical_gaps=critical_gaps_cnt,
            high_priority_gaps=high_priority_gaps_cnt,
            overall_gap_percentage=overall_gap_pct
        )

        now = datetime.now(timezone.utc)

        # Create persistent gap snapshot
        snapshot = SkillGapSnapshot(
            student_profile_id=student_profile_id,
            career_role_id=career_role.id,
            assessment_attempt_id=latest_attempt.id if latest_attempt else None,
            overall_gap_percentage=overall_gap_pct,
            total_required_skills=len(role_reqs),
            mastered_count=mastered_cnt,
            adequate_count=adequate_cnt,
            weak_count=weak_cnt,
            missing_count=missing_cnt,
            critical_gaps_count=critical_gaps_cnt,
            high_priority_gaps_count=high_priority_gaps_cnt,
            generated_at=now
        )
        db.add(snapshot)
        await db.flush()

        for item in gap_items:
            snap_item = SkillGapSnapshotItem(
                snapshot_id=snapshot.id,
                skill_id=item.skill_id,
                current_score=item.current_score,
                required_score=item.required_score,
                gap=item.gap,
                classification=item.classification,
                priority=item.priority,
                importance=item.importance,
                is_required=item.is_required
            )
            db.add(snap_item)

        await db.commit()

        return StudentSkillGapReportOut(
            career_role=CareerRoleSimple.model_validate(career_role),
            summary=summary,
            skills=gap_items,
            generated_at=now
        )

    async def get_skill_gap_detail(
        self, db: AsyncSession, student_profile_id: uuid.UUID, skill_id: uuid.UUID
    ) -> SkillGapItemOut:
        """
        Retrieves gap detail for a specific skill for authenticated student.
        """
        report = await self.generate_skill_gap_report(db, student_profile_id)
        for item in report.skills:
            if item.skill_id == skill_id:
                return item

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill gap detail not found for the requested skill"
        )

    async def get_skill_gap_history(
        self, db: AsyncSession, student_profile_id: uuid.UUID
    ) -> List[SkillGapHistoryItemOut]:
        """
        Retrieves historical gap snapshots for authenticated student.
        """
        res_snaps = await db.execute(
            select(SkillGapSnapshot)
            .options(selectinload(SkillGapSnapshot.career_role))
            .where(SkillGapSnapshot.student_profile_id == student_profile_id)
            .order_by(SkillGapSnapshot.generated_at.desc())
        )
        snaps = res_snaps.scalars().all()

        return [
            SkillGapHistoryItemOut(
                snapshot_id=s.id,
                generated_at=s.generated_at,
                career_role_name=s.career_role.name if s.career_role else "Unknown Role",
                overall_gap_percentage=s.overall_gap_percentage,
                mastered=s.mastered_count,
                adequate=s.adequate_count,
                weak=s.weak_count,
                missing=s.missing_count
            )
            for s in snaps
        ]


skill_gap_service = SkillGapService()
