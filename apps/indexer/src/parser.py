import structlog
from substrateinterface import SubstrateInterface
from .config import settings
from .models import Proposal, Vote, TreasurySpend, Extrinsic

logger = structlog.get_logger()

# Polkadot OpenGov + legacy governance calls we index
GOVERNANCE_PROPOSAL_CALLS = {
    ("Democracy", "propose"),
    ("Democracy", "second"),
    ("Referenda", "submit"),
    ("Referenda", "submit_unsigned"),
}

GOVERNANCE_VOTE_CALLS = {
    ("Democracy", "vote"),
    ("ConvictionVoting", "vote"),
    ("ConvictionVoting", "remove_vote"),
}

TREASURY_SPEND_CALLS = {
    ("Treasury", "spend"),
    ("Treasury", "spend_local"),
}


def empty_parse_result() -> dict:
    return {
        "proposals": [],
        "votes": [],
        "treasury_spends": [],
        "extrinsics": [],
    }


def call_args_to_dict(call: dict) -> dict:
    """Normalize substrate call_args into a flat name -> value dict."""
    result = {}
    for item in call.get("call_args") or []:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        if name is not None:
            result[name] = item.get("value")
    return result


def extrinsic_hash(extrinsic_value: dict, block_number: int, index: int) -> str:
    if extrinsic_value.get("extrinsic_hash"):
        return str(extrinsic_value["extrinsic_hash"])
    return f"{block_number}-{index}"


def signer_address(extrinsic_value: dict) -> str | None:
    address = extrinsic_value.get("address")
    return str(address) if address is not None else None


class ChainParser:
    """Decodes block extrinsics and extracts governance + treasury records."""

    def __init__(self, substrate: SubstrateInterface | None = None):
        self._substrate = substrate

    @property
    def substrate(self) -> SubstrateInterface:
        if self._substrate is None:
            logger.info("Initializing SubstrateInterface", url=settings.SUBSTRATE_RPC_URL)
            self._substrate = SubstrateInterface(
                url=settings.SUBSTRATE_RPC_URL,
                type_registry_preset="polkadot",
            )
            logger.info("SubstrateInterface initialized successfully")
        return self._substrate

    def parse_block(self, block_number: int, extrinsics: list) -> dict:
        """
        Decode extrinsics and extract:
        - Proposals (Democracy, Referenda/OpenGov)
        - Votes (Democracy, ConvictionVoting)
        - Treasury spends
        - All decoded extrinsics (audit trail)
        """
        results = empty_parse_result()

        for idx, ext_hex in enumerate(extrinsics):
            try:
                extrinsic = self.substrate.decode_scale(
                    "Extrinsic", ext_hex, return_scale_obj=True
                )
                self._process_decoded_extrinsic(results, block_number, idx, extrinsic.value)
            except Exception as exc:
                logger.debug(
                    "Failed to decode extrinsic",
                    block_number=block_number,
                    index=idx,
                    error=str(exc),
                )

        return results

    def _process_decoded_extrinsic(
        self,
        results: dict,
        block_number: int,
        index: int,
        extrinsic_value: dict,
    ) -> None:
        call = extrinsic_value.get("call") or {}
        call_module = call.get("call_module", "Unknown")
        call_function = call.get("call_function", "unknown")
        args = call_args_to_dict(call)
        signer = signer_address(extrinsic_value)

        results["extrinsics"].append(
            Extrinsic(
                block_number=block_number,
                extrinsic_hash=extrinsic_hash(extrinsic_value, block_number, index),
                module=call_module,
                call=call_function,
                signer=signer,
                args=args or None,
                success="True",
            )
        )

        key = (call_module, call_function)

        if key in GOVERNANCE_PROPOSAL_CALLS:
            results["proposals"].append(self._build_proposal(
                block_number, index, call_module, call_function, signer, args
            ))
        elif key in GOVERNANCE_VOTE_CALLS:
            results["votes"].append(self._build_vote(
                block_number, call_module, call_function, signer, args
            ))
        elif key in TREASURY_SPEND_CALLS:
            spend = self._build_treasury_spend(block_number, args)
            if spend:
                results["treasury_spends"].append(spend)

    def _build_proposal(
        self,
        block_number: int,
        index: int,
        module: str,
        method: str,
        signer: str | None,
        args: dict,
    ) -> Proposal:
        ref_index = args.get("ref_index") or args.get("poll_index") or args.get("index")
        proposal_index = int(ref_index) if ref_index is not None else index

        return Proposal(
            proposal_index=proposal_index,
            block_number=block_number,
            section=module,
            method=method,
            proposer=signer or "unknown",
            args=args or None,
            status="Proposed",
        )

    def _build_vote(
        self,
        block_number: int,
        module: str,
        method: str,
        signer: str | None,
        args: dict,
    ) -> Vote:
        ref_index = (
            args.get("poll_index")
            or args.get("ref_index")
            or args.get("index")
            or 0
        )

        vote_value = args.get("vote")
        if vote_value is None and method == "remove_vote":
            vote_value = "removed"

        return Vote(
            proposal_index=int(ref_index) if ref_index is not None else 0,
            block_number=block_number,
            voter=signer or "unknown",
            vote=str(vote_value) if vote_value is not None else "unknown",
            balance=str(args.get("balance") or args.get("amount") or "0"),
        )

    def _build_treasury_spend(self, block_number: int, args: dict) -> TreasurySpend | None:
        beneficiary = args.get("beneficiary")
        amount = args.get("amount") or args.get("value")
        if beneficiary is None or amount is None:
            return None

        return TreasurySpend(
            block_number=block_number,
            beneficiary=str(beneficiary),
            value=str(amount),
        )
