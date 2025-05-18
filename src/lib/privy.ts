import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet', 'email'],
  appearance: {
    theme: 'dark',
    accentColor: '#14b8a6', 
    logo: '/logo.jpg',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
};

export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;