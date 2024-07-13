// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ILisan {
    function getBlockHash(
        uint64 _chainId,
        uint64 _blockNumber
    ) external returns (bytes32);
}
