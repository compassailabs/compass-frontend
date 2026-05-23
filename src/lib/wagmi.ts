import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http } from "wagmi";
import { base, arbitrumSepolia } from "wagmi/chains";
import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

const envProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const hasRealProjectId =
  !!envProjectId && envProjectId.length > 0 && envProjectId !== "compass-dev";

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: hasRealProjectId
        ? [
            metaMaskWallet,
            rainbowWallet,
            walletConnectWallet,
            injectedWallet,
          ]
        : [injectedWallet, metaMaskWallet],
    },
  ],
  {
    appName: "Compass AI",
    projectId: envProjectId || "compass-dev",
  },
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet, arbitrumSepolia, base],
  connectors: [farcasterMiniApp(), ...rainbowConnectors],
  transports: {
    [arcTestnet.id]: http(),
    [arbitrumSepolia.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});
