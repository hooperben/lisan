// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./circuits/UltraVerifier.sol";
import "./OChain.sol";
import "./ILisan.sol";

// the lisan al gaib will point the way
contract Lisan is ILisan, OChain {
    constructor(address _owner, address _endpoint) OChain(_endpoint, _owner) {}

    function getBlockHash(
        uint64 _chainId,
        uint64 _blockNumber
    ) public view returns (bytes32) {
        return visions[_chainId][_blockNumber];
    }

    function isBlockInHistory(
        uint64 _chainId,
        uint64 _blockNumber
    ) public view returns (bool) {
        return visions[_chainId][_blockNumber] != bytes32(0);
    }

    // handy for testing - this functionality IRL needs to be only callable by OZ
    function addToHistory(
        uint64 _chainId,
        uint64 _blockNumber,
        bytes32 _blockhash
    ) public onlyOwner {
        visions[_chainId][_blockNumber] = _blockhash;
        emit BlockHashReceived(
            uint64(_chainId),
            uint64(_blockNumber),
            _blockhash
        );
    }
}
