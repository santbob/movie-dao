import { useEffect, useState } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x06736665Bf21139469Cc7A281486A55Af82b74e6"
);

const App = () => {
  // use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, provider } = useWeb3();
  console.log("👋 Address:", address);

  const signer = provider ? provider.getSigner() : undefined;

  // boolen to track if NFT has been claimed
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // boolen to track if NFT is being claimed
  const [isClaimingNFT, setIsClaimingNFT] = useState(false);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);
  useEffect(() => {
    if (!address) {
      return;
    }

    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to fetch nft balance", error);
      });
  }, [address]);

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

  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>MovieDAO Member Page</h1>
        <p>Congratulations on being a member</p>
      </div>
    );
  }

  const mintNFT = () => {
    setIsClaimingNFT(true);
    bundleDropModule
      .claim("0", 1)
      .catch((error) => {
        console.error("failed to mint nft", error);
        setIsClaimingNFT(false);
      })
      .finally(() => {
        // stop loading state
        setIsClaimingNFT(false);
        // set claim state
        setHasClaimedNFT(true);
        console.log(
          `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      });
  };

  return (
    <div className="mint-nft">
      <h1>Mint your free MovieDAO membership NFT</h1>
      <button disabled={isClaimingNFT} onClick={mintNFT}>
        {isClaimingNFT ? "Minting..." : "Mint your NFT"}
      </button>
    </div>
  );
};

export default App;
