import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 
   * better-sqlite3 adalah native module (C++), perlu di-exclude dari bundling.
   * Tanpa ini, Next.js akan error saat build karena gagal bundle .node file.
   */
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
