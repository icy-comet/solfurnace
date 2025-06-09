"use client";
import { createSolanaClient } from "gill";
import { ReactNode, useContext, useMemo } from "react";
import { ChainContext } from "@/context/ChainContext";
import { RpcContext } from "@/context/RpcContext";

type Props = Readonly<{
  children: ReactNode;
}>;

export function RpcContextProvider({ children }: Props) {
  const { solanaRpcUrl } = useContext(ChainContext);
  return (
    <RpcContext.Provider
      value={useMemo(
        () => createSolanaClient({ urlOrMoniker: solanaRpcUrl }),
        [solanaRpcUrl]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
