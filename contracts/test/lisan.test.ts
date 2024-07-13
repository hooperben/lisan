import { getAndBuildCircuit } from "../helpers/getAndBuildCircuit";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ForeignCallHandler, Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import { JSONRPCClient } from "json-rpc-2.0";
import { Lisan, UltraVerifier } from "../typechain-types";
import { ethers } from "hardhat";
import { promises as fs } from "fs";
import toml from "toml";
import { Abi, InputMap, abiEncode } from "@noir-lang/noirc_abi";
import { Hex, isHex } from "viem";

export const BYTE_HEX_LEN = 2;

export function encodeHexStringToArray(value: string): Uint8Array {
  if (!isHex(value)) {
    throw new Error(`Invalid hex string: ${value}`);
  }
  if (value.length % BYTE_HEX_LEN !== 0) {
    value = value.slice(0, BYTE_HEX_LEN) + "0" + value.slice(BYTE_HEX_LEN);
  }
  const arr = [];
  for (let i = 2; i < value.length; i += BYTE_HEX_LEN) {
    arr.push(parseInt(value.substr(i, BYTE_HEX_LEN), 16));
  }
  return new Uint8Array(arr);
}

interface ProofData {
  proof: Uint8Array;
  inputMap: InputMap;
}

async function readProof(path: string): Promise<Uint8Array> {
  const proofHex = await fs.readFile(path, "utf-8");
  return encodeHexStringToArray("0x" + proofHex);
}

async function readInputMap(path: string): Promise<InputMap> {
  const verifierData = await fs.readFile(path, "utf-8");
  const inputMap = toml.parse(verifierData) as InputMap;
  return inputMap;
}

const abi: Abi = {
  parameters: [
    {
      name: "chainId",
      type: { kind: "field" },
      visibility: "private",
    },
    {
      name: "blockNumber",
      type: { kind: "field" },
      visibility: "private",
    },
    {
      name: "txIndex",
      type: { kind: "field" },
      visibility: "private",
    },
  ],
  param_witnesses: {
    blockNumber: [{ start: 1, end: 2 }],
    chainId: [{ start: 0, end: 1 }],
    txIndex: [{ start: 2, end: 3 }],
  },
  return_type: null,
  return_witnesses: [],
  error_types: {
    "400218748272706585": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 1 }],
    },
    "1731982540454069162": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 4 }],
    },
    "2780705034903590681": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 5 }],
    },
    "3612106088921134938": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 2 }],
    },
    "3787910806286407524": {
      error_kind: "fmtstring",
      length: 77,
      item_types: [
        { kind: "integer", sign: "unsigned", width: 64 },
        { kind: "integer", sign: "unsigned", width: 64 },
      ],
    },
    "4278159330947894587": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 9 }],
    },
    "5109560384965438844": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 10 }],
    },
    "5440598700819164781": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 13 }],
    },
    "6271999754836709038": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 2 }],
    },
    "6989683933432504620": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 12 }],
    },
    "7603763547018071615": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 5 }],
    },
    "7821084987450048877": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 9 }],
    },
    "7934801862871797552": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 4 }],
    },
    "10480978653365622977": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 9 }],
    },
    "11812742445546985554": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 12 }],
    },
    "12168538007630943717": {
      error_kind: "fmtstring",
      length: 13,
      item_types: [],
    },
    "12644143499564529811": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 1 }],
    },
    "12861464939996507073": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 13 }],
    },
    "13475544553582074068": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 2 }],
    },
    "13692865994014051330": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 10 }],
    },
    "13806582869435800005": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 5 }],
    },
    "14358919236040810979": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 17 }],
    },
    "14472293419590402933": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 17 }],
    },
    "15355668102049139844": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 4 }],
    },
    "16187069156066684101": {
      error_kind: "fmtstring",
      length: 32,
      item_types: [{ kind: "string", length: 1 }],
    },
    "16352759659929625430": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 10 }],
    },
    "16854439773595332173": {
      error_kind: "fmtstring",
      length: 35,
      item_types: [{ kind: "string", length: 2 }],
    },
    "17132187085505977033": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 17 }],
    },
    "17684523452110988007": {
      error_kind: "fmtstring",
      length: 30,
      item_types: [{ kind: "string", length: 13 }],
    },
    "18015561767964713944": {
      error_kind: "fmtstring",
      length: 31,
      item_types: [{ kind: "string", length: 12 }],
    },
  },
};

export async function readProofData(): Promise<ProofData> {
  const proofPath = `/Users/benhooper/dev/eth-global-brussels/circuits/proofs/circuits.proof`;
  const inputMapPath = `/Users/benhooper/dev/eth-global-brussels/circuits/Verifier.toml`;

  return {
    proof: await readProof(proofPath),
    inputMap: await readInputMap(inputMapPath),
  };
}

describe("testing lisan", async () => {
  let lisan: Lisan;
  let ultraVerifer: UltraVerifier;

  before(async () => {
    const ultraVerifierFactory = await ethers.getContractFactory(
      "UltraVerifier"
    );

    ultraVerifer = (await ultraVerifierFactory.deploy()) as UltraVerifier;
    const lisanFactory = await ethers.getContractFactory("Lisan");

    console.log(await ultraVerifer.getAddress());

    lisan = (await lisanFactory.deploy(
      await ultraVerifer.getAddress()
    )) as Lisan;

    console.log(await lisan.getAddress());
  });

  it.only("should run", async () => {
    // declaring the JSONRPCClient
    const client = new JSONRPCClient((jsonRPCRequest) => {
      // hitting the same JSON RPC Server we coded above
      return fetch("http://localhost:5555", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(jsonRPCRequest),
      }).then((response: any) => {
        if (response.status === 200) {
          return response
            .json()
            .then((jsonRPCResponse: any) => client.receive(jsonRPCResponse));
        } else if (jsonRPCRequest.id !== undefined) {
          return Promise.reject(new Error(response.statusText));
        }
      });
    });

    const removeHexPrefix = (hexString: string): string => {
      if (hexString.startsWith("0x")) {
        return hexString.slice(2);
      }
      return hexString;
    };

    // i don't normally any this hard but this is a hackathon
    const transformArray = (input: any) => {
      return input.map((innerArray: any) => {
        return { Single: removeHexPrefix(innerArray[0].toString("hex")) };
      });
    };

    const foreignCallHandler: ForeignCallHandler = async (
      name: any,
      input: any
    ) => {
      const data = await client.request(name, transformArray(input));
      const formatted = data.values.map(
        (value: any) => value.Single ?? value.Array
      );
      return formatted;
    };

    // const circuit = await getAndBuildCircuit("../circuits/");

    // const backend = new BarretenbergBackend(circuit, { threads: 5 });
    // const noir = new Noir(circuit, backend);

    // the rest of your NoirJS code
    // const input = {
    //   chainId: "11155111",
    //   blockNumber: "6298444",
    //   txIndex: "21",
    // };

    // console.log();
    // const { proof, publicInputs } = await noir.generateProof(
    //   input,
    //   foreignCallHandler
    // );

    console.log("generated proof");
    // console.log(proof);
    // console.log(publicInputs);

    const proofData = await readProofData();

    const publicInputs = abiEncode(
      abi,
      proofData.inputMap,
      proofData.inputMap.return
    );

    console.log(publicInputs);

    // console.log(proof);

    // console.log(witness);

    // @ts-ignore
    await lisan.verifyInHistory(proofData.proof, [
      "0x0000000000000000000000000000000000000000000000000000000000aa36a7", // todo figure this out
    ]);
  });
});
