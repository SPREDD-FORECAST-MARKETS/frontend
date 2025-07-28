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
  factory: "0xF9f8751EfbD8017fF9fAA398a991b36a23EcbA7B",
  fpManager: "0xf9B163C376113DD402491dFFe3FC84241Be668C4"
} as const


// export const CONTRACT_ADDRESSES = {
//   token: "0x4a2661Ab44eD073Eb8a5834cBcBD287bfB4d1CFF",
//   factory: "0x18080fB292586e8DB1dD08698cd1a168E5F8B669",
//   fpManager: "0x8F982751CDc4FCfD8505999f7C0dC285C0D39616"
// } as const                                                                   OLD
