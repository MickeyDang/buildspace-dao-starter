import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule("0xA0CD276367227f04Eea06a6474407d5A6F757F1B");

(async () => {
  try {
    console.log(
      "Roles that exist right now:",
      await tokenModule.getAllRoleMembers()
    );

    // Revoke all the superpowers your wallet had over the ERC-20 contract.
    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);

    console.log(
      "Roles after revoking ourselves",
      await tokenModule.getAllRoleMembers()
    );
  } catch (error) {
    console.error("Failed to revoke ourselves from the DAO treasury", error);
  }
})();