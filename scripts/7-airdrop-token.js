import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

// This is the address to our ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule("0x06736665Bf21139469Cc7A281486A55Af82b74e6");

// This is the address to our ERC-20 token contract.
const tokenModule = sdk.getTokenModule("0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff");

(
  async () => {
    try {
      // Grab all the addresses of the people who own our membership NFT, which has a tokenId of 0.
      const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

      if (walletAddresses.length === 0) {
        console.log("No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!");
        process.exit(0);
      }

      const airdropTargets = walletAddresses.map(walletAddress => {
        //pick a random amount between 1000 and 10000
        const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
        console.log(`${walletAddress} will receive ${randomAmount} $MOVD`);

        // Set up the target.
        const airdropTarget = {
          address: walletAddress,
          amount: ethers.utils.parseUnits(randomAmount.toString(), 18), 
        }

        return airdropTarget;
      });

      // Call transferBatch on all our airdrop targets.
      console.log("🌈 Starting airdrop...")
      await tokenModule.transferBatch(airdropTargets);
      console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
    } catch (error) {
      console.error("Failed to airdrop tokens", err);
    }
  }
)();