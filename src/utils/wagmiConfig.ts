import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { base } from 'viem/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';



export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]:   http(`https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,{timeout: 60000}),

  },
  pollingInterval: 10_000,
  connectors: [
    farcasterMiniApp() 
  ]
});

export const CONTRACT_ADDRESSES = {
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  factory: "0x7910aEb89f4843457d90cb26161EebA34d39EB60",
  fpManager: "0x377DdE21CF1d613DFB7Cec34a05232Eea77FAe7f"
} as const;