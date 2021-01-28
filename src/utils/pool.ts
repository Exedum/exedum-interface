import { getPool } from "./infura";
import { EXEDS } from "../constants/tokens";
import {DollarPool1, DollarPool2} from "../constants/contracts";

export async function getPoolAddress(): Promise<string> {
  const pool = await getPool(EXEDS.addr);
  if (pool.toLowerCase() === DollarPool2.toLowerCase()) {
    return DollarPool2;
  }

  throw new Error("Unrecognized Pool Address");
}

export function getLegacyPoolAddress(poolAddress): string {
  if (poolAddress === DollarPool2) {
    return DollarPool1;
  }

  throw new Error("Unrecognized Pool Address");
}
