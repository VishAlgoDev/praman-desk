// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PramanEscrow
 * @notice Sovereign deterministic settlement escrow for Praman Desk.
 *         Settles B2B purchase orders and agentic spend-guard escrows against
 *         651-byte WASM arithmetic digests and cryptographic compliance bundles.
 */
contract PramanEscrow {
    enum DealStatus {
        None,
        Open,
        SettledSplit,
        HaltedRefunded
    }

    struct Deal {
        bytes32 poHash;
        address buyer;
        address seller;
        address arbiter;
        address token;
        uint256 amount;
        uint256 sellerReleased;
        uint256 buyerRefunded;
        bytes32 wasmDigest;
        bytes32 resolutionDigest;
        uint16 wasmScoreBps;
        uint64 createdAt;
        uint64 resolvedAt;
        DealStatus status;
    }

    error Reentrancy();
    error InvalidAddress();
    error InvalidAmount();
    error DealNotFound();
    error DealNotOpen();
    error UnauthorizedArbiter();
    error SplitSumMismatch();
    error Erc20TransferFailed();

    event EscrowCreated(
        uint256 indexed dealId,
        bytes32 indexed poHash,
        address indexed buyer,
        address seller,
        address arbiter,
        address token,
        uint256 amount
    );

    event EscrowSettledSplit(
        uint256 indexed dealId,
        uint256 sellerAmount,
        uint256 buyerRefund,
        bytes32 wasmDigest,
        bytes32 complianceBundleHash,
        uint16 wasmScoreBps
    );

    event EscrowHaltedAndRefunded(
        uint256 indexed dealId,
        uint256 refundedAmount,
        bytes32 haltReasonHash,
        bytes32 wasmDigest
    );

    uint256 private _locked = 1;
    uint256 private _dealCount;
    mapping(uint256 => Deal) private _deals;

    modifier nonReentrant() {
        if (_locked != 1) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    function dealCount() external view returns (uint256) {
        return _dealCount;
    }

    function getDeal(uint256 dealId) external view returns (Deal memory) {
        if (dealId >= _dealCount) revert DealNotFound();
        return _deals[dealId];
    }

    function createEscrow(
        bytes32 poHash,
        address seller,
        address arbiter,
        address token,
        uint256 amount
    ) external nonReentrant returns (uint256 dealId) {
        if (seller == address(0) || arbiter == address(0) || token == address(0)) {
            revert InvalidAddress();
        }
        if (amount == 0) revert InvalidAmount();

        uint256 balanceBefore = _balanceOf(token, address(this));
        _safeTransferFrom(token, msg.sender, address(this), amount);
        uint256 balanceAfter = _balanceOf(token, address(this));
        uint256 received = balanceAfter - balanceBefore;
        if (received != amount) revert InvalidAmount();

        dealId = _dealCount;
        _dealCount = dealId + 1;

        _deals[dealId] = Deal({
            poHash: poHash,
            buyer: msg.sender,
            seller: seller,
            arbiter: arbiter,
            token: token,
            amount: received,
            sellerReleased: 0,
            buyerRefunded: 0,
            wasmDigest: bytes32(0),
            resolutionDigest: bytes32(0),
            wasmScoreBps: 0,
            createdAt: uint64(block.timestamp),
            resolvedAt: 0,
            status: DealStatus.Open
        });

        emit EscrowCreated(dealId, poHash, msg.sender, seller, arbiter, token, received);
    }

    function settleSplit(
        uint256 dealId,
        uint256 sellerAmount,
        uint256 buyerRefund,
        bytes32 wasmDigest,
        bytes32 complianceBundleHash,
        uint16 wasmScoreBps
    ) external nonReentrant {
        if (dealId >= _dealCount) revert DealNotFound();
        Deal storage d = _deals[dealId];
        if (d.status != DealStatus.Open) revert DealNotOpen();
        if (msg.sender != d.arbiter) revert UnauthorizedArbiter();
        if (sellerAmount + buyerRefund != d.amount) revert SplitSumMismatch();

        d.status = DealStatus.SettledSplit;
        d.sellerReleased = sellerAmount;
        d.buyerRefunded = buyerRefund;
        d.wasmDigest = wasmDigest;
        d.resolutionDigest = complianceBundleHash;
        d.wasmScoreBps = wasmScoreBps;
        d.resolvedAt = uint64(block.timestamp);

        if (sellerAmount > 0) {
            _safeTransfer(d.token, d.seller, sellerAmount);
        }
        if (buyerRefund > 0) {
            _safeTransfer(d.token, d.buyer, buyerRefund);
        }

        emit EscrowSettledSplit(
            dealId,
            sellerAmount,
            buyerRefund,
            wasmDigest,
            complianceBundleHash,
            wasmScoreBps
        );
    }

    function haltAndRefund(
        uint256 dealId,
        bytes32 haltReasonHash,
        bytes32 wasmDigest
    ) external nonReentrant {
        if (dealId >= _dealCount) revert DealNotFound();
        Deal storage d = _deals[dealId];
        if (d.status != DealStatus.Open) revert DealNotOpen();
        if (msg.sender != d.arbiter) revert UnauthorizedArbiter();

        uint256 refundAmount = d.amount;
        d.status = DealStatus.HaltedRefunded;
        d.sellerReleased = 0;
        d.buyerRefunded = refundAmount;
        d.wasmDigest = wasmDigest;
        d.resolutionDigest = haltReasonHash;
        d.wasmScoreBps = 0;
        d.resolvedAt = uint64(block.timestamp);

        _safeTransfer(d.token, d.buyer, refundAmount);

        emit EscrowHaltedAndRefunded(dealId, refundAmount, haltReasonHash, wasmDigest);
    }

    function _balanceOf(address token, address account) private view returns (uint256) {
        (bool ok, bytes memory data) = token.staticcall(
            abi.encodeWithSelector(0x70a08231, account)
        );
        if (!ok || data.length < 32) revert Erc20TransferFailed();
        return abi.decode(data, (uint256));
    }

    function _safeTransfer(address token, address to, uint256 value) private {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, value)
        );
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert Erc20TransferFailed();
        }
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) private {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, value)
        );
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert Erc20TransferFailed();
        }
    }
}
