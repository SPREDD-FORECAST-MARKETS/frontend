import type { PrivyClientConfig } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet', 'email', 'twitter', 'telegram'],
  appearance: {
    theme: 'dark',
    accentColor: '#14b8a6', 
    logo: '/logo.png',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  supportedChains: [base, baseSepolia],
};

export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;