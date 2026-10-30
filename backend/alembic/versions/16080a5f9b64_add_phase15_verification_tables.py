"""add_phase15_verification_tables

Revision ID: 16080a5f9b64
Revises: 19c96900e3fa
Create Date: 2026-08-30 15:59:32.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '16080a5f9b64'
down_revision: Union[str, None] = '19c96900e3fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create verification_requests table
    op.create_table(
        'verification_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('public_token', sa.String(length=100), nullable=False),
        sa.Column('subject_type', sa.String(length=50), nullable=False),
        sa.Column('subject_id', sa.UUID(), nullable=False),
        sa.Column('verification_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('submitted_by', sa.UUID(), nullable=False),
        sa.Column('reviewed_by', sa.UUID(), nullable=True),
        sa.Column('verification_method', sa.String(length=100), nullable=False, server_default='MANUAL_REVIEW'),
        sa.Column('evidence_summary', sa.Text(), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('revocation_reason', sa.Text(), nullable=True),
        sa.Column('is_public_badge', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('verification_requests', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_verification_requests_public_token'), ['public_token'], unique=True)
        batch_op.create_index(batch_op.f('ix_verification_requests_subject_type'), ['subject_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_subject_id'), ['subject_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_verification_type'), ['verification_type'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_status'), ['status'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_submitted_by'), ['submitted_by'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_reviewed_by'), ['reviewed_by'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_requests_expires_at'), ['expires_at'], unique=False)

    # 2. Create verification_evidence table
    op.create_table(
        'verification_evidence',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('verification_request_id', sa.UUID(), nullable=False),
        sa.Column('evidence_type', sa.String(length=50), nullable=False, server_default='FILE'),
        sa.Column('file_url', sa.String(length=500), nullable=True),
        sa.Column('credential_id', sa.String(length=150), nullable=True),
        sa.Column('issuer_name', sa.String(length=255), nullable=True),
        sa.Column('verification_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('evidence_hash', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['verification_request_id'], ['verification_requests.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('verification_evidence', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_verification_evidence_verification_request_id'), ['verification_request_id'], unique=False)

    # 3. Create verification_audits table
    op.create_table(
        'verification_audits',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('verification_request_id', sa.UUID(), nullable=False),
        sa.Column('actor_id', sa.UUID(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('previous_status', sa.String(length=50), nullable=True),
        sa.Column('new_status', sa.String(length=50), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['verification_request_id'], ['verification_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('verification_audits', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_verification_audits_verification_request_id'), ['verification_request_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_verification_audits_actor_id'), ['actor_id'], unique=False)


def downgrade() -> None:
    op.drop_table('verification_audits')
    op.drop_table('verification_evidence')
    op.drop_table('verification_requests')
