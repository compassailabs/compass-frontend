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

const SITE_URL = "https://testnet.usecompassai.com";
const SITE_NAME = "Compass AI";
const SITE_DESC = "Compass is a non-custodial, AI-driven yield agent for multi-chain USDC on Arc";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "USDC",
    "yield aggregator",
    "AI agent",
    "Circle Gateway",
    "AAVE",
    "Arc",
    "Arbitrum",
    "ERC-4337",
    "account abstraction",
    "DeFi",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/web-app-manifest-192x192.png",
  },
  manifest: "/site.webmanifest",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#0A1428",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Compass" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="h-dvh antialiased">
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
