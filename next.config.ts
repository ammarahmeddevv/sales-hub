import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // don't generate AGENTS.md / CLAUDE.md on `next dev`
  agentRules: false,
};

export default nextConfig;
