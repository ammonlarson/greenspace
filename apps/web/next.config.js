/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@greenspace/shared"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
