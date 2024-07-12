import { compile, createFileManager } from "@noir-lang/noir_wasm";
import { CompiledCircuit } from "@noir-lang/types";
import { resolve } from "path";

export const getAndBuildCircuit = async (path?: string) => {
  const basePath = resolve(path ?? "../circuits/");
  const fm = createFileManager(basePath);
  const result = await compile(fm);
  if (!("program" in result)) {
    throw new Error("Compilation failed");
  }
  return result.program as CompiledCircuit;
};
