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
  factory: "0x18080fB292586e8DB1dD08698cd1a168E5F8B669",
  fpManager: "0x8F982751CDc4FCfD8505999f7C0dC285C0D39616"
} as const
