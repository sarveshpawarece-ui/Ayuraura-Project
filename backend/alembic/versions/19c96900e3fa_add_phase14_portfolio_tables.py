"""add_phase14_portfolio_tables

Revision ID: 19c96900e3fa
Revises: 8e7839bb8925
Create Date: 2026-08-30 13:06:55.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '19c96900e3fa'
down_revision: Union[str, None] = '8e7839bb8925'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create portfolios table
    op.create_table(
        'portfolios',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False, server_default='My Professional Portfolio'),
        sa.Column('headline', sa.String(length=120), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('visibility', sa.String(length=50), nullable=False, server_default='PRIVATE'),
        sa.Column('is_published', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('contact_email_public', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('contact_phone_public', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('show_skill_scores', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('show_skill_gaps', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('show_assessments', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('show_recommendations', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('show_applications', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('section_config', sa.JSON(), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_profile_id', name='uq_portfolio_student_profile')
    )
    with op.batch_alter_table('portfolios', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolios_slug'), ['slug'], unique=True)
        batch_op.create_index(batch_op.f('ix_portfolios_student_profile_id'), ['student_profile_id'], unique=True)

    # 2. Create portfolio_projects table
    op.create_table(
        'portfolio_projects',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=True),
        sa.Column('technologies', sa.JSON(), nullable=True),
        sa.Column('skills_used', sa.JSON(), nullable=True),
        sa.Column('project_url', sa.String(length=500), nullable=True),
        sa.Column('repository_url', sa.String(length=500), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('start_date', sa.String(length=50), nullable=True),
        sa.Column('end_date', sa.String(length=50), nullable=True),
        sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('visibility', sa.String(length=50), nullable=False, server_default='PORTFOLIO_ONLY'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('portfolio_projects', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolio_projects_portfolio_id'), ['portfolio_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_portfolio_projects_student_profile_id'), ['student_profile_id'], unique=False)

    # 3. Create portfolio_experiences table
    op.create_table(
        'portfolio_experiences',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=150), nullable=False),
        sa.Column('experience_type', sa.String(length=50), nullable=False, server_default='INTERNSHIP'),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.String(length=50), nullable=False),
        sa.Column('end_date', sa.String(length=50), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('skills_used', sa.JSON(), nullable=True),
        sa.Column('visibility', sa.String(length=50), nullable=False, server_default='PORTFOLIO_ONLY'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('portfolio_experiences', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolio_experiences_portfolio_id'), ['portfolio_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_portfolio_experiences_student_profile_id'), ['student_profile_id'], unique=False)

    # 4. Create portfolio_certifications table
    op.create_table(
        'portfolio_certifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('issuer', sa.String(length=255), nullable=False),
        sa.Column('issue_date', sa.String(length=50), nullable=True),
        sa.Column('expiry_date', sa.String(length=50), nullable=True),
        sa.Column('credential_id', sa.String(length=150), nullable=True),
        sa.Column('credential_url', sa.String(length=500), nullable=True),
        sa.Column('certificate_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('visibility', sa.String(length=50), nullable=False, server_default='PORTFOLIO_ONLY'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('portfolio_certifications', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolio_certifications_portfolio_id'), ['portfolio_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_portfolio_certifications_student_profile_id'), ['student_profile_id'], unique=False)

    # 5. Create portfolio_achievements table
    op.create_table(
        'portfolio_achievements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('issuer', sa.String(length=255), nullable=True),
        sa.Column('date', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('credential_url', sa.String(length=500), nullable=True),
        sa.Column('visibility', sa.String(length=50), nullable=False, server_default='PORTFOLIO_ONLY'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('portfolio_achievements', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolio_achievements_portfolio_id'), ['portfolio_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_portfolio_achievements_student_profile_id'), ['student_profile_id'], unique=False)

    # 6. Create portfolio_education table
    op.create_table(
        'portfolio_education',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('portfolio_id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('institution', sa.String(length=255), nullable=False),
        sa.Column('degree', sa.String(length=150), nullable=False),
        sa.Column('field_of_study', sa.String(length=150), nullable=True),
        sa.Column('start_year', sa.Integer(), nullable=True),
        sa.Column('end_year', sa.Integer(), nullable=True),
        sa.Column('grade', sa.String(length=50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('portfolio_education', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_portfolio_education_portfolio_id'), ['portfolio_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_portfolio_education_student_profile_id'), ['student_profile_id'], unique=False)


def downgrade() -> None:
    op.drop_table('portfolio_education')
    op.drop_table('portfolio_achievements')
    op.drop_table('portfolio_certifications')
    op.drop_table('portfolio_experiences')
    op.drop_table('portfolio_projects')
    op.drop_table('portfolios')
