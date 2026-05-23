"use client";

import { ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";
import { sdk } from "@farcaster/miniapp-sdk";
import { wagmiConfig } from "@/lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

function MiniAppReadyGate() {
  useEffect(() => {
    let cancelled = false;
    sdk
      .isInMiniApp()
      .then((inMiniApp) => {
        if (cancelled || !inMiniApp) return;
        sdk.actions.ready().catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#E2E8F0",
            accentColorForeground: "#0A1428",
            borderRadius: "large",
            fontStack: "system",
          })}
        >
          <MiniAppReadyGate />
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                fontFamily: "var(--f-body)",
                fontSize: "13px",
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
