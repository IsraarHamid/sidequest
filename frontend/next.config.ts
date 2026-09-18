import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Lean, self-contained server bundle for Docker/containers.
  output: "standalone",
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
