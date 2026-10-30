"""add_assessment_tables

Revision ID: ecba38b11f86
Revises: c668dbd3f5f4
Create Date: 2026-08-30 10:34:25.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection

revision: str = 'ecba38b11f86'
down_revision: Union[str, None] = 'c668dbd3f5f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    existing_tables = inspector.get_table_names()

    # 1. assessment_questions
    if 'assessment_questions' not in existing_tables:
        op.create_table(
            'assessment_questions',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('question_text', sa.Text(), nullable=False),
            sa.Column('question_type', sa.String(length=50), nullable=True, server_default='MCQ'),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('difficulty', sa.String(length=50), nullable=True, server_default='MEDIUM'),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('weight', sa.Float(), nullable=True, server_default='1.0'),
            sa.Column('explanation', sa.Text(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id']),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_assessment_questions_category', 'assessment_questions', ['category'])
        op.create_index('ix_assessment_questions_is_active', 'assessment_questions', ['is_active'])

    # 2. assessment_options
    if 'assessment_options' not in existing_tables:
        op.create_table(
            'assessment_options',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('question_id', sa.UUID(), nullable=False),
            sa.Column('option_text', sa.String(length=500), nullable=False),
            sa.Column('option_order', sa.Integer(), nullable=True, server_default='0'),
            sa.Column('is_correct', sa.Boolean(), nullable=True, server_default='0'),
            sa.ForeignKeyConstraint(['question_id'], ['assessment_questions.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_assessment_options_question_id', 'assessment_options', ['question_id'])

    # 3. assessment_attempts
    if 'assessment_attempts' not in existing_tables:
        op.create_table(
            'assessment_attempts',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('student_profile_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=True, server_default='IN_PROGRESS'),
            sa.Column('overall_score', sa.Float(), nullable=True),
            sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id']),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id']),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_assessment_attempts_student_profile_id', 'assessment_attempts', ['student_profile_id'])
        op.create_index('ix_assessment_attempts_career_role_id', 'assessment_attempts', ['career_role_id'])
        op.create_index('ix_assessment_attempts_status', 'assessment_attempts', ['status'])

    # 4. assessment_attempt_questions
    if 'assessment_attempt_questions' not in existing_tables:
        op.create_table(
            'assessment_attempt_questions',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('attempt_id', sa.UUID(), nullable=False),
            sa.Column('question_id', sa.UUID(), nullable=False),
            sa.Column('question_order', sa.Integer(), nullable=True, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['attempt_id'], ['assessment_attempts.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['question_id'], ['assessment_questions.id']),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('attempt_id', 'question_id', name='uq_attempt_question')
        )
        op.create_index('ix_assessment_attempt_questions_attempt_id', 'assessment_attempt_questions', ['attempt_id'])

    # 5. assessment_answers
    if 'assessment_answers' not in existing_tables:
        op.create_table(
            'assessment_answers',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('attempt_id', sa.UUID(), nullable=False),
            sa.Column('question_id', sa.UUID(), nullable=False),
            sa.Column('selected_option_id', sa.UUID(), nullable=True),
            sa.Column('is_correct', sa.Boolean(), nullable=True, server_default='0'),
            sa.Column('raw_score', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('weighted_score', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('answered_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['attempt_id'], ['assessment_attempts.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['question_id'], ['assessment_questions.id']),
            sa.ForeignKeyConstraint(['selected_option_id'], ['assessment_options.id']),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('attempt_id', 'question_id', name='uq_attempt_answer')
        )
        op.create_index('ix_assessment_answers_attempt_id', 'assessment_answers', ['attempt_id'])

    # 6. assessment_skill_scores
    if 'assessment_skill_scores' not in existing_tables:
        op.create_table(
            'assessment_skill_scores',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('attempt_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('earned_weight', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('available_weight', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('normalized_score', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('proficiency_level', sa.String(length=50), nullable=False),
            sa.ForeignKeyConstraint(['attempt_id'], ['assessment_attempts.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id']),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_assessment_skill_scores_attempt_id', 'assessment_skill_scores', ['attempt_id'])

    # 7. assessment_category_scores
    if 'assessment_category_scores' not in existing_tables:
        op.create_table(
            'assessment_category_scores',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('attempt_id', sa.UUID(), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=False),
            sa.Column('earned_weight', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('available_weight', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('normalized_score', sa.Float(), nullable=True, server_default='0.0'),
            sa.Column('proficiency_level', sa.String(length=50), nullable=False),
            sa.ForeignKeyConstraint(['attempt_id'], ['assessment_attempts.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_assessment_category_scores_attempt_id', 'assessment_category_scores', ['attempt_id'])


def downgrade() -> None:
    op.drop_table('assessment_category_scores')
    op.drop_table('assessment_skill_scores')
    op.drop_table('assessment_answers')
    op.drop_table('assessment_attempt_questions')
    op.drop_table('assessment_attempts')
    op.drop_table('assessment_options')
    op.drop_table('assessment_questions')
