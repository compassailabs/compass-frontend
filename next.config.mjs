import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  /**
   * Same-origin proxy to the compass-rs backend.
   *
   * Browser → /api/* → Next server → BACKEND_URL/* → compass-rs
   *
   * Trade-offs:
   *   - `BACKEND_URL` has NO `NEXT_PUBLIC_` prefix → it's a server-only
   *     env, never bundled into the client. Real backend host is hidden.
   *   - Single origin → no CORS, no extra preflight, no env var the
   *     browser has to know about.
   *   - SSE (chat stream) passes through transparently — Next.js
   *     rewrites are a connection-level proxy, not a buffered fetch.
   *   - If we later need auth / rate-limit / response reshape on a
   *     specific endpoint, promote it to a `app/api/<name>/route.ts`
   *     handler; rewrites only catches what doesn't have an explicit
   *     route handler.
   */
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:8787";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
