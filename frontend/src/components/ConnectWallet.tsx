import React, { useEffect, useState } from 'react';
import { useEthereum } from '../contexts/EthereumContext';

const ConnectWallet: React.FC = () => {
  const { account, contract, isAdmin, isIssuer, connectWallet } = useEthereum();
  const [uniName, setUniName] = useState<string | null>(null);

  useEffect(() => {
    if (isIssuer && contract && account) {
      contract.universityNames(account).then((name: string) => setUniName(name)).catch(() => setUniName(null));
    } else {
      setUniName(null);
    }
  }, [isIssuer, contract, account]);

  const handleConnect = async () => {
    await connectWallet();
  };

  if (!account) {
    return <button onClick={handleConnect}>Connect Wallet</button>;
  }

  let role = 'Student';
  if (isAdmin) role = 'Admin';
  else if (isIssuer) role = 'University';

  const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);

  return (
    <span>
      {role === 'University' && uniName
        ? `University: ${uniName} (${shortAddress})`
        : `${role}: ${shortAddress}`}
    </span>
  );
};

export default ConnectWallet;
