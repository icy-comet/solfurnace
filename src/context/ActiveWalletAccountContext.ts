import { createContext } from "react";
import { UiWalletAccount } from "@wallet-standard/react";

export type ActiveWalletAccount = UiWalletAccount | undefined;

export type ActiveWalletAccountState = {
  activeWalletAccount: ActiveWalletAccount;
  setActiveWalletAccount: React.Dispatch<
    React.SetStateAction<ActiveWalletAccount>
  >;
};

export const ActiveWalletAccountContext =
  createContext<ActiveWalletAccountState>({
    activeWalletAccount: undefined,
    // empty by default, set by provider
    setActiveWalletAccount: () => {},
  });
