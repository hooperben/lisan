import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Abi, abiEncode } from "@noir-lang/noirc_abi";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BaseContract,
  ContractFactory,
  parseEther,
  solidityPackedKeccak256,
  zeroPadValue,
} from "ethers";
import { ethers } from "hardhat";
import circuit_acir from "../../circuits/target/circuits.json";
import {
  convertHexArrayToTxHash,
  readProofData,
} from "../helpers/general-helpers";
import { EndpointV2Mock, Lisan, UltraVerifier } from "../typechain-types";

// @ts-ignore -- should be fine I think
export const abi = circuit_acir.abi as unknown as Abi;

describe("lz testing lisan", async () => {
  const eidA = 1;
  const eidB = 2;

  let LisanFactory: ContractFactory;
  let EndpointV2Mock: ContractFactory;
  let Deployer: HardhatEthersSigner;
  let LisanChainA: Lisan;
  let LisanChainB: Lisan;
  let mockEndpointV2A: BaseContract;
  let mockEndpointV2B: BaseContract;

  let ultraVerifierA: UltraVerifier;
  let ultraVerifierB: UltraVerifier;

  before(async () => {
    LisanFactory = await ethers.getContractFactory("Lisan");

    [Deployer] = await ethers.getSigners();

    EndpointV2Mock = await ethers.getContractFactory("EndpointV2Mock");
  });

  beforeEach(async () => {
    mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
    mockEndpointV2B = await EndpointV2Mock.deploy(eidB);

    const ultraVerifierFactory =
      await ethers.getContractFactory("UltraVerifier");

    // not really needed, but having 2 is nice I guess
    ultraVerifierA = (await ultraVerifierFactory.deploy()) as UltraVerifier;
    ultraVerifierB = (await ultraVerifierFactory.deploy()) as UltraVerifier;

    LisanChainA = (await LisanFactory.deploy(
      Deployer.address,
      // @ts-ignore
      mockEndpointV2A.address
    )) as Lisan;

    LisanChainB = (await LisanFactory.deploy(
      Deployer.address,
      // @ts-ignore
      mockEndpointV2B.address
    )) as Lisan;

    // Setting destination endpoints in the LZEndpoint mock for each MyOApp instance
    await (mockEndpointV2A as EndpointV2Mock).setDestLzEndpoint(
      // @ts-ignore
      LisanChainB.address,
      // @ts-ignore
      mockEndpointV2B.address
    );
    await (mockEndpointV2B as EndpointV2Mock).setDestLzEndpoint(
      // @ts-ignore
      LisanChainA.address,
      // @ts-ignore
      mockEndpointV2A.address
    );

    // Setting each MyOApp instance as a peer of the other
    await LisanChainA.connect(Deployer).setPeer(
      eidB,
      // @ts-ignore
      zeroPadValue(LisanChainB.address, 32)
    );
    await LisanChainB.connect(Deployer).setPeer(
      eidA,
      // @ts-ignore
      zeroPadValue(LisanChainA.address, 32)
    );
  });

  it("should run lz functionality successfully", async () => {
    // we should be able to send a message from A to B
    const options = Options.newOptions()
      .addExecutorLzReceiveOption(200000, 0)
      .toHex()
      .toString();

    const blockNumber = await ethers.provider.getBlockNumber();

    const desiredBlockNumber = blockNumber - 1;

    // Define native fee and quote for the message send operation
    const [nativeFee] = await LisanChainA.quote(
      eidB,
      desiredBlockNumber,
      options,
      false
    );

    let tx = await LisanChainA.connect(Deployer).send(
      eidB,
      desiredBlockNumber,
      options,
      {
        value: parseEther("0.1"),
      }
    );

    await tx.wait();

    // Check that the message was received on the remote chain
    const isInHistory = await LisanChainB.isBlockInHistory(
      31337,
      desiredBlockNumber
    );

    expect(isInHistory).to.be.true;
  });

  it.only("should allow for a proof of a transaction", async () => {
    interface InputMap {
      block_hash: string[];
      block_number: string;
      chain_id: string;
      tx_index: string;
      to: {
        _is_some: boolean;
        value: string[];
      };
      value: {
        lo: string;
        hi: string;
      };
    }

    const proofData = await readProofData();

    const publicInputs = abiEncode(
      abi,
      proofData.inputMap,
      proofData.inputMap.return
    );

    const input = Array.from(publicInputs.values());

    const bytes32Array = (
      proofData.inputMap as unknown as InputMap
    ).block_hash.map((hash) => `0x${hash.slice(-2)}`);

    const block_hash = convertHexArrayToTxHash(bytes32Array);

    // for our test case, we are just going to add the block to the history and not use lz
    await LisanChainB.addToHistory(input[0], input[1], block_hash);

    const ProofOfETHSepoliaTransfer = await ethers.getContractFactory(
      "ProofOfETHSepoliaTransfer"
    );

    const proofOfEthSepoliaTransfer = await ProofOfETHSepoliaTransfer.deploy(
      // @ts-ignore
      ultraVerifierB.address,
      // @ts-ignore
      LisanChainB.address
    );

    const txHash = await solidityPackedKeccak256(
      ["bytes32", "uint256"],
      [block_hash, BigInt(input[2])]
    );

    const txProven = await proofOfEthSepoliaTransfer.txProven(txHash);

    expect(txProven).to.be.false;

    await proofOfEthSepoliaTransfer.proveETHSepoliaTransfer(proofData.proof, [
      ...input,
    ]);

    const txProvenAfter = await proofOfEthSepoliaTransfer.txProven(txHash);

    expect(txProvenAfter).to.be.true;
  });
});
