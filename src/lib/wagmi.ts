import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http } from "wagmi";
import { base, arbitrumSepolia } from "wagmi/chains";
import { defineChain } from "viem";

// Arc Testnet — chain id 5042002, gas paid in USDC.
// Defining it here lets RainbowKit offer "Add to wallet" / network
// switch UX for users who want to inspect their Diamond directly on
// Arc; for Compass's day-to-day, the backend handles all Arc RPC.
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

// Real WalletConnect projects must be registered at cloud.walletconnect.com
// and the id exposed via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Without
// a real id, the Reown / AppKit cloud endpoints return 403 for every
// wallet-discovery / pairing call — noisy in the console and slows
// page load with retries. So when no real id is set we DROP the
// WalletConnect / Coinbase / Rainbow connectors entirely and keep only
// injected wallets (MetaMask, Brave, etc.) which work locally without
// a cloud round-trip.
const envProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const hasRealProjectId =
  !!envProjectId && envProjectId.length > 0 && envProjectId !== "compass-dev";

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: hasRealProjectId
        ? [
            coinbaseWallet,
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
    // RainbowKit still requires a non-empty string even when we're not
    // using WalletConnect — pass a placeholder it'll never actually hit.
    projectId: envProjectId || "compass-dev",
  },
);

// In a Mini App webview, farcasterMiniApp auto-connects to the host wallet
// before RainbowKit's connectors get a turn. Outside a Mini App it fails
// its readiness check and wagmi falls through to the rainbow connectors.
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
