// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./circuits/UltraVerifier.sol";
import "./OChain.sol";

import "hardhat/console.sol";

// the lisan al gaib will point the way
contract Lisan is OChain {
    UltraVerifier public verifier;

    constructor(
        address _verifier,
        address _owner,
        address _endpoint
    ) OChain(_endpoint, _owner) {
        verifier = UltraVerifier(_verifier);
    }

    function isBlockInHistory(
        uint64 _chainId,
        uint64 _blockNumber
    ) public view returns (bool) {
        return visions[_chainId][_blockNumber] != bytes32(0);
    }

    function _formatTxHash(
        bytes32[] memory inputArray
    ) internal pure returns (bytes32) {
        bytes32 result;
        uint8 position = 0;

        for (uint i = 0; i < inputArray.length; i++) {
            bytes2 lastTwoBytes = bytes2(inputArray[i] << 240);
            result |= bytes32(lastTwoBytes) >> (position * 16);
            position += 2;
        }

        return result;
    }

    function concatenate(
        uint8[32] memory inputArray
    ) public pure returns (bytes32) {
        bytes32 result;

        for (uint i = 0; i < 32; i++) {
            result |= bytes32(uint256(inputArray[i]) << (248 - i * 8));
        }

        return result;
    }

    function convertAndConcatenate(
        bytes32[] memory inputArray
    ) public pure returns (bytes32) {
        uint8[32] memory result;

        for (uint i = 0; i < inputArray.length; i++) {
            uint8 value = uint8(uint256(inputArray[i]));
            result[i] = value;
        }

        // for (uint i = 0; i < result.length; i++) {
        //     console.logBytes1(bytes1(result[i]));
        // }

        bytes32 concat = concatenate(result);

        return concat;
    }

    function verifyInHistory(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) public {
        // we need to convert our tx hash in array form to something readable
        bytes32[] memory last32Elements = new bytes32[](32);

        // Copy the last 32 elements from the input array to the new array
        for (uint i = 0; i < 32; i++) {
            last32Elements[i] = _publicInputs[_publicInputs.length - 32 + i];
        }

        bytes32 blockHash = convertAndConcatenate(last32Elements);

        // we need to check that this blockHash is in our history
        require(
            visions[uint64(uint256(_publicInputs[0]))][
                uint64(uint256(_publicInputs[1]))
            ] == blockHash,
            "Block not in history"
        );

        // next we check that the proof is valid
        bool isValid = verifier.verify(_proof, _publicInputs);

        console.log("isValid: ", isValid);
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
