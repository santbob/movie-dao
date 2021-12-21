import ethers from 'ethers';
import sdk from './1-initialize-sdk.js'
import { readFileSync } from 'fs';

const app = sdk.getAppModule("0xb4C21a5eeBbEf69e36f5659B3c96d734994E4c17");

(

  async () => {
    try {
      const bundleDropModule = await app.deployBundleDropModule({
        // the collection's namen ex. CryptoPunks
        name: "MovieDAO Membership",
        // the description of the collection
        description: "A DAO for MovieDAO Membership to vote to certify movies",
        // the image of the collection that will show on the opensea marketplace
        icon: readFileSync("scripts/assets/movieDAO.png"),
        // We need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module.
        // We're planning on not charging people for the drop, so we'll pass in the 0x0 address
        // you can set this to your own wallet address if you want to charge for the drop.
        primarySaleRecipientAddress: ethers.constants.AddressZero
      });
    } catch (e) {
      console.log("Failed to deploy drop", e);
      process.exit(1);
    }
  }
)();

