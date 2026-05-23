/**
 * USDC contract addresses by chain. Keep in sync with compass-rs
 * `.env` (`ARC_USDC_ADDRESS`, `ARBITRUM_SEPOLIA_AAVE_USDC`).
 *
 * Note: Arc's USDC at 0x36…0000 is both the ERC20 token *and* the chain's
 * gas asset (gas pricing uses 18 decimals while the ERC20 interface
 * still reports 6). For ERC20 transfers we treat it as 6-decimal.
 */
export const ARC_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;
// Same address for both Circle Gateway destination + AAVE v3 reserve
// on Arbitrum Sepolia — the rare testnet where the two ecosystems
// agree on a single USDC. Keeps the bridge → supply flow swap-free.
export const ARBITRUM_SEPOLIA_USDC_ADDRESS =
  "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" as const;

/**
 * Minimal ERC20 ABI — only the methods FundModal needs.
 */
export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

/**
 * Public testnet faucet URLs. Surfaced in the FundModal so users with a
 * zero balance can grab test USDC without leaving the app context.
 */
export const ARC_FAUCET_URL = "https://faucet.arc.network/";
export const ARBITRUM_SEPOLIA_USDC_FAUCET_URL = "https://faucet.circle.com/";
