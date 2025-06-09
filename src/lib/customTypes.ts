import { Address } from "gill";

export type AtaData = {
  mintAddr: Address;
  uiAmount: string;
  amount: BigInt;
  decimals: number;
  ataAddr: Address;
  tokenProgram: Address;
};

export type MintData = {
  name: string;
  ticker: string;
  uri: string;
  image: string;
};

export type MintsDataCollection = { [mintAddr: string]: MintData };
