import { WalletConnection } from "./WalletConnection";
import { Separator } from "@/components/ui/separator";
import { RpcDrawerBtn } from "@/components/RpcDrawerBtn";

export const Header = () => {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between w-full p-2">
        <span className="text-primary text-3xl font-black">SolFurnace</span>
        <RpcDrawerBtn />
        <WalletConnection />
      </header>
      <Separator />
    </>
  );
};
