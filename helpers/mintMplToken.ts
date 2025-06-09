import {
  createFungible,
  mplTokenMetadata,
  TokenStandard,
  mintV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  mintTokensTo,
  mplToolbox,
  SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@metaplex-foundation/mpl-toolbox";
import {
  percentAmount,
  createGenericFile,
  createSignerFromKeypair,
  sol,
  transactionBuilder,
  publicKey,
  KeypairSigner,
  signerIdentity,
  PublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mockStorage } from "@metaplex-foundation/umi-storage-mock";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "node:fs/promises";
import path from "node:path";

const rpcURL = "http://127.0.0.1:8899";
const SPL_TOKEN_PROGRAM_ID = publicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const SPL_TOKEN_2022_PROGRAM_ID = publicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export type FungibleTokenMetadata = {
  name: string;
  symbol: string;
  description: string;
  image?: string;
};

export type MintingArgs = {
  minterSigner: KeypairSigner;
  mintSigner: KeypairSigner;
  destSigner: KeypairSigner;
  tokenImg: string;
  tokenMetadata: FungibleTokenMetadata;
  tokenProgram: PublicKey;
};

const umi = createUmi(rpcURL)
  .use(mplTokenMetadata())
  .use(mplToolbox())
  .use(mockStorage({ baseUrl: "http://localhost:7000/" }));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const readKey = async (path: string): Promise<KeypairSigner> => {
  const data = await fs.readFile(path, {
    encoding: "utf-8",
  });
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(JSON.parse(data))
  );
  return createSignerFromKeypair(umi, keypair);
};

const executeMinting = async ({
  minterSigner,
  mintSigner,
  destSigner,
  tokenImg,
  tokenMetadata,
  tokenProgram,
}: MintingArgs) => {
  try {
    console.log("Airdropping some SOL...");
    umi.use(signerIdentity(minterSigner));
    await umi.rpc.airdrop(minterSigner.publicKey, sol(10));
    await sleep(2000);

    const tokenImgData = await fs.readFile(tokenImg);
    const umiTokenImgFile = createGenericFile(
      tokenImgData,
      path.basename(tokenImg),
      {
        contentType: "image/jpeg",
      }
    );
    const imgUploadResponse = await umi.uploader
      .upload([umiTokenImgFile])
      .catch((err) => {
        throw new Error(err);
      });
    const tokenImgUri = imgUploadResponse[0];
    console.log("Token Img URI: ", tokenImgUri);
    tokenMetadata.image = tokenImgUri;

    const tokenMetadataUri = await umi.uploader
      .uploadJson(tokenMetadata)
      .catch((err) => {
        throw new Error(err);
      });
    console.log("Token Metadata URI: ", tokenMetadataUri);

    // `createFungible` sets the `tokenStandard` field and spreads the rest into createV1
    const createMintIx = await createFungible(umi, {
      mint: mintSigner,
      name: tokenMetadata.name,
      uri: tokenMetadataUri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: 4,
      splTokenProgram: tokenProgram,
    });

    const createAtaIx = createTokenIfMissing(umi, {
      mint: mintSigner.publicKey,
      owner: destSigner.publicKey,
      ataProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: tokenProgram,
      ata: findAssociatedTokenPda(umi, {
        mint: mintSigner.publicKey,
        owner: destSigner.publicKey,
        tokenProgramId: tokenProgram,
      }),
    });

    let mintTokensIx = null;

    if (tokenProgram === SPL_TOKEN_PROGRAM_ID)
      mintTokensIx = mintTokensTo(umi, {
        mint: mintSigner.publicKey,
        token: findAssociatedTokenPda(umi, {
          mint: mintSigner.publicKey,
          owner: destSigner.publicKey,
          tokenProgramId: tokenProgram,
        }),
        amount: BigInt(1000),
      });

    if (tokenProgram === SPL_TOKEN_2022_PROGRAM_ID)
      mintTokensIx = mintV1(umi, {
        mint: mintSigner.publicKey,
        token: findAssociatedTokenPda(umi, {
          mint: mintSigner.publicKey,
          owner: destSigner.publicKey,
          tokenProgramId: tokenProgram,
        }),
        tokenOwner: destSigner.publicKey,
        tokenStandard: TokenStandard.Fungible,
        amount: 10000,
        splTokenProgram: tokenProgram,
        authority: minterSigner,
        splAtaProgram: SPL_ASSOCIATED_TOKEN_PROGRAM_ID,
      });

    if (!mintTokensIx || !createMintIx) throw new Error("couldn't do this");

    const txn = await transactionBuilder()
      .add(createMintIx)
      .add(createAtaIx)
      .add(mintTokensIx)
      .setFeePayer(minterSigner)
      .sendAndConfirm(umi);

    console.log(base58.deserialize(txn.signature)[0]);
  } catch (e) {
    console.error(e);
  }
};

const main = async () => {
  const mintings: MintingArgs[] = [
    {
      minterSigner: await readKey("keys/key06.json"),
      mintSigner: await readKey("keys/key07.json"),
      destSigner: await readKey("keys/key08.json"),
      tokenImg: "metadata/token3.jpg",
      tokenMetadata: {
        name: "Token 3",
        description: "Just another token.",
        symbol: "$TOKEN3",
      },
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
    },
    {
      minterSigner: await readKey("keys/key09.json"),
      mintSigner: await readKey("keys/key10.json"),
      destSigner: await readKey("keys/key11.json"),
      tokenImg: "metadata/token4.jpg",
      tokenMetadata: {
        name: "Token 4",
        description: "Just another token.",
        symbol: "$TOKEN4",
      },
      tokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
    },
  ];
  for (const minting of mintings) {
    await executeMinting(minting);
  }
};

main();
