import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { baseSepolia } from 'viem/chains';


export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});


export const CONTRACT_ADDRESSES = {
  token: "0x4a2661Ab44eD073Eb8a5834cBcBD287bfB4d1CFF",
  factory: "0x1a3b347fd06620B014C9F0f54933023F3B6803d3"
} as const
