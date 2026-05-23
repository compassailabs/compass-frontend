import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { SvgDefs } from "@/components/visuals/SvgDefs";
import { AppHeader } from "@/components/chrome/AppHeader";
import { NetworkGuard } from "@/components/chrome/NetworkGuard";
import { FundModal } from "@/components/account/FundModal";
import { SendToWalletModal } from "@/components/account/SendToWalletModal";
import { SessionSetupModal } from "@/components/account/SessionSetupModal";
import { WithdrawModal } from "@/components/account/WithdrawModal";
import { UserStatePoller } from "@/components/chrome/UserStatePoller";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1428",
};

export const metadata: Metadata = {
  title: "Compass AI — Create your Compass",
  description: "Create your Compass. Fund it with USDC. Earn on Arc.",
  applicationName: "Compass AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-dvh">
        <SvgDefs />
        <Providers>
          <div className="flex flex-col h-dvh">
            <UserStatePoller />
            <AppHeader />
            <NetworkGuard />
            <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
            <SessionSetupModal />
            <FundModal />
            <WithdrawModal />
            <SendToWalletModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
