"""Add core governance and indexer tables

Revision ID: b1c2d3e4f5a6
Revises: eefce3b96f0e
Create Date: 2026-05-24

"""
from alembic import op
import sqlalchemy as sa


revision = "b1c2d3e4f5a6"
down_revision = "eefce3b96f0e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "blocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("block_hash", sa.String(), nullable=False),
        sa.Column("parent_hash", sa.String(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("events_count", sa.Integer(), nullable=True),
        sa.Column("extrinsics_count", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_blocks_block_hash", "blocks", ["block_hash"], unique=True)
    op.create_index("ix_blocks_block_number", "blocks", ["block_number"], unique=True)
    op.create_index("ix_blocks_id", "blocks", ["id"], unique=False)

    op.create_table(
        "extrinsics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("extrinsic_hash", sa.String(), nullable=False),
        sa.Column("module", sa.String(), nullable=False),
        sa.Column("call", sa.String(), nullable=False),
        sa.Column("signer", sa.String(), nullable=True),
        sa.Column("args", sa.JSON(), nullable=True),
        sa.Column("success", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_extrinsics_block_number", "extrinsics", ["block_number"], unique=False)
    op.create_index("ix_extrinsics_extrinsic_hash", "extrinsics", ["extrinsic_hash"], unique=False)
    op.create_index("ix_extrinsics_id", "extrinsics", ["id"], unique=False)

    op.create_table(
        "processed_blocks",
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("block_hash", sa.String(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("block_number"),
    )
    op.create_index("ix_processed_blocks_block_number", "processed_blocks", ["block_number"], unique=False)

    op.create_table(
        "dead_letter_queue",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("error_message", sa.String(), nullable=False),
        sa.Column("retry_count", sa.Integer(), nullable=True),
        sa.Column("last_attempt", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dead_letter_queue_block_number", "dead_letter_queue", ["block_number"], unique=False)
    op.create_index("ix_dead_letter_queue_id", "dead_letter_queue", ["id"], unique=False)

    op.create_table(
        "proposals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("proposal_index", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("section", sa.String(), nullable=False),
        sa.Column("method", sa.String(), nullable=False),
        sa.Column("proposer", sa.String(), nullable=False),
        sa.Column("args", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_proposals_block_number", "proposals", ["block_number"], unique=False)
    op.create_index("ix_proposals_id", "proposals", ["id"], unique=False)
    op.create_index("ix_proposals_proposal_index", "proposals", ["proposal_index"], unique=False)

    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("proposal_index", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("voter", sa.String(), nullable=False),
        sa.Column("vote", sa.String(), nullable=False),
        sa.Column("balance", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_votes_block_number", "votes", ["block_number"], unique=False)
    op.create_index("ix_votes_id", "votes", ["id"], unique=False)
    op.create_index("ix_votes_proposal_index", "votes", ["proposal_index"], unique=False)

    op.create_table(
        "treasury_spends",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("beneficiary", sa.String(), nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_treasury_spends_block_number", "treasury_spends", ["block_number"], unique=False)
    op.create_index("ix_treasury_spends_id", "treasury_spends", ["id"], unique=False)


def downgrade() -> None:
    op.drop_table("treasury_spends")
    op.drop_table("votes")
    op.drop_table("proposals")
    op.drop_table("dead_letter_queue")
    op.drop_table("processed_blocks")
    op.drop_table("extrinsics")
    op.drop_table("blocks")
