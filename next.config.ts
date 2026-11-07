import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Visited routes stay alive in <Activity>: back from a project restores home exactly as it
  // was, so the tissue pull can play backwards into the same card.
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
