import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow mobile devices on the same Wi-Fi / Local Network to access dev chunks
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '192.168.219.106',
    '192.168.219.106:3000',
  ],
};

export default nextConfig;
