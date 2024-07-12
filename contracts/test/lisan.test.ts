import { getAndBuildCircuit } from "../helpers/getAndBuildCircuit";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ForeignCallHandler, Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import { JSONRPCClient } from "json-rpc-2.0";

describe("testing lisan", async () => {
  before(async () => {});
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

    const transformArray = (input) => {
      return input.map((innerArray) => {
        return { Single: removeHexPrefix(innerArray[0].toString("hex")) };
      });
    };

    const foreignCallHandler: ForeignCallHandler = async (
      name: any,
      input: any
    ) => {
      const data = await client.request(name, transformArray(input));
      console.log(data);

      console.log("got the tx");

      const formatted = data.values.map((value) => value.Single ?? value.Array);

      console.log(formatted);
      return formatted;
    };

    const circuit = await getAndBuildCircuit("../circuits/");

    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit, backend);

    console.log("hello!");

    // the rest of your NoirJS code
    const input = { chainId: 11155111, blockNumber: 6298444, txIndex: 21 };
    const { witness } = await noir.execute(input, foreignCallHandler);

    console.log(witness);
  });
});
