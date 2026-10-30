"""add_student_skill_scores_table

Revision ID: f44f7b286b06
Revises: ecba38b11f86
Create Date: 2026-08-30 10:55:27.218425

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection


# revision identifiers, used by Alembic.
revision: str = 'f44f7b286b06'
down_revision: Union[str, None] = 'ecba38b11f86'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'student_skill_scores' not in tables:
        op.create_table(
            'student_skill_scores',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('student_profile_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('score', sa.Float(), nullable=False),
            sa.Column('proficiency_level', sa.String(length=50), nullable=False),
            sa.Column('source', sa.String(length=50), nullable=False),
            sa.Column('assessment_attempt_id', sa.UUID(), nullable=True),
            sa.Column('calculated_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['assessment_attempt_id'], ['assessment_attempts.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('student_profile_id', 'skill_id', name='uq_student_skill_score')
        )
        with op.batch_alter_table('student_skill_scores', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_student_skill_scores_assessment_attempt_id'), ['assessment_attempt_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_student_skill_scores_skill_id'), ['skill_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_student_skill_scores_source'), ['source'], unique=False)
            batch_op.create_index(batch_op.f('ix_student_skill_scores_student_profile_id'), ['student_profile_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'student_skill_scores' in tables:
        with op.batch_alter_table('student_skill_scores', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_student_skill_scores_student_profile_id'))
            batch_op.drop_index(batch_op.f('ix_student_skill_scores_source'))
            batch_op.drop_index(batch_op.f('ix_student_skill_scores_skill_id'))
            batch_op.drop_index(batch_op.f('ix_student_skill_scores_assessment_attempt_id'))
        op.drop_table('student_skill_scores')
