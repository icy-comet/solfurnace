"use client";
import { useContext } from "react";
import { RpcContext } from "@/context/RpcContext";
import { ActiveWalletAccountContext } from "@/context/ActiveWalletAccountContext";
import {
  TOKEN_2022_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "gill/programs/token";
import { Address } from "gill";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMetadata, getTokenMetadataAddress } from "gill/programs";
import { AtaData, MintsDataCollection } from "@/lib/customTypes";
import { TokenView } from "@/components/TokenView";

export const TokenList = () => {
  const { rpc } = useContext(RpcContext);
  const { activeWalletAccount } = useContext(ActiveWalletAccountContext);

  const { data, isFetching, isError, isSuccess, error } = useQuery({
    queryKey: ["all_atas", activeWalletAccount],
    queryFn: async (): Promise<{
      atas: AtaData[];
      mints: MintsDataCollection;
    }> => {
      if (activeWalletAccount) {
        const allAtasData: AtaData[] = [];
        const allMintsData: MintsDataCollection = {};
        for (const id of [TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS]) {
          const atasData: AtaData[] = [];
          const getAtasResult = await rpc
            .getTokenAccountsByOwner(
              activeWalletAccount.address as Address,
              {
                programId: id,
              },
              { encoding: "jsonParsed" }
            )
            .send();

          if (getAtasResult.value) {
            atasData.push(
              ...getAtasResult.value.map(
                (acc): AtaData => ({
                  mintAddr: acc.account.data.parsed.info
                    .mint as unknown as Address,
                  uiAmount:
                    acc.account.data.parsed.info.tokenAmount.uiAmountString,
                  amount: BigInt(
                    acc.account.data.parsed.info.tokenAmount.amount
                  ),
                  decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                  ataAddr: acc.pubkey,
                  tokenProgram: acc.account.owner,
                })
              )
            );

            if (id == TOKEN_2022_PROGRAM_ADDRESS) {
              const addrs = [...new Set(atasData.map((ata) => ata.mintAddr))];

              const mints = await rpc
                .getMultipleAccounts(addrs, { encoding: "jsonParsed" })
                .send();

              for (const mint of mints.value) {
                if (mint) {
                  // @ts-ignore
                  const data = mint!.data.parsed.info.extensions[1].state;

                  allMintsData[data.mint] = {
                    name: data.name,
                    uri: data.uri,
                    ticker: data.symbol,
                    image: "/token.png",
                  };
                }
              }
            }

            if (id == TOKEN_PROGRAM_ADDRESS) {
              let addrs: Address[] = [
                ...new Set(
                  await Promise.all(
                    atasData.map(
                      async (ata) => await getTokenMetadataAddress(ata.mintAddr)
                    )
                  )
                ),
              ];

              const mints = await fetchAllMetadata(rpc, addrs);

              for (const mint of mints) {
                allMintsData[mint.data.mint] = {
                  name: mint.data.data.name,
                  ticker: mint.data.data.symbol,
                  uri: mint.data.data.uri,
                  image: "/token.png",
                };
              }
            }
            allAtasData.push(...atasData);
          }

          if (allMintsData) {
            for (const mint in allMintsData) {
              if (allMintsData[mint].uri.startsWith("http")) {
                try {
                  const req = await fetch(allMintsData[mint].uri);
                  const metadata = await req.json();
                  allMintsData[mint].image = metadata.image;
                } catch (e) {
                  console.error(e);
                  throw new Error();
                }
              }
            }
          }
        }
        return { atas: allAtasData, mints: allMintsData };
      }
      throw new Error();
    },
    enabled: !!activeWalletAccount,
    retry: false,
  });

  if (isError) return <p>Errored out! {`${error}`}</p>;
  if (isFetching) return <p>Loading...</p>;
  if (activeWalletAccount)
    return (
      <>
        {isSuccess && <h1 className="text-2xl pt-5 pb-2">Token Accounts</h1>}
        <div className="grid grid-cols-6 gap-5 my-4">
          {isSuccess &&
            data.atas.length > 0 &&
            data.atas.map((ata) => (
              <TokenView
                ata={ata}
                mint={data.mints[ata.mintAddr]}
                key={ata.ataAddr}
                activeWalletAccount={activeWalletAccount}
              />
            ))}
        </div>

        {isSuccess && !(data.atas.length > 0) && (
          <p>You're out of luck! No empty token accounts to close.</p>
        )}
      </>
    );
};
