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
import { mainnet } from "gill";

const MONIKER_STORAGE_KEY = "solfurnace:selected-chain";
const RPCURL_STORAGE_KEY = "solfurnace:custom-rpc-url";

export function ChainContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // use default chain config
  const [chain, setChain] = useState(() => "solana:localnet");
  const [customRpcUrl, setCustomRpcUrl] = useState<string>("");

  useEffect(() => {
    const chain = localStorage.getItem(MONIKER_STORAGE_KEY);
    const customRpc = localStorage.getItem(RPCURL_STORAGE_KEY);
    if (chain) setChain(chain);
    if (customRpc) setCustomRpcUrl(customRpc);
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
      case "solana:custom":
        return {
          chain: "solana:mainnet",
          displayName: "Mainnet (Custom)",
          solanaExplorerClusterName: "mainnet-beta",
          solanaRpcSubscriptionsUrl: mainnet(
            `${
              customRpcUrl.startsWith("https")
                ? customRpcUrl.replace("https", "wss")
                : customRpcUrl.replace("http", "ws")
            }`
          ),
          solanaRpcUrl: mainnet(customRpcUrl),
        };
      default:
        if (typeof window !== "undefined") {
          localStorage.removeItem(MONIKER_STORAGE_KEY);
          localStorage.removeItem(RPCURL_STORAGE_KEY);
        }
        return DEVNET_CONFIG;
    }
  }, [chain]);
  return (
    <ChainContext.Provider
      value={useMemo(
        () => ({
          ...contextValue,
          setChain(chain, customRpcUrl) {
            localStorage.setItem(MONIKER_STORAGE_KEY, chain);
            setChain(chain);
            if (customRpcUrl) {
              localStorage.setItem(RPCURL_STORAGE_KEY, customRpcUrl);
              setCustomRpcUrl(customRpcUrl);
            }
          },
        }),
        [contextValue]
      )}
    >
      {children}
    </ChainContext.Provider>
  );
}
