import { useEffect, useMemo, useState } from "react";

import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  // use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();

  console.log("👋 Address:", address);

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MovieDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>
  );
};

export default App;
