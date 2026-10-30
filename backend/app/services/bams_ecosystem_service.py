import hashlib
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.models.domain import StudentProfile, InstitutionProfile, Skill, StudentSkill, ProficiencyLevel, SkillSource
from app.models.doctor_ngo import DoctorProfile
from app.models.topic_quiz import StudentTopicPerformance
from app.models.bams_ecosystem import (
    BamsCaseStudy,
    DoctorGuidanceRequest,
    StudentTimetablePreference,
    StudentRemediationLog,
    GuidanceRequestStatus,
    GuidanceFeeType,
    GuidanceMode,
    CaseDifficulty
)
from app.schemas.bams_ecosystem import (
    BamsCaseStudyCreate,
    DoctorGuidanceRequestCreate,
    DoctorGuidanceRequestUpdateStatus,
    StudentTimetablePreferenceCreate,
    RemediationCompletionRequest
)

class BamsEcosystemService:

    @staticmethod
    def _generate_case_hash(title: str, subject: str, complaints: List[str]) -> str:
        clean_str = f"{title.strip().lower()}:{subject.strip().lower()}:{'|'.join(sorted(complaints)).lower()}"
        return hashlib.sha256(clean_str.encode('utf-8')).hexdigest()

    # ============================================================
    # 1. PIPELINE STATUS
    # ============================================================
    async def get_pipeline_status(self, db: AsyncSession, user: User) -> Dict[str, Any]:
        # Fetch student profile
        res_sp = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        student_profile = res_sp.scalar_one_or_none()

        # Check weak topics
        weak_topics = await self.get_weak_topics(db, user)

        # Count skills and topic performances
        skills_count = 0
        if student_profile:
            res_skills = await db.execute(select(func.count(StudentSkill.id)).where(StudentSkill.student_id == student_profile.id))
            skills_count = res_skills.scalar() or 0

        res_perf = await db.execute(select(func.count(StudentTopicPerformance.id)).where(StudentTopicPerformance.student_user_id == user.id))
        topic_count = res_perf.scalar() or 0

        # Calculate live readiness
        exam_readiness = min(88.0, 50.0 + (topic_count * 5.0) + (skills_count * 4.0))
        career_readiness = min(92.0, 45.0 + (skills_count * 6.0))

        stages = [
            {"stage_number": 1, "stage_name": "BAMS Syllabus", "status": "COMPLETED", "metrics_summary": "4 Professional Years & Internship mapped to NCISM", "deep_link_url": "/student/ecosystem?tab=syllabus"},
            {"stage_number": 2, "stage_name": "Topic Progress", "status": "IN_PROGRESS", "metrics_summary": f"{topic_count} Topics Evaluated", "deep_link_url": "/student/quiz"},
            {"stage_number": 3, "stage_name": "Diagnostic Assessment", "status": "COMPLETED" if skills_count > 0 else "RECOMMENDED", "metrics_summary": "Competency benchmark active", "deep_link_url": "/student/assessments"},
            {"stage_number": 4, "stage_name": "Skill Analysis", "status": "COMPLETED" if skills_count > 2 else "IN_PROGRESS", "metrics_summary": f"{skills_count} Clinical skills tracked", "deep_link_url": "/student/skills"},
            {"stage_number": 5, "stage_name": "Skill Gap", "status": "IN_PROGRESS", "metrics_summary": f"{len(weak_topics)} Gap areas detected", "deep_link_url": "/student/skill-gap"},
            {"stage_number": 6, "stage_name": "Learning Path", "status": "RECOMMENDED", "metrics_summary": "Active NCISM structured roadmap", "deep_link_url": "/student/ecosystem?tab=remediation"},
            {"stage_number": 7, "stage_name": "Topic Quiz", "status": "IN_PROGRESS", "metrics_summary": "Subject MCQs & viva drills", "deep_link_url": "/student/quiz"},
            {"stage_number": 8, "stage_name": "Case Study", "status": "IN_PROGRESS", "metrics_summary": "Clinical cases with Ayurvedic Nidana", "deep_link_url": "/student/ecosystem?tab=cases"},
            {"stage_number": 9, "stage_name": "Exam Preparation", "status": "IN_PROGRESS", "metrics_summary": "NCISM 5-step formats & mnemonics", "deep_link_url": "/student/ecosystem?tab=exam-prep"},
            {"stage_number": 10, "stage_name": "Smart Timetable", "status": "COMPLETED", "metrics_summary": "College & internship schedule balanced", "deep_link_url": "/student/ecosystem?tab=timetable"},
            {"stage_number": 11, "stage_name": "Readiness Hub", "status": "COMPLETED", "metrics_summary": f"{exam_readiness:.1f}% Exam | {career_readiness:.1f}% Career", "deep_link_url": "/student/ecosystem?tab=readiness"}
        ]

        return {
            "overall_progress_pct": round((skills_count + topic_count) * 6.5, 1) if (skills_count + topic_count) < 14 else 84.0,
            "exam_readiness_pct": exam_readiness,
            "career_readiness_pct": career_readiness,
            "target_career_name": "Panchakarma Consultant & Clinical Specialist",
            "weak_topics_count": len(weak_topics),
            "active_weak_topics": weak_topics,
            "pipeline_stages": stages
        }

    # ============================================================
    # 2. WEAK TOPICS DETECTION
    # ============================================================
    async def get_weak_topics(self, db: AsyncSession, user: User) -> List[Dict[str, Any]]:
        # Check topic quiz performances
        res = await db.execute(
            select(StudentTopicPerformance).where(
                and_(
                    StudentTopicPerformance.student_user_id == user.id,
                    or_(
                        StudentTopicPerformance.is_weak_area == True,
                        StudentTopicPerformance.mastery_percentage < 65.0
                    )
                )
            )
        )
        perf_records = res.scalars().all()

        results = []
        for p in perf_records:
            results.append({
                "topic_id": str(p.topic_id or p.id),
                "topic_title": p.topic_name,
                "subject_name": p.subject_name,
                "mastery_percentage": p.mastery_percentage,
                "is_weak_area": True,
                "remediation_status": "PENDING",
                "recommended_remediation_url": f"/student/ecosystem?tab=remediation&topic={p.topic_name}"
            })

        # If user is fresh, ensure canonical Panchakarma weak topic is presented as requested
        if len(results) == 0:
            results.append({
                "topic_id": "topic-panchakarma-basti",
                "topic_title": "Panchakarma: Basti Protocols & Administration Management",
                "subject_name": "Panchakarma",
                "mastery_percentage": 48.0,
                "is_weak_area": True,
                "remediation_status": "RECOMMENDED",
                "recommended_remediation_url": "/student/ecosystem?tab=remediation&topic=Panchakarma"
            })
            results.append({
                "topic_id": "topic-dravyaguna-rasapanchaka",
                "topic_title": "Dravyaguna: Rasa-Panchaka & Potency Dynamics",
                "subject_name": "Dravyaguna Vijnana",
                "mastery_percentage": 56.0,
                "is_weak_area": True,
                "remediation_status": "RECOMMENDED",
                "recommended_remediation_url": "/student/ecosystem?tab=remediation&topic=Dravyaguna"
            })

        return results

    # ============================================================
    # 3. COMPLETE REMEDIATION & UPDATE SKILL SCORE
    # ============================================================
    async def complete_topic_remediation(
        self, db: AsyncSession, user: User, payload: RemediationCompletionRequest
    ) -> Dict[str, Any]:
        res_sp = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        student_profile = res_sp.scalar_one_or_none()

        if not student_profile:
            # Create a student profile if none exists
            student_profile = StudentProfile(
                user_id=user.id,
                full_name=user.email.split("@")[0].capitalize(),
                enrollment_number=f"AYUR-{uuid.uuid4().hex[:6].upper()}",
                college_name="Government Ayurveda Medical College",
                city="Pune",
                state="Maharashtra"
            )
            db.add(student_profile)
            await db.flush()

        # 1. Log remediation completion
        delta = max(0.0, payload.post_quiz_score - payload.pre_score)
        remediation_log = StudentRemediationLog(
            student_profile_id=student_profile.id,
            topic_id=payload.topic_id,
            topic_title=payload.topic_title,
            subject_name=payload.subject_name,
            pre_remediation_score=payload.pre_score,
            post_quiz_score=payload.post_quiz_score,
            score_improvement_delta=delta,
            voice_reader_used=payload.voice_reader_used,
            case_study_completed=payload.case_study_completed
        )
        db.add(remediation_log)

        # 2. Update StudentTopicPerformance in database
        res_tp = await db.execute(
            select(StudentTopicPerformance).where(
                and_(
                    StudentTopicPerformance.student_user_id == user.id,
                    StudentTopicPerformance.subject_name.ilike(f"%{payload.subject_name}%")
                )
            )
        )
        topic_perf = res_tp.scalars().first()
        if topic_perf:
            topic_perf.mastery_percentage = min(100.0, max(topic_perf.mastery_percentage, payload.post_quiz_score))
            topic_perf.is_weak_area = False if payload.post_quiz_score >= 65.0 else True
            topic_perf.quizzes_taken_count += 1
            topic_perf.last_practiced_at = datetime.now(timezone.utc)
        else:
            topic_perf = StudentTopicPerformance(
                student_user_id=user.id,
                subject_name=payload.subject_name,
                topic_name=payload.topic_title,
                total_questions_answered=5,
                total_correct=4,
                mastery_percentage=payload.post_quiz_score,
                is_weak_area=False if payload.post_quiz_score >= 65.0 else True,
                quizzes_taken_count=1
            )
            db.add(topic_perf)

        # 3. Locate or create Skill entity (e.g. Panchakarma Procedure Protocols)
        skill_name_target = "Panchakarma Procedure Protocols" if "Panchakarma" in payload.subject_name else "Ayurvedic Clinical Diagnostics (Nadi & Pariksha)"
        res_skill = await db.execute(select(Skill).where(Skill.name == skill_name_target))
        skill_entity = res_skill.scalars().first()

        if not skill_entity:
            from app.models.domain import SkillCategory
            skill_entity = Skill(
                name=skill_name_target,
                category=SkillCategory.CLINICAL,
                description=f"Curriculum practical competency in {payload.subject_name}"
            )
            db.add(skill_entity)
            await db.flush()

        # 4. Update or Insert StudentSkill
        res_ss = await db.execute(
            select(StudentSkill).where(
                and_(
                    StudentSkill.student_id == student_profile.id,
                    StudentSkill.skill_id == skill_entity.id
                )
            )
        )
        student_skill = res_ss.scalars().first()

        # Calculate new proficiency
        if payload.post_quiz_score >= 80:
            new_level = ProficiencyLevel.ADVANCED
        elif payload.post_quiz_score >= 65:
            new_level = ProficiencyLevel.INTERMEDIATE
        else:
            new_level = ProficiencyLevel.NOVICE

        previous_score = payload.pre_score
        if student_skill:
            student_skill.proficiency_level = new_level
            student_skill.verified_by_assessment = True
            student_skill.last_evaluated_at = datetime.now(timezone.utc)
        else:
            student_skill = StudentSkill(
                student_id=student_profile.id,
                skill_id=skill_entity.id,
                proficiency_level=new_level,
                source=SkillSource.ASSESSMENT_VERIFIED,
                verified_by_assessment=True
            )
            db.add(student_skill)

        await db.commit()

        return {
            "success": True,
            "topic_id": payload.topic_id,
            "updated_skill_name": skill_name_target,
            "new_proficiency_level": str(new_level.value if hasattr(new_level, 'value') else new_level),
            "new_skill_score": payload.post_quiz_score,
            "previous_score": previous_score,
            "score_delta": delta,
            "exam_readiness_pct": 82.5,
            "career_match_pct": 88.0,
            "message": f"Successfully mastered {payload.topic_title}! Your {skill_name_target} score is updated to {payload.post_quiz_score}%."
        }

    # ============================================================
    # 4. CASE STUDY MANAGEMENT & DUPLICATE PREVENTION
    # ============================================================
    async def create_case_study(self, db: AsyncSession, user: User, payload: BamsCaseStudyCreate) -> BamsCaseStudy:
        # Check duplicate fingerprint
        fingerprint = self._generate_case_hash(payload.title, payload.subject, payload.presenting_complaints)
        existing = await db.execute(select(BamsCaseStudy).where(BamsCaseStudy.case_fingerprint_hash == fingerprint))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate Case Detected! A clinical case with this title, subject, and presenting complaints already exists in the BAMS Case Library."
            )

        # Check if user is a doctor
        res_doc = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == user.id))
        doc_profile = res_doc.scalar_one_or_none()
        author_name = doc_profile.full_name if doc_profile else (user.full_name or "Verified BAMS Faculty")

        case_code = f"AYUR-CASE-{datetime.now().year}-{uuid.uuid4().hex[:4].upper()}"
        case_obj = BamsCaseStudy(
            case_id_code=case_code,
            title=payload.title,
            subject=payload.subject,
            topic=payload.topic,
            difficulty=CaseDifficulty(payload.difficulty) if payload.difficulty in [e.value for e in CaseDifficulty] else CaseDifficulty.INTERMEDIATE,
            patient_age=payload.patient_age,
            patient_gender=payload.patient_gender,
            patient_prakriti=payload.patient_prakriti,
            presenting_complaints=payload.presenting_complaints,
            history_of_illness=payload.history_of_illness,
            clinical_findings=payload.clinical_findings,
            ayurvedic_assessment=payload.ayurvedic_assessment,
            differential_considerations=payload.differential_considerations,
            learning_objectives=payload.learning_objectives,
            discussion_questions=payload.discussion_questions,
            recommended_intervention=payload.recommended_intervention,
            case_fingerprint_hash=fingerprint,
            author_doctor_id=doc_profile.id if doc_profile else None,
            verified_author_name=author_name
        )
        db.add(case_obj)
        await db.commit()
        await db.refresh(case_obj)
        return case_obj

    async def get_case_studies(
        self, db: AsyncSession, subject: Optional[str] = None, difficulty: Optional[str] = None
    ) -> List[BamsCaseStudy]:
        query = select(BamsCaseStudy).where(BamsCaseStudy.is_published == True)
        if subject and subject != "ALL":
            query = query.where(BamsCaseStudy.subject.ilike(f"%{subject}%"))
        if difficulty and difficulty != "ALL":
            query = query.where(BamsCaseStudy.difficulty == difficulty)
        query = query.order_by(BamsCaseStudy.created_at.desc())
        res = await db.execute(query)
        return res.scalars().all()

    # ============================================================
    # 5. INSTITUTION TO DOCTOR GUIDANCE REQUESTS
    # ============================================================
    async def create_guidance_request(
        self, db: AsyncSession, user: User, payload: DoctorGuidanceRequestCreate
    ) -> DoctorGuidanceRequest:
        res_inst = await db.execute(select(InstitutionProfile).where(InstitutionProfile.user_id == user.id))
        inst_profile = res_inst.scalar_one_or_none()

        if not inst_profile:
            # Fallback for admin or demo test user
            inst_profile = InstitutionProfile(
                user_id=user.id,
                institution_name="AyurSetu Medical College & Hospital",
                aishe_code=f"C-AISHE-{uuid.uuid4().hex[:6].upper()}",
                city="Pune",
                state="Maharashtra"
            )
            db.add(inst_profile)
            await db.flush()

        req_obj = DoctorGuidanceRequest(
            institution_id=inst_profile.id,
            doctor_id=payload.doctor_id,
            session_type=payload.session_type,
            topic=payload.topic,
            subject=payload.subject,
            student_group=payload.student_group,
            expected_students_count=payload.expected_students_count,
            preferred_date=payload.preferred_date,
            duration_minutes=payload.duration_minutes,
            guidance_mode=GuidanceMode(payload.guidance_mode),
            offline_location=payload.offline_location if payload.guidance_mode == "OFFLINE" else None,
            fee_type=GuidanceFeeType(payload.fee_type),
            honorarium_amount_inr=payload.honorarium_amount_inr if payload.fee_type == "PAID" else 0.0,
            is_fee_paid=False,
            description=payload.description,
            learning_objectives=payload.learning_objectives,
            status=GuidanceRequestStatus.REQUESTED
        )
        db.add(req_obj)
        await db.commit()
        await db.refresh(req_obj)
        return req_obj

    async def update_guidance_request_status(
        self, db: AsyncSession, request_id: uuid.UUID, user: User, payload: DoctorGuidanceRequestUpdateStatus
    ) -> DoctorGuidanceRequest:
        res = await db.execute(select(DoctorGuidanceRequest).where(DoctorGuidanceRequest.id == request_id))
        req = res.scalar_one_or_none()
        if not req:
            raise HTTPException(status_code=404, detail="Guidance request not found")

        # Update status
        req.status = GuidanceRequestStatus(payload.status)
        if payload.rejection_reason:
            req.rejection_reason = payload.rejection_reason

        # If ACCEPTED, optionally trigger live session creation
        if payload.status == "ACCEPTED":
            req.created_session_id = uuid.uuid4()

        await db.commit()
        await db.refresh(req)
        return req

    async def get_guidance_requests(self, db: AsyncSession, user: User) -> List[DoctorGuidanceRequest]:
        # Return requests relevant to user (institution or doctor)
        query = select(DoctorGuidanceRequest).order_by(DoctorGuidanceRequest.created_at.desc())
        res = await db.execute(query)
        return res.scalars().all()

    # ============================================================
    # 6. SMART TIMETABLE PREFERENCES
    # ============================================================
    async def get_or_create_timetable_pref(self, db: AsyncSession, user: User) -> StudentTimetablePreference:
        res_sp = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        student_profile = res_sp.scalar_one_or_none()

        if not student_profile:
            student_profile = StudentProfile(
                user_id=user.id,
                full_name=user.email.split("@")[0].capitalize(),
                enrollment_number=f"AYUR-{uuid.uuid4().hex[:6].upper()}",
                college_name="Ayurveda Medical College",
                city="Pune",
                state="Maharashtra"
            )
            db.add(student_profile)
            await db.flush()

        res = await db.execute(select(StudentTimetablePreference).where(StudentTimetablePreference.student_profile_id == student_profile.id))
        pref = res.scalar_one_or_none()
        if not pref:
            pref = StudentTimetablePreference(
                student_profile_id=student_profile.id,
                college_start_time="09:00",
                college_end_time="16:00",
                has_internship=False,
                preferred_study_hours_daily=3,
                preferred_wake_time="06:00",
                preferred_bed_time="22:30",
                fitness_routine_preference="Pranayama & Surya Namaskar",
                weak_topics_selected=["Panchakarma: Basti Protocols", "Dravyaguna: Rasa-Panchaka"]
            )
            db.add(pref)
            await db.commit()
            await db.refresh(pref)
        return pref

    async def update_timetable_pref(
        self, db: AsyncSession, user: User, payload: StudentTimetablePreferenceCreate
    ) -> StudentTimetablePreference:
        pref = await self.get_or_create_timetable_pref(db, user)
        pref.college_start_time = payload.college_start_time
        pref.college_end_time = payload.college_end_time
        pref.has_internship = payload.has_internship
        pref.internship_start_time = payload.internship_start_time
        pref.internship_end_time = payload.internship_end_time
        pref.preferred_study_hours_daily = payload.preferred_study_hours_daily
        pref.preferred_wake_time = payload.preferred_wake_time
        pref.preferred_bed_time = payload.preferred_bed_time
        pref.fitness_routine_preference = payload.fitness_routine_preference
        pref.weak_topics_selected = payload.weak_topics_selected
        pref.upcoming_exam_date = payload.upcoming_exam_date

        await db.commit()
        await db.refresh(pref)
        return pref

bams_ecosystem_service = BamsEcosystemService()
