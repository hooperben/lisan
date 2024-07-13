// SPDX-License-Identifier: MIT

pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OApp, MessagingFee, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {MessagingReceipt} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OAppSender.sol";

contract OChain is OApp {
    constructor(
        address _endpoint,
        address _delegate
    ) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    mapping(uint64 chainId => mapping(uint64 timestamp => bytes32 blockhash))
        public visions;

    function getBlockHash(uint blockNumber) public view returns (bytes32) {
        require(
            block.number > blockNumber,
            "Block number should be in the past"
        );
        require(
            block.number - blockNumber <= 256,
            "Block number is too far in the past"
        );

        return blockhash(blockNumber);
    }

    function send(
        uint32 _dstEid,
        uint _blockNumber,
        bytes calldata _options
    ) external payable returns (MessagingReceipt memory receipt) {
        // get the block hash
        bytes32 hashToGet = getBlockHash(_blockNumber);
        require(hashToGet != 0, "Blockhash not found");

        // encode the message
        bytes memory _payload = abi.encode(
            _blockNumber,
            hashToGet,
            block.chainid
        );

        receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
    }

    function quote(
        uint32 _dstEid,
        uint _blockNumber,
        bytes memory _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory fee) {
        bytes32 hashToGet = getBlockHash(_blockNumber);
        require(hashToGet != 0, "Blockhash not found");

        bytes memory payload = abi.encode(_blockNumber, hashToGet);

        fee = _quote(_dstEid, payload, _options, _payInLzToken);
    }

    event BlockHashReceived(
        uint64 chainId,
        uint64 blockNumber,
        bytes32 blockHash
    );

    function _lzReceive(
        Origin calldata /*_origin*/,
        bytes32 /*_guid*/,
        bytes calldata payload,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        (uint blocknum, bytes32 blockHash, uint chainId) = abi.decode(
            payload,
            (uint, bytes32, uint)
        );
        visions[uint64(chainId)][uint64(blocknum)] = blockHash;
        emit BlockHashReceived(uint64(chainId), uint64(blocknum), blockHash);
    }
}
