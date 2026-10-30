"""add_phase13_institution_dashboard_tables

Revision ID: 8e7839bb8925
Revises: 59efb5b64c0c
Create Date: 2026-08-30 12:48:39.068895

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '8e7839bb8925'
down_revision: Union[str, None] = '59efb5b64c0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add new columns to institution_profiles if not present
    with op.batch_alter_table('institution_profiles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('code', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('institution_type', sa.String(length=50), nullable=False, server_default='AYURVEDIC_COLLEGE'))
        batch_op.add_column(sa.Column('website_url', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('contact_email', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('contact_phone', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('address', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('country', sa.String(length=100), nullable=True, server_default='India'))
        batch_op.add_column(sa.Column('logo_url', sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))

    # 2. Create departments table
    op.create_table(
        'departments',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['institution_id'], ['institution_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('institution_id', 'code', name='uq_institution_department_code')
    )
    with op.batch_alter_table('departments', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_departments_institution_id'), ['institution_id'], unique=False)

    # 3. Create student_institution_memberships table
    op.create_table(
        'student_institution_memberships',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_profile_id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), nullable=False),
        sa.Column('department_id', sa.UUID(), nullable=True),
        sa.Column('student_identifier', sa.String(length=100), nullable=True),
        sa.Column('enrollment_year', sa.Integer(), nullable=True),
        sa.Column('graduation_year', sa.Integer(), nullable=True),
        sa.Column('membership_status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['institution_id'], ['institution_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_profile_id'], ['student_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('institution_id', 'student_profile_id', name='uq_institution_student_membership')
    )
    with op.batch_alter_table('student_institution_memberships', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_student_institution_memberships_department_id'), ['department_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_student_institution_memberships_institution_id'), ['institution_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_student_institution_memberships_membership_status'), ['membership_status'], unique=False)
        batch_op.create_index(batch_op.f('ix_student_institution_memberships_student_profile_id'), ['student_profile_id'], unique=False)

    # 4. Create institution_audit_logs table
    op.create_table(
        'institution_audit_logs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('institution_id', sa.UUID(), nullable=False),
        sa.Column('actor_user_id', sa.UUID(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['institution_id'], ['institution_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('institution_audit_logs', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_institution_audit_logs_actor_user_id'), ['actor_user_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_institution_audit_logs_institution_id'), ['institution_id'], unique=False)


def downgrade() -> None:
    op.drop_table('institution_audit_logs')
    op.drop_table('student_institution_memberships')
    op.drop_table('departments')
    with op.batch_alter_table('institution_profiles', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')
        batch_op.drop_column('logo_url')
        batch_op.drop_column('country')
        batch_op.drop_column('address')
        batch_op.drop_column('contact_phone')
        batch_op.drop_column('contact_email')
        batch_op.drop_column('website_url')
        batch_op.drop_column('institution_type')
        batch_op.drop_column('description')
        batch_op.drop_column('code')
