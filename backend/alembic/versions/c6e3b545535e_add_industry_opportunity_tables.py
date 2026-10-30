"""add_industry_opportunity_tables

Revision ID: c6e3b545535e
Revises: ca3ee6bac89d
Create Date: 2026-08-30 11:27:38.297378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection


# revision identifiers, used by Alembic.
revision: str = 'c6e3b545535e'
down_revision: Union[str, None] = 'ca3ee6bac89d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'industry_opportunities' not in tables:
        op.create_table(
            'industry_opportunities',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('responsibilities', sa.Text(), nullable=True),
            sa.Column('requirements', sa.Text(), nullable=True),
            sa.Column('opportunity_type', sa.Enum('JOB', 'INTERNSHIP', 'RESEARCH', 'APPRENTICESHIP', 'PROJECT', 'WORKSHOP', name='opportunitytype'), nullable=False),
            sa.Column('organization_name', sa.String(length=255), nullable=False),
            sa.Column('organization_description', sa.Text(), nullable=True),
            sa.Column('location_text', sa.String(length=255), nullable=True),
            sa.Column('city', sa.String(length=100), nullable=True),
            sa.Column('state', sa.String(length=100), nullable=True),
            sa.Column('country', sa.String(length=100), nullable=False),
            sa.Column('work_mode', sa.Enum('ONSITE', 'REMOTE', 'HYBRID', 'UNKNOWN', name='workmode'), nullable=False),
            sa.Column('employment_type', sa.Enum('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FELLOWSHIP', 'PROJECT_BASED', 'UNKNOWN', name='employmenttype'), nullable=False),
            sa.Column('experience_level', sa.Enum('ENTRY', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERIENCED', 'STUDENT', 'FRESHER', 'UNKNOWN', name='experiencelevel'), nullable=False),
            sa.Column('application_url', sa.String(length=500), nullable=True),
            sa.Column('source_name', sa.String(length=150), nullable=False),
            sa.Column('source_url', sa.String(length=500), nullable=True),
            sa.Column('source_type', sa.Enum('INTERNAL', 'EXTERNAL', 'DEMO', name='opportunitysourcetype'), nullable=False),
            sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True),
            sa.Column('start_date', sa.Date(), nullable=True),
            sa.Column('end_date', sa.Date(), nullable=True),
            sa.Column('salary_min', sa.Float(), nullable=True),
            sa.Column('salary_max', sa.Float(), nullable=True),
            sa.Column('salary_currency', sa.String(length=10), nullable=False),
            sa.Column('is_salary_disclosed', sa.Boolean(), nullable=False),
            sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT', 'OPEN', 'CLOSED', 'FILLED', name='opportunitystatus'), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('industry_opportunities', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_industry_opportunities_application_deadline'), ['application_deadline'], unique=False)
            batch_op.create_index(batch_op.f('ix_industry_opportunities_opportunity_type'), ['opportunity_type'], unique=False)
            batch_op.create_index(batch_op.f('ix_industry_opportunities_status'), ['status'], unique=False)
            batch_op.create_index(batch_op.f('ix_industry_opportunities_work_mode'), ['work_mode'], unique=False)

    if 'opportunity_required_skills' not in tables:
        op.create_table(
            'opportunity_required_skills',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('opportunity_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('required_score', sa.Float(), nullable=False),
            sa.Column('importance', sa.String(length=50), nullable=False),
            sa.Column('is_required', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['opportunity_id'], ['industry_opportunities.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('opportunity_id', 'skill_id', name='uq_opp_required_skill')
        )
        with op.batch_alter_table('opportunity_required_skills', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_opportunity_required_skills_opportunity_id'), ['opportunity_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_required_skills_skill_id'), ['skill_id'], unique=False)

    if 'opportunity_career_roles' not in tables:
        op.create_table(
            'opportunity_career_roles',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('opportunity_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('relevance_weight', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['opportunity_id'], ['industry_opportunities.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('opportunity_id', 'career_role_id', name='uq_opp_career_role')
        )
        with op.batch_alter_table('opportunity_career_roles', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_opportunity_career_roles_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_career_roles_opportunity_id'), ['opportunity_id'], unique=False)

    if 'opportunity_matches' not in tables:
        op.create_table(
            'opportunity_matches',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('student_profile_id', sa.UUID(), nullable=False),
            sa.Column('opportunity_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('match_score', sa.Float(), nullable=False),
            sa.Column('match_classification', sa.Enum('EXCELLENT', 'GOOD', 'PARTIAL', 'LOW', name='matchclassification'), nullable=False),
            sa.Column('priority', sa.Enum('HIGH', 'MEDIUM', 'LOW', name='matchpriority'), nullable=False),
            sa.Column('skill_match_score', sa.Float(), nullable=False),
            sa.Column('career_match_score', sa.Float(), nullable=False),
            sa.Column('required_skill_coverage', sa.Float(), nullable=False),
            sa.Column('experience_fit', sa.Float(), nullable=False),
            sa.Column('matched_skill_count', sa.Integer(), nullable=True),
            sa.Column('partial_skill_count', sa.Integer(), nullable=True),
            sa.Column('missing_skill_count', sa.Integer(), nullable=True),
            sa.Column('critical_missing_skill_count', sa.Integer(), nullable=True),
            sa.Column('reason', sa.Text(), nullable=False),
            sa.Column('status', sa.Enum('ACTIVE', 'DISMISSED', 'OUTDATED', 'EXPIRED', name='matchstatus'), nullable=False),
            sa.Column('matching_algorithm_version', sa.String(length=20), nullable=False),
            sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['opportunity_id'], ['industry_opportunities.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('student_profile_id', 'opportunity_id', 'career_role_id', name='uq_student_opp_match')
        )
        with op.batch_alter_table('opportunity_matches', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_opportunity_matches_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_matches_match_score'), ['match_score'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_matches_opportunity_id'), ['opportunity_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_matches_status'), ['status'], unique=False)
            batch_op.create_index(batch_op.f('ix_opportunity_matches_student_profile_id'), ['student_profile_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'opportunity_matches' in tables:
        with op.batch_alter_table('opportunity_matches', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_opportunity_matches_student_profile_id'))
            batch_op.drop_index(batch_op.f('ix_opportunity_matches_status'))
            batch_op.drop_index(batch_op.f('ix_opportunity_matches_opportunity_id'))
            batch_op.drop_index(batch_op.f('ix_opportunity_matches_match_score'))
            batch_op.drop_index(batch_op.f('ix_opportunity_matches_career_role_id'))
        op.drop_table('opportunity_matches')

    if 'opportunity_career_roles' in tables:
        with op.batch_alter_table('opportunity_career_roles', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_opportunity_career_roles_opportunity_id'))
            batch_op.drop_index(batch_op.f('ix_opportunity_career_roles_career_role_id'))
        op.drop_table('opportunity_career_roles')

    if 'opportunity_required_skills' in tables:
        with op.batch_alter_table('opportunity_required_skills', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_opportunity_required_skills_skill_id'))
            batch_op.drop_index(batch_op.f('ix_opportunity_required_skills_opportunity_id'))
        op.drop_table('opportunity_required_skills')

    if 'industry_opportunities' in tables:
        with op.batch_alter_table('industry_opportunities', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_industry_opportunities_work_mode'))
            batch_op.drop_index(batch_op.f('ix_industry_opportunities_status'))
            batch_op.drop_index(batch_op.f('ix_industry_opportunities_opportunity_type'))
            batch_op.drop_index(batch_op.f('ix_industry_opportunities_application_deadline'))
        op.drop_table('industry_opportunities')
