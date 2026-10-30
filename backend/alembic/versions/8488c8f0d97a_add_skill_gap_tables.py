"""add_skill_gap_tables

Revision ID: 8488c8f0d97a
Revises: f44f7b286b06
Create Date: 2026-08-30 11:04:52.403120

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection


# revision identifiers, used by Alembic.
revision: str = '8488c8f0d97a'
down_revision: Union[str, None] = 'f44f7b286b06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'role_required_skills' not in tables:
        op.create_table(
            'role_required_skills',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('required_score', sa.Float(), nullable=False),
            sa.Column('importance', sa.String(length=50), nullable=False),
            sa.Column('is_required', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('career_role_id', 'skill_id', name='uq_role_required_skill')
        )
        with op.batch_alter_table('role_required_skills', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_role_required_skills_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_role_required_skills_skill_id'), ['skill_id'], unique=False)

    if 'skill_gap_snapshots' not in tables:
        op.create_table(
            'skill_gap_snapshots',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('student_profile_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('assessment_attempt_id', sa.UUID(), nullable=True),
            sa.Column('overall_gap_percentage', sa.Float(), nullable=False),
            sa.Column('total_required_skills', sa.Integer(), nullable=True),
            sa.Column('mastered_count', sa.Integer(), nullable=True),
            sa.Column('adequate_count', sa.Integer(), nullable=True),
            sa.Column('weak_count', sa.Integer(), nullable=True),
            sa.Column('missing_count', sa.Integer(), nullable=True),
            sa.Column('critical_gaps_count', sa.Integer(), nullable=True),
            sa.Column('high_priority_gaps_count', sa.Integer(), nullable=True),
            sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['assessment_attempt_id'], ['assessment_attempts.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('skill_gap_snapshots', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_skill_gap_snapshots_assessment_attempt_id'), ['assessment_attempt_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_skill_gap_snapshots_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_skill_gap_snapshots_student_profile_id'), ['student_profile_id'], unique=False)

    if 'skill_gap_snapshot_items' not in tables:
        op.create_table(
            'skill_gap_snapshot_items',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('snapshot_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('current_score', sa.Float(), nullable=True),
            sa.Column('required_score', sa.Float(), nullable=False),
            sa.Column('gap', sa.Float(), nullable=False),
            sa.Column('classification', sa.String(length=50), nullable=False),
            sa.Column('priority', sa.String(length=50), nullable=False),
            sa.Column('importance', sa.String(length=50), nullable=False),
            sa.Column('is_required', sa.Boolean(), nullable=False),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['snapshot_id'], ['skill_gap_snapshots.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('skill_gap_snapshot_items', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_skill_gap_snapshot_items_skill_id'), ['skill_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_skill_gap_snapshot_items_snapshot_id'), ['snapshot_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'skill_gap_snapshot_items' in tables:
        with op.batch_alter_table('skill_gap_snapshot_items', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_skill_gap_snapshot_items_snapshot_id'))
            batch_op.drop_index(batch_op.f('ix_skill_gap_snapshot_items_skill_id'))
        op.drop_table('skill_gap_snapshot_items')

    if 'skill_gap_snapshots' in tables:
        with op.batch_alter_table('skill_gap_snapshots', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_skill_gap_snapshots_student_profile_id'))
            batch_op.drop_index(batch_op.f('ix_skill_gap_snapshots_career_role_id'))
            batch_op.drop_index(batch_op.f('ix_skill_gap_snapshots_assessment_attempt_id'))
        op.drop_table('skill_gap_snapshots')

    if 'role_required_skills' in tables:
        with op.batch_alter_table('role_required_skills', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_role_required_skills_skill_id'))
            batch_op.drop_index(batch_op.f('ix_role_required_skills_career_role_id'))
        op.drop_table('role_required_skills')
