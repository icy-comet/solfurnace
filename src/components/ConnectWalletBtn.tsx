import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UiWallet,
  UiWalletAccount,
  useConnect,
  useDisconnect,
  uiWalletAccountsAreSame,
} from "@wallet-standard/react";
import { useCallback } from "react";

type ConnectWalletBtnProps = {
  wallet: UiWallet;
  onAccountSelect: (account: UiWalletAccount) => void;
  onDisconnect: () => void;
};

export const ConnectWalletBtn = ({
  wallet,
  onAccountSelect,
}: ConnectWalletBtnProps) => {
  const [isConnecting, connect] = useConnect(wallet);
  const [isDisconnecting] = useDisconnect(wallet);
  const isPending = isConnecting || isDisconnecting;

  const handleConnectClick = useCallback(async () => {
    try {
      const existingAccounts = [...wallet.accounts];
      const nextAccounts = await connect();
      // Try to choose the first never-before-seen account.
      for (const nextAccount of nextAccounts) {
        if (
          !existingAccounts.some((existingAccount) =>
            uiWalletAccountsAreSame(nextAccount, existingAccount)
          )
        ) {
          onAccountSelect(nextAccount);
          return;
        }
      }
      // Failing that, choose the first account in the list.
      if (nextAccounts[0]) {
        onAccountSelect(nextAccounts[0]);
      }
    } catch (e) {
      // errors like user rejecting the connect request
      //   onError(e);
    }
  }, [connect, onAccountSelect, wallet.accounts]);

  return (
    <Button
      disabled={isPending}
      onClick={handleConnectClick}
      variant="secondary"
    >
      <Avatar>
        <AvatarImage src={wallet.icon} alt={`${wallet.name} logo`} />
        <AvatarFallback>{wallet.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      {wallet.name}
    </Button>
  );
};
