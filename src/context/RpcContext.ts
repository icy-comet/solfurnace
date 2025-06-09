"use client";
import { createSolanaClient, SolanaClient } from "gill";
import { createContext } from "react";

export const RpcContext = createContext<SolanaClient>(
  createSolanaClient({ urlOrMoniker: "devnet" })
);
