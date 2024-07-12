// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { JSONRPCServer } from "json-rpc-2.0";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const server = new JSONRPCServer();

  server.addMethod("getAddressFromRPC", async (params) => {
    console.log(params);

    return {
      values: [{ Array: ["0x13E5E5deA5620A8f4B5C430339795cb5BaB6676e"] }],
    };
  });

  const jsonRPCRequest = req.body;

  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    console.log(jsonRPCResponse);
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      res.status(204);
    }
  });
}
