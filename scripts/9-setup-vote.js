import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

// grab the vote module
// This is our governance contract.
const voteModule = sdk.getBundleDropModule("  ");

// grab the token module
// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule("0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff");

(
  async () => {
    try {
      // Give our treasury the power to mint additional token if needed.
      await tokenModule.grantRole("minter", voteModule.address);
      console.log("✅ Successfully gave vote module permissions to act on token module");
    } catch (error) {
      console.log("failed to grant vote module permissions on token module", error);
      process.exit(1);
    }

    try {
      // Grab our wallet's token balance, remember -- we hold basically the entire supply right now!
      const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);
      // convert to number
      const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
      // find the 90% value
      const percent90 = ownedAmount.div(100).mul(90);
      // transfer 90% of our token to the vote module
      await tokenModule.transfer(voteModule.address, percent90);
      console.log("✅ Successfully transferred tokens to vote module");
    } catch (error) {
      console.error("failed to transfer tokens to vote module", error);
      process.exit(1);
    }
  }
)();