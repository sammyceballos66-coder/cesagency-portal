import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next.js 16 turned this on by default: Turbopack persists a filesystem
    // cache for the dev server across restarts. That's been causing edits
    // (CSS in particular) to not show up even after stopping/restarting
    // `npm run dev` — only deleting .next fixed it. Disabling it restores
    // the old behavior where a normal restart always picks up the latest
    // code.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
