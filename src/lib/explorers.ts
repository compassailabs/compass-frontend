import type { ChainId } from "@/lib/api";

const ARC_EXPLORER = "https://testnet.arcscan.app";
const ARBITRUM_SEPOLIA_EXPLORER = "https://sepolia.arbiscan.io";

export function chainExplorerBase(chain: ChainId | null | undefined): string | null {
  if (!chain) return null;
  return chain === "arc" ? ARC_EXPLORER : ARBITRUM_SEPOLIA_EXPLORER;
}

export function txExplorerUrl(
  chain: ChainId | null | undefined,
  txHash: string | null | undefined,
): string | null {
  const base = chainExplorerBase(chain);
  if (!base || !txHash) return null;
  return `${base}/tx/${txHash}`;
}

export function addressExplorerUrl(
  chain: ChainId | null | undefined,
  address: string | null | undefined,
): string | null {
  const base = chainExplorerBase(chain);
  if (!base || !address) return null;
  return `${base}/address/${address}`;
}

export function chainDisplayName(chain: ChainId): string {
  return chain === "arc" ? "Arc Testnet" : "Arbitrum Sepolia";
}
