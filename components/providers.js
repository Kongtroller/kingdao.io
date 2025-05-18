'use client';

import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import chainConfig, { getSupportedChains } from '@/config/chainConfig';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY;

if (!projectId) throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined.");

const queryClient = new QueryClient();

const metadata = {
  name: 'KingDAO.io',
  description: 'KingDAO Hub',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icons: ['/favicon.ico'],
};

const chains = getSupportedChains();
const networks = chains.map(c => c.viem);

const customRpcUrls = {};
chains.forEach(({ viem, alchemySlug, customRpc }) => {
  const key = `eip155:${viem.id}`;

  if (customRpc) {
    customRpcUrls[key] = [{ url: customRpc }];
  } else if (alchemyApiKey && alchemySlug) {
    customRpcUrls[key] = [{
      url: `https://${alchemySlug}.g.alchemy.com/v2/${alchemyApiKey}`
    }];
  }
});

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  metadata,
  customRpcUrls,
  ssr: false,
});

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  customRpcUrls,
  features: { analytics: true },
  themeMode: "light",
});

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wagmiConfig = wagmiAdapter.wagmiConfig;
  if (!wagmiConfig) return <div>Configuration Error</div>;

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {mounted ? children : null}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
