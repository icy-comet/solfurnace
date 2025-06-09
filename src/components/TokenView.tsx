import { AtaData, MintData } from "@/lib/customTypes";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useContext } from "react";
import { RpcContext } from "@/context/RpcContext";
import {
  Address,
  signAndSendTransactionMessageWithSigners,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  pipe,
  createTransactionMessage,
  createTransaction,
  getExplorerLink,
  getBase58Decoder,
} from "gill";
import {
  getCloseAccountInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
  getBurnCheckedInstruction,
} from "gill/programs/token";
import { UiWalletAccount } from "@wallet-standard/react";
import { useWalletAccountTransactionSendingSigner } from "@solana/react";
import { ChainContext } from "@/context/ChainContext";

type Props = {
  ata: AtaData;
  mint: MintData;
  activeWalletAccount: UiWalletAccount;
};

export function TokenView({ ata, mint, activeWalletAccount }: Props) {
  const { rpc } = useContext(RpcContext);
  const { chain } = useContext(ChainContext);
  const signer = useWalletAccountTransactionSendingSigner(
    activeWalletAccount,
    chain
  );

  if (!mint.uri.startsWith("http")) return;
  return (
    <div className="border border-solid min-h-56 text-center">
      <Image
        src={mint.image}
        alt="token image"
        width={100}
        height={100}
        className="w-full pb-2"
      />
      <span className="block">Symbol: {mint.ticker}</span>
      <span className="block">Name: {mint.name}</span>
      <span className="block">Amount: {ata.uiAmount}</span>
      <Button
        variant="destructive"
        className="text-center my-3 text-xs p-0 cursor-pointer"
        onClick={async () => {
          if (activeWalletAccount) {
            try {
              const closeIx = getCloseAccountInstruction(
                {
                  account: ata.ataAddr,
                  destination: activeWalletAccount.address as Address,
                  owner: activeWalletAccount.address as Address,
                },
                { programAddress: TOKEN_2022_PROGRAM_ADDRESS }
              );

              const burnIx = getBurnCheckedInstruction({
                account: ata.ataAddr,
                amount: Number(ata.amount),
                authority: signer,
                decimals: ata.decimals,
                mint: ata.mintAddr,
              });

              const { value: latestBlockhash } = await rpc
                .getLatestBlockhash({ commitment: "confirmed" })
                .send();

              let txn = pipe(
                createTransactionMessage({ version: 0 }),
                (m) => setTransactionMessageFeePayerSigner(signer, m),
                (m) =>
                  setTransactionMessageLifetimeUsingBlockhash(
                    latestBlockhash,
                    m
                  )
              );

              if (ata.amount)
                txn = appendTransactionMessageInstruction(burnIx, txn);
              txn = appendTransactionMessageInstruction(closeIx, txn);

              assertIsTransactionMessageWithSingleSendingSigner(txn);

              const signature = await signAndSendTransactionMessageWithSigners(
                txn
              );
              console.log(
                getExplorerLink({
                  transaction: getBase58Decoder().decode(signature),
                })
              );
            } catch (e) {
              console.error(e);
            }
          }
        }}
      >
        <Flame />
        Burn
      </Button>
    </div>
  );
}
