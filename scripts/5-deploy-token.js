import sdk from './1-initialize-sdk.js';

// In order to deploy the new contract we need our old friend the app module again.
const app = sdk.getAppModule("0xb4C21a5eeBbEf69e36f5659B3c96d734994E4c17");

(
  async () => {
    try {
      // Deploy a standard ERC-20 contract.
      const tokenModule = await app.deployTokenModule({
        // What's your token's name? Ex. "Ethereum"
        name: "MovieDAO Governance Token",
        // What's your token's symbol? Ex. "ETH"
        symbol: "MOVD",
      });
      console.log("✅ Successfully deployed token module, address:", tokenModule.address);
    } catch (error) {
      console.log("failed to deploy token module", error);
      process.exit(1);
    }
  }
)()