"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConnectWalletList from "@/components/ConnectWalletList";
import { useState, useContext, useMemo } from "react";
import { ActiveWalletAccountContext } from "@/context/ActiveWalletAccountContext";
import {
  uiWalletAccountBelongsToUiWallet,
  useWallets,
} from "@wallet-standard/react";
import { DisconnectWalletBtn } from "@/components/DisconnectWalletBtn";

export function WalletConnection() {
  const [open, setOpen] = useState<boolean>(false);
  const { activeWalletAccount, setActiveWalletAccount } = useContext(
    ActiveWalletAccountContext
  );
  const wallets = useWallets();
  const wallet = useMemo(() => {
    for (const wallet of wallets) {
      if (
        activeWalletAccount &&
        uiWalletAccountBelongsToUiWallet(activeWalletAccount, wallet)
      ) {
        return wallet;
      }
    }
  }, [activeWalletAccount, wallets]);
  return (
    <>
      {!activeWalletAccount && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="text-base">Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-base">Connect Wallet</DialogTitle>
              <DialogDescription>
                We need this to get your balances.
              </DialogDescription>
            </DialogHeader>
            <ConnectWalletList setOpen={setOpen} />
          </DialogContent>
        </Dialog>
      )}
      {activeWalletAccount && wallet && (
        <DisconnectWalletBtn
          wallet={wallet}
          walletAccount={activeWalletAccount}
          onDisconnect={() => setActiveWalletAccount(undefined)}
        />
      )}
    </>
  );
}
