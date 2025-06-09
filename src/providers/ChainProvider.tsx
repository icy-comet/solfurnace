"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ChainContextState,
  MAINNET_CONFIG,
  DEVNET_CONFIG,
  LOCALNET_CONFIG,
  TESTNET_CONFIG,
} from "@/lib/chainContextStates";
import { ChainContext } from "@/context/ChainContext";

const STORAGE_KEY = "solfurnace:selected-chain";

export function ChainContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // use default chain config
  const [chain, setChain] = useState(() => "solana:localnet");

  useEffect(() => {
    const chainId = localStorage.getItem(STORAGE_KEY);
    if (chainId) setChain(chainId);
  }, []);

  const contextValue = useMemo<ChainContextState>(() => {
    switch (chain) {
      case "solana:mainnet":
        return MAINNET_CONFIG;
      case "solana:testnet":
        return TESTNET_CONFIG;
      case "solana:devnet":
        return DEVNET_CONFIG;
      case "solana:localnet":
        return LOCALNET_CONFIG;
      default:
        if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
        return DEVNET_CONFIG;
    }
  }, [chain]);
  return (
    <ChainContext.Provider
      value={useMemo(
        () => ({
          ...contextValue,
          setChain(chain) {
            localStorage.setItem(STORAGE_KEY, chain);
            setChain(chain);
          },
        }),
        [contextValue]
      )}
    >
      {children}
    </ChainContext.Provider>
  );
}
