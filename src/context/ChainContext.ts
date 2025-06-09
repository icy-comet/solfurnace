"use client";
import { createContext } from "react";
import { ChainContextState, DEVNET_CONFIG } from "@/lib/chainContextStates";

export const ChainContext = createContext<ChainContextState>(DEVNET_CONFIG);
