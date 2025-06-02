import {createConfig} from '@privy-io/wagmi';
import { http } from 'viem';
import { base,sepolia} from 'viem/chains';


export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});


export const CONTRACT_ADDRESSES = {
  [base.id]: {
    factory: '0x...', // Your deployed factory address
  },
  [sepolia.id]: {
    factory: '0x0fcd9457E434E5D956a197A4810f6E706317f5F7', 
  },
} as const