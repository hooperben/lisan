// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./circuits/UltraVerifier.sol";
import "./ILisan.sol";

// this is a demo contract that allows a user on polygon amoy, to prove that they
// transacted on ethereum sepolia
// transacted here - refers to a user proving that they sent 2 ETH to address 0x13E5E5deA5620A8f4B5C430339795cb5BaB6676e
contract ProofOfETHSepoliaTransfer {
    UltraVerifier public verifier;
    ILisan public lisan;

    mapping(bytes32 => bool) public txProven;

    // this is the address on ETH sepolia, that you can prove was transferred 2 ETH
    address public SEPOLIA_ETH_RECEIVER =
        0x13E5E5deA5620A8f4B5C430339795cb5BaB6676e;

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

    function addressConcatenate(
        uint8[20] memory inputArray
    ) public pure returns (address) {
        bytes20 result;
        for (uint i = 0; i < 20; i++) {
            result |= bytes20(uint160(inputArray[i]) << (152 - i * 8));
        }
        return address(result);
    }

    function convertAndConcatenateAddress(
        bytes32[] memory inputArray
    ) public pure returns (address) {
        uint8[20] memory result;

        for (uint i = 0; i < inputArray.length; i++) {
            uint8 value = uint8(uint256(inputArray[i]));
            result[i] = value;
        }

        address concat = addressConcatenate(result);

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

        // we need to convert the address to an array
        // address is all elements between _publicInputs.length - 52 to _publicInputs.length - 32
        bytes32[] memory addressArray = new bytes32[](20);

        for (uint i = 0; i < 20; i++) {
            addressArray[i] = _publicInputs[_publicInputs.length - 52 + i];
        }

        // reconstruct and check the address matches
        address userAddress = convertAndConcatenateAddress(addressArray);
        require(SEPOLIA_ETH_RECEIVER == userAddress, "Invalid address!");

        // check that the amount of the transaction is correct
        require(uint256(_publicInputs[3]) == 2 ether, "incorrect amount!");

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
