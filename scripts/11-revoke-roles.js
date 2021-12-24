import sdk from './1-initialize-sdk.js';

// grab the token module
// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule("0xd62eA1A48A5a567819992a3E6825b2c1bb8e10ff");

(
  async () => {
    try {
      // log all role members
      console.log(
        "👀 Roles that exist right now:",
        await tokenModule.getAllRoleMembers()
      );
      // Revoke all the superpowers your wallet had over the ERC-20 contract.
      await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);

      console.log(
        "🎉 Roles after revoking ourselves:",
        await tokenModule.getAllRoleMembers()
      );

      console.log("✅ Successfully revoked our superpowers from the ERC-20 contract");

    } catch (error) {
      console.error("Failed to revoke ourselves from the DAO treasury", error);
    }
  }
)();