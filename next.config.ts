import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // gera um servidor enxuto em .next/standalone, usado pela imagem Docker.
  // So no Docker (BUILD_STANDALONE=1 no Dockerfile): na Vercel o standalone quebra o deploy
  // ("ENOENT .next/next-server.js.nft.json"), porque ela empacota o Next do jeito dela.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;