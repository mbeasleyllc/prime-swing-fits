/** @type {import('next').NextConfig} */
import { createRequire } from "module";

// Check if element-tagger is available
function isElementTaggerAvailable() {
  try {
    const require = createRequire(import.meta.url);
    require.resolve("@softgenai/element-tagger");
    return true;
  } catch {
    return false;
  }
}

// Build turbo rules only if tagger is available
function getTurboRules() {
  if (!isElementTaggerAvailable()) {
    console.log(
      "[Softgen] Element tagger not found, skipping loader configuration"
    );
    return {};
  }

  return {
    "*.tsx": ["@softgenai/element-tagger"],
    "*.jsx": ["@softgenai/element-tagger"],
  };
}

const nextConfig = {
    reactStrictMode: true,
  output: 'standalone',
  turbopack: {
    rules: getTurboRules(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: ["*.daytona.work", "*.softgen.dev"],
};
experimental: {
workerThreads: false,
cpus: 1,
},
webpack: (config, { isServer }) => {
config.optimization = {
 moduleIds: 'deterministic',
 splitChunks: {
   chunks: 'all',
   cacheGroups: {
     default: false,
     vendors: false,
   },
 },
};
config.infrastructureLogging = { level: 'error' };
return config;
},

export default nextConfig;
