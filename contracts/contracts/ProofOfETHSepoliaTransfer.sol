// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./circuits/UltraVerifier.sol";
import "./ILisan.sol";

// this is a demo contract that allows a user on polygon amoy, to prove that they
// transacted on ethereum sepolia
// transacted here - refers to a user proving that they sent 2 ETH to address INSERT
contract ProofOfETHSepoliaTransfer {
    UltraVerifier public verifier;
    ILisan public lisan;

    mapping(bytes32 => bool) public txProven;

    constructor(address _verifier, address _lisan) {
        verifier = UltraVerifier(_verifier);
        lisan = ILisan(_lisan);
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

        bytes32 concat = concatenate(result);

        return concat;
    }

    event SepoliaTxProven(bytes32 sepoliaBlockHash, uint256 txIdx);

    // public inputs is as follows:
    // [chain_id, block_number, tx_index, value, block_hash]
    // block hash is the last 32 elements of the public inputs
    function proveETHSepoliaTransfer(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) public {
        // noir typings are a bit heinous
        // we need to convert our tx hash in array form to something readable
        // our block hash from the user is the last 32 elements of the public inputs
        bytes32[] memory last32Elements = new bytes32[](32);

        // Copy the last 32 elements from the input array to the new array
        for (uint i = 0; i < 32; i++) {
            last32Elements[i] = _publicInputs[_publicInputs.length - 32 + i];
        }

        bytes32 blockHash = convertAndConcatenate(last32Elements);
        bytes32 lisanBlockHash = lisan.getBlockHash(
            uint64(uint256(_publicInputs[0])),
            uint64(uint256(_publicInputs[1]))
        );

        // check that the amount of the transaction is correct
        require(uint256(_publicInputs[3]) == 2 ether, "incorrect amount!");

        // check that the input block hash matches lisans block hash
        require(lisanBlockHash == blockHash, "Block not in history");

        // check that the users proof is valid
        bool isValid = verifier.verify(_proof, _publicInputs);
        require(isValid, "Invalid proof!");

        // mark the tx as proven hash(block + tx_idx in block) as I don't have the tx hash handy atm
        txProven[
            keccak256(abi.encodePacked(blockHash, _publicInputs[2]))
        ] = true;

        // emit an event to prove that this tx was proven
        emit SepoliaTxProven(blockHash, uint256(_publicInputs[2]));
    }
}
