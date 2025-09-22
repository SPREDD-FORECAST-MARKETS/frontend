import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { base } from 'viem/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';



export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    // [base.id]: http(`https://mainnet.base.org`,{timeout: 60000}),
    [base.id]:   http(`https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,{timeout: 60000}),

  },
  pollingInterval: 10_000,
  connectors: [
    farcasterMiniApp() 
  ]
});

export const CONTRACT_ADDRESSES = {
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  factory: "0x47C93D6d12D7b6c135dBC4124600FFAf7D2d07Be",
  fpManager: "0x52bb1851EabD2c484AF8fde353c0C0058E4B0B97"
} as const;

