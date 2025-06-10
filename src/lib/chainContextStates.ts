import { ClusterUrl, mainnet, testnet, devnet } from "@solana/kit";

export type ChainContextState = Readonly<{
  chain: `solana:${string}`;
  displayName: string;
  setChain?(chain: `solana:${string}`, rpcUrl?: string): void;
  solanaExplorerClusterName: "devnet" | "mainnet-beta" | "testnet" | "localnet";
  solanaRpcSubscriptionsUrl: ClusterUrl;
  solanaRpcUrl: ClusterUrl;
}>;

export const MAINNET_CONFIG: ChainContextState = Object.freeze({
  chain: "solana:mainnet",
  displayName: "Mainnet Beta",
  solanaExplorerClusterName: "mainnet-beta",
  solanaRpcSubscriptionsUrl: mainnet("wss://api.mainnet-beta.solana.com"),
  solanaRpcUrl: mainnet("https://api.mainnet-beta.solana.com"),
});

export const TESTNET_CONFIG: ChainContextState = Object.freeze({
  chain: "solana:testnet",
  displayName: "Testnet",
  solanaExplorerClusterName: "testnet",
  solanaRpcSubscriptionsUrl: testnet("wss://api.testnet.solana.com"),
  solanaRpcUrl: testnet("https://api.testnet.solana.com"),
});

export const DEVNET_CONFIG: ChainContextState = Object.freeze({
  chain: "solana:devnet",
  displayName: "Devnet",
  solanaExplorerClusterName: "devnet",
  solanaRpcSubscriptionsUrl: devnet("wss://api.devnet.solana.com"),
  solanaRpcUrl: devnet("https://api.devnet.solana.com"),
});

export const LOCALNET_CONFIG: ChainContextState = Object.freeze({
  chain: "solana:localnet",
  displayName: "Localnet",
  solanaExplorerClusterName: "localnet",
  solanaRpcSubscriptionsUrl: "ws://127.0.0.1:8900",
  solanaRpcUrl: "http://127.0.0.1:8899",
});
