import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

const tokenModule = sdk.getTokenModule("0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff");

(
  async () => {
    try {
      // What is the maximum supply you want to set. Ex. 1_000_000 is a 1 million token supply.
      const amount = 1_000_000;
      // we use the utils function parseUtils to convert the number to 18 digit number which is the standard for ERC-20 token.
      const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
      // interact with the contract to mint the tokens.
      await tokenModule.mint(amountWith18Decimals);

      const totalSupply = await tokenModule.totalSupply();
      console.log(`✅ There is now ${ethers.utils.formatUnits(totalSupply, 18)} $MOVD in circulation`);
    } catch (error) {
      console.error("Failed to print money", error);
      process.exit(1);
    }
  }
)();