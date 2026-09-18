import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 모드에서 사내망 다른 기기(예: 192.168.x.x)로 접속했을 때
  // HMR 등 dev 리소스가 cross-origin으로 차단되지 않도록 허용.
  allowedDevOrigins: ["192.168.246.179"],
};

export default nextConfig;
