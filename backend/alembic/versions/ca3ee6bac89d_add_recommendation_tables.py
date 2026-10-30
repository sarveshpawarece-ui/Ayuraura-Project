"""add_recommendation_tables

Revision ID: ca3ee6bac89d
Revises: 8488c8f0d97a
Create Date: 2026-08-30 11:13:25.297378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection


# revision identifiers, used by Alembic.
revision: str = 'ca3ee6bac89d'
down_revision: Union[str, None] = '8488c8f0d97a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'learning_resources' not in tables:
        op.create_table(
            'learning_resources',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('resource_type', sa.Enum('COURSE', 'CERTIFICATION', 'PROJECT', 'WORKSHOP', 'BOOK', 'ARTICLE', 'VIDEO', 'DOCUMENTATION', name='resourcetype'), nullable=False),
            sa.Column('provider', sa.String(length=150), nullable=False),
            sa.Column('url', sa.String(length=500), nullable=True),
            sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
            sa.Column('difficulty', sa.Enum('EASY', 'MEDIUM', 'HARD', name='questiondifficulty'), nullable=True),
            sa.Column('estimated_hours', sa.Integer(), nullable=True),
            sa.Column('price_type', sa.Enum('FREE', 'PAID', 'MIXED', 'UNKNOWN', name='resourcepricetype'), nullable=True),
            sa.Column('language', sa.String(length=50), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('learning_resources', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_learning_resources_is_active'), ['is_active'], unique=False)
            batch_op.create_index(batch_op.f('ix_learning_resources_resource_type'), ['resource_type'], unique=False)

    if 'learning_resource_careers' not in tables:
        op.create_table(
            'learning_resource_careers',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('learning_resource_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('relevance_weight', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['learning_resource_id'], ['learning_resources.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('learning_resource_id', 'career_role_id', name='uq_resource_career')
        )
        with op.batch_alter_table('learning_resource_careers', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_learning_resource_careers_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_learning_resource_careers_learning_resource_id'), ['learning_resource_id'], unique=False)

    if 'learning_resource_skills' not in tables:
        op.create_table(
            'learning_resource_skills',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('learning_resource_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('relevance_weight', sa.Float(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['learning_resource_id'], ['learning_resources.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('learning_resource_id', 'skill_id', name='uq_resource_skill')
        )
        with op.batch_alter_table('learning_resource_skills', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_learning_resource_skills_learning_resource_id'), ['learning_resource_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_learning_resource_skills_skill_id'), ['skill_id'], unique=False)

    if 'recommendations' not in tables:
        op.create_table(
            'recommendations',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('student_profile_id', sa.UUID(), nullable=False),
            sa.Column('learning_resource_id', sa.UUID(), nullable=False),
            sa.Column('skill_id', sa.UUID(), nullable=False),
            sa.Column('career_role_id', sa.UUID(), nullable=False),
            sa.Column('relevance_score', sa.Float(), nullable=False),
            sa.Column('priority', sa.String(length=50), nullable=False),
            sa.Column('reason', sa.Text(), nullable=False),
            sa.Column('status', sa.Enum('ACTIVE', 'DISMISSED', 'OUTDATED', 'COMPLETED', name='recommendationstatus'), nullable=False),
            sa.Column('generated_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['career_role_id'], ['career_roles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['learning_resource_id'], ['learning_resources.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('student_profile_id', 'learning_resource_id', 'skill_id', 'career_role_id', name='uq_student_rec')
        )
        with op.batch_alter_table('recommendations', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_recommendations_career_role_id'), ['career_role_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_recommendations_learning_resource_id'), ['learning_resource_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_recommendations_skill_id'), ['skill_id'], unique=False)
            batch_op.create_index(batch_op.f('ix_recommendations_status'), ['status'], unique=False)
            batch_op.create_index(batch_op.f('ix_recommendations_student_profile_id'), ['student_profile_id'], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    tables = inspector.get_table_names()

    if 'recommendations' in tables:
        with op.batch_alter_table('recommendations', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_recommendations_student_profile_id'))
            batch_op.drop_index(batch_op.f('ix_recommendations_status'))
            batch_op.drop_index(batch_op.f('ix_recommendations_skill_id'))
            batch_op.drop_index(batch_op.f('ix_recommendations_learning_resource_id'))
            batch_op.drop_index(batch_op.f('ix_recommendations_career_role_id'))
        op.drop_table('recommendations')

    if 'learning_resource_skills' in tables:
        with op.batch_alter_table('learning_resource_skills', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_learning_resource_skills_skill_id'))
            batch_op.drop_index(batch_op.f('ix_learning_resource_skills_learning_resource_id'))
        op.drop_table('learning_resource_skills')

    if 'learning_resource_careers' in tables:
        with op.batch_alter_table('learning_resource_careers', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_learning_resource_careers_learning_resource_id'))
            batch_op.drop_index(batch_op.f('ix_learning_resource_careers_career_role_id'))
        op.drop_table('learning_resource_careers')

    if 'learning_resources' in tables:
        with op.batch_alter_table('learning_resources', schema=None) as batch_op:
            batch_op.drop_index(batch_op.f('ix_learning_resources_resource_type'))
            batch_op.drop_index(batch_op.f('ix_learning_resources_is_active'))
        op.drop_table('learning_resources')
