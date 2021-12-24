import sdk from './1-initialize-sdk.js';
// grab the app module
const appModule = sdk.getAppModule("0xb4C21a5eeBbEf69e36f5659B3c96d734994E4c17");

(
  async () => {
    try {
      const voteModule = await appModule.deployVoteModule({
        // give your governance contract a nme
        name: "MovieDAO Proposals",
        // This is the location of your governance token contract - ERC-20 token.
        votingTokenAddress: "0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff",
        // proposal wait time in seconds before it can be voted on.
        proposalStartWaitTimeInSeconds: 0,
        // How long do members have to vote on a proposal when it's created?
        // Here, we set it to 24 hours (86400 seconds)
        proposalVotingTimeInSeconds: 24 * 60 * 60,
        // % of token holders that must vote for a proposal to pass.
        votingQuorumFraction: 0,
        // What's the minimum # of tokens a user needs to be allowed to create a proposal?
        // I set it to 0. Meaning no tokens are required for a user to be allowed to
        // create a proposal.
        minimumNumberOfTokensNeededToPropose: "0",
      });
      console.log("✅ Successfully deployed vote module, address:", voteModule.address);
    } catch (error) {
      console.error("Failed to deploy vote module", error);
    }
  }
)();