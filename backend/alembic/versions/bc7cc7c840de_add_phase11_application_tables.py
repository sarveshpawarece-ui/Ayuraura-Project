"""add_phase11_application_tables

Revision ID: bc7cc7c840de
Revises: 'c6e3b545535e'
Create Date: 2026-08-30 11:47:50.199868

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc7cc7c840de'
down_revision: Union[str, None] = 'c6e3b545535e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'application_status_history' not in tables:
        op.create_table(
            'application_status_history',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('application_id', sa.UUID(), nullable=False),
            sa.Column('old_status', sa.String(length=50), nullable=True),
            sa.Column('new_status', sa.String(length=50), nullable=False),
            sa.Column('changed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('changed_by', sa.String(length=100), nullable=False),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('application_status_history', schema=None) as batch_op:
            batch_op.create_index('ix_application_status_history_application_id', ['application_id'], unique=False)
            batch_op.create_index('ix_application_status_history_changed_at', ['changed_at'], unique=False)

    if 'applications' in tables:
        app_cols = [c['name'] for c in inspector.get_columns('applications')]
        with op.batch_alter_table('applications', schema=None) as batch_op:
            if 'student_profile_id' not in app_cols:
                batch_op.add_column(sa.Column('student_profile_id', sa.UUID(), nullable=True))
            if 'match_id' not in app_cols:
                batch_op.add_column(sa.Column('match_id', sa.UUID(), nullable=True))
            if 'application_deadline' not in app_cols:
                batch_op.add_column(sa.Column('application_deadline', sa.DateTime(timezone=True), nullable=True))
            if 'application_url' not in app_cols:
                batch_op.add_column(sa.Column('application_url', sa.String(length=500), nullable=True))
            if 'title_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('title_snapshot', sa.String(length=255), nullable=True))
            if 'organization_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('organization_snapshot', sa.String(length=255), nullable=True))
            if 'match_score_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('match_score_snapshot', sa.Float(), nullable=True))
            if 'skill_match_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('skill_match_snapshot', sa.Float(), nullable=True))
            if 'career_match_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('career_match_snapshot', sa.Float(), nullable=True))
            if 'coverage_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('coverage_snapshot', sa.Float(), nullable=True))
            if 'experience_fit_snapshot' not in app_cols:
                batch_op.add_column(sa.Column('experience_fit_snapshot', sa.Float(), nullable=True))
            if 'matching_algorithm_version' not in app_cols:
                batch_op.add_column(sa.Column('matching_algorithm_version', sa.String(length=20), nullable=True))
            if 'notes' not in app_cols:
                batch_op.add_column(sa.Column('notes', sa.Text(), nullable=True))
            if 'follow_up_date' not in app_cols:
                batch_op.add_column(sa.Column('follow_up_date', sa.Date(), nullable=True))
            if 'cover_letter_status' not in app_cols:
                batch_op.add_column(sa.Column('cover_letter_status', sa.String(length=50), nullable=True, server_default='NOT_REQUIRED'))
            if 'resume_version' not in app_cols:
                batch_op.add_column(sa.Column('resume_version', sa.String(length=100), nullable=True))
            if 'last_status_change_at' not in app_cols:
                batch_op.add_column(sa.Column('last_status_change_at', sa.DateTime(timezone=True), nullable=True))
            if 'created_at' not in app_cols:
                batch_op.add_column(sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    pass


    with op.batch_alter_table('assessment_answers', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('question_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('selected_option_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)
        batch_op.create_unique_constraint('uq_attempt_answer', ['attempt_id', 'question_id'])

    with op.batch_alter_table('assessment_attempt_questions', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('question_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('question_order',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.create_unique_constraint('uq_attempt_question', ['attempt_id', 'question_id'])

    with op.batch_alter_table('assessment_attempts', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('status',
               existing_type=sa.VARCHAR(length=11),
               nullable=True)

    with op.batch_alter_table('assessment_category_scores', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_options', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('question_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('option_text',
               existing_type=sa.TEXT(),
               type_=sa.String(length=500),
               existing_nullable=False)
        batch_op.alter_column('is_correct',
               existing_type=sa.BOOLEAN(),
               nullable=True)

    with op.batch_alter_table('assessment_questions', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('question_type',
               existing_type=sa.VARCHAR(length=13),
               type_=sa.Enum('MCQ', 'TRUE_FALSE', name='questiontype'),
               nullable=True)
        batch_op.alter_column('difficulty',
               existing_type=sa.VARCHAR(length=6),
               nullable=True)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('weight',
               existing_type=sa.FLOAT(),
               nullable=True)
        batch_op.alter_column('is_active',
               existing_type=sa.BOOLEAN(),
               nullable=True)
        batch_op.create_index(batch_op.f('ix_assessment_questions_category'), ['category'], unique=False)
        batch_op.create_index(batch_op.f('ix_assessment_questions_is_active'), ['is_active'], unique=False)

    with op.batch_alter_table('assessment_skill_scores', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.drop_index(batch_op.f('ix_assessment_skill_scores_skill_id'))

    with op.batch_alter_table('career_paths', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('career_roles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('career_skill_requirements', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('faculty_profiles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('institution_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('industry_opportunities', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('industry_profiles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('institution_profiles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resource_careers', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resource_skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resources', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('industry_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_type',
               existing_type=sa.VARCHAR(length=21),
               type_=sa.Enum('JOB', 'INTERNSHIP', 'RESEARCH', 'APPRENTICESHIP', 'PROJECT', 'WORKSHOP', name='opportunitytype'),
               existing_nullable=False)
        batch_op.alter_column('status',
               existing_type=sa.VARCHAR(length=6),
               type_=sa.Enum('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT', 'OPEN', 'CLOSED', 'FILLED', name='opportunitystatus'),
               existing_nullable=True)

    with op.batch_alter_table('opportunity_career_roles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_matches', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_required_skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('recommendations', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('refresh_tokens', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('role_required_skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('skill_gap_snapshot_items', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('snapshot_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('skill_gap_snapshots', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('assessment_attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)

    with op.batch_alter_table('skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('student_experiences', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('student_profiles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('institution_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)
        batch_op.alter_column('target_career_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'career_roles', ['target_career_id'], ['id'])

    with op.batch_alter_table('student_projects', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('student_skill_scores', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('assessment_attempt_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)

    with op.batch_alter_table('student_skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('student_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('student_skills', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('student_skill_scores', schema=None) as batch_op:
        batch_op.alter_column('assessment_attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=True)
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('student_projects', schema=None) as batch_op:
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('student_profiles', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'career_paths', ['target_career_id'], ['id'])
        batch_op.alter_column('target_career_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=True)
        batch_op.alter_column('institution_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=True)
        batch_op.alter_column('user_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('student_experiences', schema=None) as batch_op:
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('skills', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('skill_gap_snapshots', schema=None) as batch_op:
        batch_op.alter_column('assessment_attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=True)
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('skill_gap_snapshot_items', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('snapshot_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('role_required_skills', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('refresh_tokens', schema=None) as batch_op:
        batch_op.alter_column('user_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('recommendations', schema=None) as batch_op:
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_skills', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_required_skills', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_matches', schema=None) as batch_op:
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('opportunity_career_roles', schema=None) as batch_op:
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('opportunities', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=sa.Enum('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT', 'OPEN', 'CLOSED', 'FILLED', name='opportunitystatus'),
               type_=sa.VARCHAR(length=6),
               existing_nullable=True)
        batch_op.alter_column('opportunity_type',
               existing_type=sa.Enum('JOB', 'INTERNSHIP', 'RESEARCH', 'APPRENTICESHIP', 'PROJECT', 'WORKSHOP', name='opportunitytype'),
               type_=sa.VARCHAR(length=21),
               existing_nullable=False)
        batch_op.alter_column('industry_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resources', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resource_skills', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('learning_resource_careers', schema=None) as batch_op:
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('learning_resource_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('institution_profiles', schema=None) as batch_op:
        batch_op.alter_column('user_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('industry_profiles', schema=None) as batch_op:
        batch_op.alter_column('user_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('industry_opportunities', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('faculty_profiles', schema=None) as batch_op:
        batch_op.alter_column('institution_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('user_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('career_skill_requirements', schema=None) as batch_op:
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('career_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('career_roles', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('career_paths', schema=None) as batch_op:
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_skill_scores', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_assessment_skill_scores_skill_id'), ['skill_id'], unique=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_questions', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_assessment_questions_is_active'))
        batch_op.drop_index(batch_op.f('ix_assessment_questions_category'))
        batch_op.alter_column('is_active',
               existing_type=sa.BOOLEAN(),
               nullable=False)
        batch_op.alter_column('weight',
               existing_type=sa.FLOAT(),
               nullable=False)
        batch_op.alter_column('skill_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('difficulty',
               existing_type=sa.VARCHAR(length=6),
               nullable=False)
        batch_op.alter_column('question_type',
               existing_type=sa.Enum('MCQ', 'TRUE_FALSE', name='questiontype'),
               type_=sa.VARCHAR(length=13),
               nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_options', schema=None) as batch_op:
        batch_op.alter_column('is_correct',
               existing_type=sa.BOOLEAN(),
               nullable=False)
        batch_op.alter_column('option_text',
               existing_type=sa.String(length=500),
               type_=sa.TEXT(),
               existing_nullable=False)
        batch_op.alter_column('question_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_category_scores', schema=None) as batch_op:
        batch_op.alter_column('attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_attempts', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=sa.VARCHAR(length=11),
               nullable=False)
        batch_op.alter_column('career_role_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('student_profile_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_attempt_questions', schema=None) as batch_op:
        batch_op.drop_constraint('uq_attempt_question', type_='unique')
        batch_op.alter_column('question_order',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('question_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('assessment_answers', schema=None) as batch_op:
        batch_op.drop_constraint('uq_attempt_answer', type_='unique')
        batch_op.alter_column('selected_option_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=True)
        batch_op.alter_column('question_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('attempt_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)

    with op.batch_alter_table('applications', schema=None) as batch_op:
        batch_op.add_column(sa.Column('fit_score', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('student_id', sa.NUMERIC(), nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(None, 'opportunities', ['opportunity_id'], ['id'])
        batch_op.create_foreign_key(None, 'student_profiles', ['student_id'], ['id'])
        batch_op.drop_constraint('uq_student_opportunity_app', type_='unique')
        batch_op.drop_index(batch_op.f('ix_applications_updated_at'))
        batch_op.drop_index(batch_op.f('ix_applications_student_profile_id'))
        batch_op.drop_index(batch_op.f('ix_applications_status'))
        batch_op.drop_index(batch_op.f('ix_applications_opportunity_id'))
        batch_op.drop_index(batch_op.f('ix_applications_applied_at'))
        batch_op.drop_index(batch_op.f('ix_applications_application_deadline'))
        batch_op.alter_column('status',
               existing_type=sa.VARCHAR(length=12),
               nullable=True)
        batch_op.alter_column('opportunity_id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.alter_column('id',
               existing_type=sa.UUID(),
               type_=sa.NUMERIC(),
               existing_nullable=False)
        batch_op.drop_column('created_at')
        batch_op.drop_column('last_status_change_at')
        batch_op.drop_column('resume_version')
        batch_op.drop_column('cover_letter_status')
        batch_op.drop_column('follow_up_date')
        batch_op.drop_column('notes')
        batch_op.drop_column('matching_algorithm_version')
        batch_op.drop_column('experience_fit_snapshot')
        batch_op.drop_column('coverage_snapshot')
        batch_op.drop_column('career_match_snapshot')
        batch_op.drop_column('skill_match_snapshot')
        batch_op.drop_column('match_score_snapshot')
        batch_op.drop_column('organization_snapshot')
        batch_op.drop_column('title_snapshot')
        batch_op.drop_column('application_url')
        batch_op.drop_column('application_deadline')
        batch_op.drop_column('match_id')
        batch_op.drop_column('student_profile_id')

    op.create_table('_alembic_tmp_applications',
    sa.Column('id', sa.NUMERIC(), nullable=False),
    sa.Column('opportunity_id', sa.NUMERIC(), nullable=False),
    sa.Column('student_id', sa.NUMERIC(), nullable=False),
    sa.Column('fit_score', sa.FLOAT(), nullable=True),
    sa.Column('status', sa.VARCHAR(length=12), nullable=True),
    sa.Column('applied_at', sa.DATETIME(), nullable=True),
    sa.Column('updated_at', sa.DATETIME(), nullable=True),
    sa.ForeignKeyConstraint(['opportunity_id'], ['opportunities.id'], ),
    sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('application_status_history', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_application_status_history_changed_at'))
        batch_op.drop_index(batch_op.f('ix_application_status_history_application_id'))

    op.drop_table('application_status_history')
    # ### end Alembic commands ###
