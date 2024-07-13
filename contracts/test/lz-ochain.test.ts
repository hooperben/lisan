import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
  BaseContract,
  Contract,
  ContractFactory,
  parseEther,
  zeroPadValue,
} from "ethers";
import { ethers } from "hardhat";
import { EndpointV2Mock, Lisan } from "../typechain-types";
import circuit_acir from "../../circuits/target/circuits.json";
import { Options } from "@layerzerolabs/lz-v2-utilities";

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

  before(async () => {
    LisanFactory = await ethers.getContractFactory("Lisan");

    [Deployer] = await ethers.getSigners();

    EndpointV2Mock = await ethers.getContractFactory("EndpointV2Mock");
  });

  beforeEach(async () => {
    mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
    mockEndpointV2B = await EndpointV2Mock.deploy(eidB);

    // @ts-ignore
    const verifierAddress = await Deployer.getAddress(); // TODO can be fake here - we just want to test LZ

    LisanChainA = (await LisanFactory.deploy(
      verifierAddress,
      Deployer.address,
      // @ts-ignore
      mockEndpointV2A.address
    )) as Lisan;

    LisanChainB = (await LisanFactory.deploy(
      verifierAddress,
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

  it("should run", async () => {
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
});
