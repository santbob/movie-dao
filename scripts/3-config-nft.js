import sdk from './1-initialize-sdk.js';
import { readFileSync } from 'fs';

const bundleDropModule = sdk.getBundleDropModule("0x06736665Bf21139469Cc7A281486A55Af82b74e6");

(
  async () => {
    try {
      await bundleDropModule.createBatch([
        {
          name: "Movie Critic",
          description: "This NFT will give you access to critic a movie in MovieDAO",
          image: readFileSync("scripts/assets/critic_nft.png"),
        }
      ]);
      console.log("✅ Successfully created a new NFT in the drop!");
    } catch (error) {
      console.log("failed to create the new NFT", error);
      process.exit(1);
    }
  }
)();  