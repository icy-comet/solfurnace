import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  UiWallet,
  UiWalletAccount,
  useDisconnect,
} from "@wallet-standard/react";

type DisconnectWalletBtnProps = {
  wallet: UiWallet;
  walletAccount: UiWalletAccount;
  onDisconnect: () => void;
};

export const DisconnectWalletBtn = ({
  wallet,
  walletAccount,
  onDisconnect,
}: DisconnectWalletBtnProps) => {
  const [isDisconnecting, disconnect] = useDisconnect(wallet);
  return (
    <Button
      disabled={isDisconnecting}
      onClick={async () => {
        await disconnect();
        onDisconnect();
      }}
    >
      <Avatar>
        <AvatarImage src="https://robohash.org/abcde" alt={`wallet logo`} />
        <AvatarFallback className="text-secondary-foreground">W</AvatarFallback>
      </Avatar>
      {/* the component is only rendering if the app is connected */}
      {walletAccount!.address.slice(0, 8)}
    </Button>
  );
};
