import {
  KeyPairSigner,
  TransactionSigner,
  Blockhash,
  lamports,
  getExplorerLink,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
} from "gill";
import { loadKeypairSignerFromFile } from "gill/node";
import {
  buildCreateTokenTransaction,
  TOKEN_2022_PROGRAM_ADDRESS,
  buildMintTokensTransaction,
} from "gill/programs/token";
import { createSolanaClient } from "gill";

const URL = "localnet";

const { rpc, sendAndConfirmTransaction } = createSolanaClient({
  urlOrMoniker: URL,
});

export type MintData = {
  mintAddr: KeyPairSigner;
  mintOwner: TransactionSigner;
  latestBlockhash: Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
  }>;
  tokenSymbol: string;
  tokenName: string;
  tokenUri: string;
  tokenDecimals: number;
};

const createMint = async ({
  mintAddr,
  mintOwner,
  latestBlockhash,
  tokenSymbol,
  tokenName,
  tokenUri,
  tokenDecimals,
}: MintData) => {
  const createTokenTx = await buildCreateTokenTransaction({
    mint: mintAddr,
    feePayer: mintOwner,
    latestBlockhash,
    metadata: {
      isMutable: false,
      name: tokenName,
      symbol: tokenSymbol,
      uri: tokenUri,
    },
    decimals: tokenDecimals,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    version: "legacy",
  });
  const tx = await signTransactionMessageWithSigners(createTokenTx);
  await sendAndConfirmTransaction(tx);
  console.log(
    `Mint: ${tokenName} (${tokenSymbol}) created: `,
    getExplorerLink({ address: mintAddr.address, cluster: URL })
  );
  console.log(
    "Create Mint Transaction: ",
    getExplorerLink({
      transaction: getSignatureFromTransaction(tx),
      cluster: URL,
    })
  );
};

export type MintingData = {
  mintOwner: TransactionSigner;
  latestBlockhash: Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
  }>;
  mintAddr: KeyPairSigner;
  mintDestination: TransactionSigner;
  amount: number;
  isMetaplex: boolean;
};

const mintToken = async ({
  mintOwner,
  latestBlockhash,
  mintAddr,
  mintDestination,
  amount,
  isMetaplex,
}: MintingData) => {
  const mintTokensTx = await buildMintTokensTransaction({
    feePayer: mintOwner,
    latestBlockhash,
    mint: mintAddr,
    mintAuthority: mintOwner,
    amount: amount, // note: be sure to consider the mint's `decimals` value
    // if decimals=2 => this will mint 10.00 tokens
    // if decimals=4 => this will mint 0.100 tokens
    destination: mintDestination,
    // use the correct token program for the `mint`
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS, // default=TOKEN_PROGRAM_ADDRESS
  });
  const tx = await signTransactionMessageWithSigners(mintTokensTx);
  await sendAndConfirmTransaction(tx);
  console.log(
    `Minted ${amount} of ${mintAddr.address} tokens to ${mintDestination.address}: `,
    getExplorerLink({
      transaction: getSignatureFromTransaction(tx),
      cluster: URL,
    })
  );
  console.log(
    `Destination Wallet Check: `,
    getExplorerLink({ address: mintDestination.address, cluster: URL })
  );
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const main = async () => {
  const minterOne = await loadKeypairSignerFromFile("keys/key00.json");
  const minterTwo = await loadKeypairSignerFromFile("keys/key01.json");
  const mintOne = await loadKeypairSignerFromFile("keys/key02.json");
  const mintTwo = await loadKeypairSignerFromFile("keys/key03.json");
  const destOne = await loadKeypairSignerFromFile("keys/key04.json");
  const destTwo = await loadKeypairSignerFromFile("keys/key05.json");
  const minters = [minterOne, minterTwo];
  const destinations = [destOne, destTwo];

  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const mintList: MintData[] = [
    {
      mintAddr: mintOne,
      tokenName: "Token One",
      mintOwner: minterOne,
      tokenSymbol: "$TOKEN1",
      tokenUri: "http://localhost:7000/token1.json",
      tokenDecimals: 2,
      latestBlockhash,
    },
    {
      mintAddr: mintTwo,
      tokenName: "Token Two",
      mintOwner: minterTwo,
      tokenSymbol: "$TOKEN2",
      tokenUri: "http://localhost:7000/token2.json",
      tokenDecimals: 4,
      latestBlockhash,
    },
  ];

  const transferList: MintingData[] = [
    {
      mintAddr: mintOne,
      mintOwner: minterOne,
      mintDestination: destOne,
      amount: 1000,
      latestBlockhash,
      isMetaplex: false,
    },
    {
      mintAddr: mintOne,
      mintOwner: minterOne,
      mintDestination: destTwo,
      amount: 10000,
      latestBlockhash,
      isMetaplex: false,
    },
    {
      mintAddr: mintTwo,
      mintOwner: minterTwo,
      mintDestination: destOne,
      amount: 10000,
      latestBlockhash,
      isMetaplex: false,
    },
    {
      mintAddr: mintTwo,
      mintOwner: minterTwo,
      mintDestination: destTwo,
      amount: 100000,
      latestBlockhash,
      isMetaplex: false,
    },
  ];

  for (const kp of [...minters, ...destinations]) {
    await rpc.requestAirdrop(kp.address, lamports(BigInt(1000000000))).send();
  }

  // required for the airdrops to propagate
  await sleep(1000);

  for (const mint of mintList) {
    await createMint(mint);
    console.log("\n");
  }

  for (const transfer of transferList) {
    await mintToken(transfer);
    console.log("\n");
  }
};

main();
