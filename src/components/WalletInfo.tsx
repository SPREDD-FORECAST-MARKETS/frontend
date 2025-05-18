import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

const WalletInfo = () => {
  const { user, authenticated, ready } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated && user && user.wallet?.address) {
      setWalletAddress(user.wallet.address);
      //  query the blockchain for the balanc just placeholder for now
      setBalance('0.00 ETH');
    }
  }, [authenticated, user]);

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 text-white">
      <h3 className="text-lg font-medium mb-2">Wallet Information</h3>
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Address: </span>
          <span className="font-mono">
            {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Balance: </span>
          <span>{balance || '0.00 ETH'}</span>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;