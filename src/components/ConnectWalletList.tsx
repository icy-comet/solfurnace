"use client";
import { StandardConnect, StandardDisconnect } from "@wallet-standard/core";
import { UiWallet, useWallets } from "@wallet-standard/react";
import { useContext } from "react";
import { ActiveWalletAccountContext } from "@/context/ActiveWalletAccountContext";
import { ChainContext } from "@/context/ChainContext";
import { ConnectWalletBtn } from "./ConnectWalletBtn";

type ConnectWalletMenuProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ConnectWalletList({ setOpen }: ConnectWalletMenuProps) {
  const wallets = useWallets();

  const { setActiveWalletAccount } = useContext(ActiveWalletAccountContext);
  const { chain } = useContext(ChainContext);

  const supportedWallets: UiWallet[] = [];
  for (const wallet of wallets) {
    if (
      wallet.features.includes(StandardConnect) &&
      wallet.features.includes(StandardDisconnect) &&
      wallet.chains.includes(chain)
    ) {
      supportedWallets.push(wallet);
    } else {
      // unconnectableWallets.push(wallet);
    }
  }

  return (
    <>
      {supportedWallets.map((wallet) => (
        <ConnectWalletBtn
          key={`wallet:${wallet.name}`}
          wallet={wallet}
          onAccountSelect={(acc) => {
            setActiveWalletAccount(acc);
            setOpen(false);
          }}
          onDisconnect={() => setActiveWalletAccount(undefined)}
        />
      ))}
    </>
  );
}
