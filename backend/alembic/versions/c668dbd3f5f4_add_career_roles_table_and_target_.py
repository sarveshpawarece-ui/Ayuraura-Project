"""Add career_roles table and target_career_id foreign key

Revision ID: c668dbd3f5f4
Revises: '559822adf396'
Create Date: 2026-08-29 18:01:38.993174

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c668dbd3f5f4'
down_revision: Union[str, None] = '559822adf396'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'career_roles' not in tables:
        op.create_table('career_roles',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('name', sa.String(length=150), nullable=False),
            sa.Column('slug', sa.String(length=150), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('short_description', sa.Text(), nullable=True),
            sa.Column('category', sa.Enum('AYURVEDA_CLINICAL', 'AYURVEDA_RESEARCH', 'AYURVEDA_PHARMACEUTICAL', 'AYURVEDA_MANUFACTURING', 'AYURVEDA_QUALITY', 'AYURVEDA_EDUCATION', 'AYURVEDA_PUBLIC_HEALTH', 'AYUSH_TECHNOLOGY', 'HEALTHCARE', 'RESEARCH', 'OTHER', name='careercategory'), nullable=False),
            sa.Column('domain', sa.String(length=100), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.Column('display_order', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        with op.batch_alter_table('career_roles', schema=None) as batch_op:
            batch_op.create_index(batch_op.f('ix_career_roles_slug'), ['slug'], unique=True)

    with op.batch_alter_table('student_profiles', schema=None) as batch_op:
        batch_op.alter_column('target_career_id',
               existing_type=sa.NUMERIC(),
               type_=sa.UUID(),
               existing_nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('student_profiles', schema=None) as batch_op:
        pass

    with op.batch_alter_table('career_roles', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_career_roles_slug'))

    op.drop_table('career_roles')
