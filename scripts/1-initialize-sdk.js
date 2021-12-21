import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from 'ethers';

//importing the .env file that we used to securely store our keys
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== '') {
  console.log("🛑 Private Key not found.")
}

if (!process.env.WALLET_ADDRESS && process.env.WALLET_ADDRESS !== '') {
  console.log("🛑 Public Key  not found.")
}

if (!process.env.ALCHEMY_API_URL && process.env.ALCHEMY_API_URL !== '') {
  console.log("🛑 Alchemy Url not found.");
}

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    // Your wallet private key. ALWAYS KEEP THIS PRIVATE, DO NOT SHARE IT WITH ANYONE, add it to your .env file and do not commit that file to github!
    process.env.PRIVATE_KEY,
    // RPC URL, we'll use our Alchemy API URL from our .env file.
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  ),
);

(
  async () => {
    try {
      const apps = await sdk.getApps();
      console.log("Your app's address is ", apps[0].address);
    } catch (e) {
      console.log("Failed to get apps from the sdk", e);
      process.exit(1);
    }
  }
)();

// We are exporting the initialized thirdweb SDK so that we can use it in our other scripts
export default sdk;