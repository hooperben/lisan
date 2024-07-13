// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./circuits/UltraVerifier.sol";
import "hardhat/console.sol";

// the lisan al gaib will point the way
contract Lisan {
    UltraVerifier public verifier;

    mapping(uint64 chainId => mapping(uint64 timestamp => bytes32 blockhash))
        public knownHashes;

    constructor(address _verifier) {
        verifier = UltraVerifier(_verifier);
    }

    function addToHistory(
        uint64 chainId,
        uint64 timestamp,
        bytes32 _blockhash
    ) public {
        knownHashes[chainId][timestamp] = _blockhash;
    }

    function verifyInHistory(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) public {
        bool isValid = verifier.verify(_proof, _publicInputs);

        console.log("isValid: ", isValid);
    }
}
