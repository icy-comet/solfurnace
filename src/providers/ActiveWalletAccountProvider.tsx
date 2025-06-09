"use client";
import {
  getUiWalletAccountStorageKey,
  UiWallet,
  UiWalletAccount,
  uiWalletAccountBelongsToUiWallet,
  uiWalletAccountsAreSame,
  useWallets,
} from "@wallet-standard/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActiveWalletAccount,
  ActiveWalletAccountContext,
} from "@/context/ActiveWalletAccountContext";

const STORAGE_KEY = "solfurnace:selected-wallet-and-address";

function getSavedWalletAccount(
  wallets: readonly UiWallet[],
  wasSetterInvoked: boolean
): UiWalletAccount | undefined {
  if (wasSetterInvoked) {
    // After the user makes an explicit choice of wallet, stop trying to auto-select the
    // saved wallet, if and when it appears.
    return;
  }
  const savedWalletNameAndAddress = localStorage.getItem(STORAGE_KEY);
  if (
    !savedWalletNameAndAddress ||
    typeof savedWalletNameAndAddress !== "string"
  ) {
    return;
  }
  const [savedWalletName, savedAccountAddress] =
    savedWalletNameAndAddress.split(":");
  if (!savedWalletName || !savedAccountAddress) {
    return;
  }
  for (const wallet of wallets) {
    if (wallet.name === savedWalletName) {
      for (const account of wallet.accounts) {
        if (account.address === savedAccountAddress) {
          return account;
        }
      }
    }
  }
}

/**
 * Saves the selected wallet account's storage key to the browser's local storage. In future
 * sessions it will try to return that same wallet account, or at least one from the same brand of
 * wallet if the wallet from which it came is still in the Wallet Standard registry.
 */
export function ActiveWalletAccountContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useWallets();
  const wasSetterInvoked = useRef<boolean>(false);

  const [activeWalletAccount, setActiveWalletAccountInternal] = useState<
    UiWalletAccount | undefined
  >(undefined);

  // load the saved/previous wallet account from localstorage
  useEffect(() => {
    const wallet = getSavedWalletAccount(wallets, wasSetterInvoked.current);
    setActiveWalletAccountInternal(wallet);
  }, [wallets]);

  // wrapper method to also update the localstorage when updating the current active account state
  const setActiveWalletAccount: React.Dispatch<
    React.SetStateAction<ActiveWalletAccount>
  > = (setStateAction) => {
    setActiveWalletAccountInternal((prevSelectedWalletAccount) => {
      // setWasSetterInvoked(true);
      const nextWalletAccount =
        typeof setStateAction === "function"
          ? setStateAction(prevSelectedWalletAccount)
          : setStateAction;
      const accountKey = nextWalletAccount
        ? getUiWalletAccountStorageKey(nextWalletAccount)
        : undefined;
      if (accountKey) {
        localStorage.setItem(STORAGE_KEY, accountKey);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return nextWalletAccount;
    });
  };

  // set the auto-loaded account as active only if it still exists in the browser
  const walletAccount = useMemo(() => {
    if (activeWalletAccount) {
      for (const uiWallet of wallets) {
        for (const uiWalletAccount of uiWallet.accounts) {
          if (uiWalletAccountsAreSame(activeWalletAccount, uiWalletAccount)) {
            return uiWalletAccount;
          }
        }
        if (
          uiWalletAccountBelongsToUiWallet(activeWalletAccount, uiWallet) &&
          uiWallet.accounts[0]
        ) {
          // If the selected account belongs to this connected wallet, at least, then
          // select one of its accounts.
          return uiWallet.accounts[0];
        }
      }
    }
  }, [activeWalletAccount, wallets]);

  useEffect(() => {
    // If there is a saved wallet account but the wallet to which it belongs has since
    // disconnected, clear the selected wallet.
    if (activeWalletAccount && !walletAccount) {
      setActiveWalletAccountInternal(undefined);
    }
  }, [activeWalletAccount, walletAccount]);

  return (
    <ActiveWalletAccountContext.Provider
      value={useMemo(
        () => ({
          activeWalletAccount: walletAccount,
          setActiveWalletAccount,
        }),
        [walletAccount]
      )}
    >
      {children}
    </ActiveWalletAccountContext.Provider>
  );
}
