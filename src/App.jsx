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

// grab the vote module
// This is our governance contract.
const voteModule = sdk.getVoteModule(
  "0x31b8B0d03fD6Abc6B86DfFc946F922a3B62E635b"
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

  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [proposals, setProposals] = useState([]);

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

  // useEffect to get the proposals
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    voteModule
      .getAll()
      .then((props) => {
        console.log("🌈 Proposals:", props);
        setProposals(props);
      })
      .catch((err) => {
        console.log("failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // useEffect to get if the user voted
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((voted) => {
        setHasVoted(voted);
        console.log("🥵 User has already voted");
      })
      .catch((err) => {
        console.error("failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

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
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You Already Voted"
                  : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
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
