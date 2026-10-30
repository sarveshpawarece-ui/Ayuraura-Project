"""add_phase12_industry_dashboard_tables

Revision ID: 59efb5b64c0c
Revises: bc7cc7c840de
Create Date: 2026-08-30 12:06:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '59efb5b64c0c'
down_revision: Union[str, None] = 'bc7cc7c840de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Safely add columns to industry_profiles
    try:
        op.add_column('industry_profiles', sa.Column('description', sa.Text(), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('organization_type', sa.String(length=100), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('logo_url', sa.String(length=500), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('contact_email', sa.String(length=255), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('contact_phone', sa.String(length=50), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('location', sa.String(length=255), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_profiles', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        pass

    # Safely add columns to industry_opportunities
    try:
        op.add_column('industry_opportunities', sa.Column('organization_id', sa.UUID(), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('industry_opportunities', sa.Column('created_by_user_id', sa.UUID(), nullable=True))
    except Exception:
        pass

    # Create application_internal_notes table if not exists
    try:
        op.create_table(
            'application_internal_notes',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('application_id', sa.UUID(), nullable=False),
            sa.Column('organization_id', sa.UUID(), nullable=False),
            sa.Column('author_user_id', sa.UUID(), nullable=True),
            sa.Column('author_name', sa.String(length=255), nullable=True),
            sa.Column('note', sa.Text(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['organization_id'], ['industry_profiles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['author_user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
    except Exception:
        pass

    # Create industry_audit_logs table if not exists
    try:
        op.create_table(
            'industry_audit_logs',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('organization_id', sa.UUID(), nullable=False),
            sa.Column('user_id', sa.UUID(), nullable=True),
            sa.Column('action', sa.String(length=100), nullable=False),
            sa.Column('entity_type', sa.String(length=100), nullable=False),
            sa.Column('entity_id', sa.String(length=100), nullable=True),
            sa.Column('metadata_json', sa.JSON(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['organization_id'], ['industry_profiles.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
    except Exception:
        pass



def downgrade() -> None:
    op.drop_table('industry_audit_logs')
    op.drop_table('application_internal_notes')

    with op.batch_alter_table('industry_opportunities', schema=None) as batch_op:
        batch_op.drop_index('ix_industry_opportunities_created_by_user_id')
        batch_op.drop_index('ix_industry_opportunities_organization_id')
        batch_op.drop_column('created_by_user_id')
        batch_op.drop_column('organization_id')

    with op.batch_alter_table('industry_profiles', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')
        batch_op.drop_column('location')
        batch_op.drop_column('contact_phone')
        batch_op.drop_column('contact_email')
        batch_op.drop_column('logo_url')
        batch_op.drop_column('website_url')
        batch_op.drop_column('organization_type')
        batch_op.drop_column('description')
