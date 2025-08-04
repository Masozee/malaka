declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    sw?: string;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      method?: string;
      options?: Record<string, unknown>;
    }>;
    buildExcludes?: RegExp[];
    mode?: 'production' | 'development';
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
    cacheOnFrontEndNav?: boolean;
    subdomainPrefix?: string;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}