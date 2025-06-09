import { WalletConnection } from "./WalletConnection";
import { Separator } from "@/components/ui/separator";

export const Header = () => {
  return (
    <>
      <header className="flex justify-between w-full p-2">
        <span className="text-primary text-3xl font-black">SolFurnace</span>
        <WalletConnection />
      </header>
      <Separator />
    </>
  );
};
