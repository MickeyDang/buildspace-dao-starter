import sdk from "./1-initialize-sdk.js";

const bundleDropAddress = "0xD263bbcff505E47275FA35A0453555DC2E14BE74";
const bundleDrop = sdk.getBundleDropModule(
  bundleDropAddress,
);

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    claimConditionFactory.newClaimPhase({
      startTime: new Date(), // can start minting as of now
      maxQuantity: 50_000, // max 50K
      maxQuantityPerTransaction: 1, // max quantity of 1
    });
    
    // Our first deployed NFT gets an id = 0 automatically
    // This function tells chain to assign NFT of id = 0 with this claim condition
    // We could mint another NFT with id = 1 (ie special roles etc)...
    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log(
        "Successfully set claim condition on bundle drop:", 
        bundleDrop.address
    );
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();