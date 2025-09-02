import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { base } from 'viem/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(`https://base-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`),  },
  connectors:[
    farcasterMiniApp()
  ]
});


export const CONTRACT_ADDRESSES = {
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  factory: "0x7910aEb89f4843457d90cb26161EebA34d39EB60",
  fpManager: "0x377DdE21CF1d613DFB7Cec34a05232Eea77FAe7f"
} as const


// export const CONTRACT_ADDRESSES = {
//   token: "0x4a2661Ab44eD073Eb8a5834cBcBD287bfB4d1CFF",
//   factory: "0x18080fB292586e8DB1dD08698cd1a168E5F8B669",
//   fpManager: "0x8F982751CDc4FCfD8505999f7C0dC285C0D39616"
// } as const                                                                   OLD
