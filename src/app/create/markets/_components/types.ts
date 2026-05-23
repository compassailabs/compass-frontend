export type ChainFilter = "all" | "arc" | "arbitrum_sepolia";
export type ProtocolFilter = "all" | "aave" | "idle";

export const CHAIN_FILTERS: {
  f: ChainFilter;
  label: string;
  icon?: string;
}[] = [
  { f: "all", label: "All" },
  { f: "arc", label: "Arc", icon: "/icons/arc.svg" },
  { f: "arbitrum_sepolia", label: "Arbitrum", icon: "/icons/arbitrum.svg" },
];

export const PROTOCOL_FILTERS: { f: ProtocolFilter; label: string }[] = [
  { f: "all", label: "All" },
  { f: "aave", label: "AAVE" },
  { f: "idle", label: "Available" },
];

export const MIN_MARKETS = 1;
