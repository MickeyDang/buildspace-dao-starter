import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// Address to ERC-1155 membership NFT contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0xD263bbcff505E47275FA35A0453555DC2E14BE74"
);

// Address to ERC-20 token contract.
const tokenModule = sdk.getTokenModule(
  "0xA0CD276367227f04Eea06a6474407d5A6F757F1B"
);

const tokenQtyPrecision = 18;

(async () => {
  try {
    // Grab all the addresses of people who own our membership NFT, which has 
    // a tokenId of 0.
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");
    // Loop through the array of addresses.
    const airdropTargets = walletAddresses.map((address) => {
      // Pick a random # between 1000 and 10000.
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("Going to airdrop", randomAmount, "tokens to", address);
      
      // Set up the target.
      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), tokenQtyPrecision),
      };
  
      return airdropTarget;
    });
    
    // Call transferBatch on all our airdrop targets.
    console.log("🌈 Starting airdrop...")
    await tokenModule.transferBatch(airdropTargets);
    console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
  } catch (err) {
    console.error("Failed to airdrop tokens", err);
  }
})();