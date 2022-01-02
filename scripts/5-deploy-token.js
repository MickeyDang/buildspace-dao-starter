import sdk from "./1-initialize-sdk.js";

const thirdWebAddress = "0x9643225C208B32d8fFBdC17Eba9a06B6B346661C";
const app = sdk.getAppModule(thirdWebAddress);

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // What's your token's name? Ex. "Ethereum"
      name: "NumtotDAO Governance Token",
      // What's your token's symbol? Ex. "ETH"
      symbol: "TRAINS",
    });
    console.log(
      "Successfully deployed token module, address:",
      tokenModule.address,
    );
  } catch (error) {
    console.error("Failed to deploy token module", error);
  }
})();