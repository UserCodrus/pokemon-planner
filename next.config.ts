import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'export',
	basePath: '/pokemon-planner',
	images: { unoptimized: true }
};

export default nextConfig;
