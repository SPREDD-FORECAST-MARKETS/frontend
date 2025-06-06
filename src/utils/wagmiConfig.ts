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


// 0x4a2661Ab44eD073Eb8a5834cBcBD287bfB4d1CFF    swapnils usdt token address
// 0x1a3b347fd06620B014C9F0f54933023F3B6803d3 swapnils factory address





//0xed1064b1b5B0b7a309b088E038CbCB49A3b84f3F token addreeess new shlok

//0xAc5A11fA0db24a8B759D2A4c8C2b80672625E58B shlok factory address new



