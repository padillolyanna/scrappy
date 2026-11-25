import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Re-fetch dynamic pages on every soft navigation so users always see
    // current content without a manual refresh.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
