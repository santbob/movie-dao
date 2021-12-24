import { useEffect, useState, useMemo } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x06736665Bf21139469Cc7A281486A55Af82b74e6"
);

// we can grab a reference to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  "0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff"
);

const App = () => {
  // use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, provider } = useWeb3();
  console.log("👋 Address:", address);
  // boolen to track if NFT has been claimed
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // boolen to track if NFT is being claimed
  const [isClaimingNFT, setIsClaimingNFT] = useState(false);
  // holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // array holding the member addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  const signer = provider ? provider.getSigner() : undefined;

  // set the signer of the provider to the SDK
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  // useEffect to get the member addresses
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("🚀 Members addresses", addresses);
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.log("failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // useEffect to get the token amounts for each member
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.log("failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  const memberList = useMemo(() => {
    return memberAddresses.map((walletAddress) => {
      return {
        address: walletAddress,
        // converting to 18 decimals the format for ERC-20 token contract.
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't hold any of our token.
          memberTokenAmounts[walletAddress] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // checks whether the current user has claimedNFT
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
        <h1>🎥DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
