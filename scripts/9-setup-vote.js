import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteContractAddress = "0x0E149b0d81e50f9C886b77fe75Cf491eE97f5726";
const tokenAddress = "0xA0CD276367227f04Eea06a6474407d5A6F757F1B";

// This is our governance contract.
const voteModule = sdk.getVoteModule(voteContractAddress);

// This is our ERC-20 contract.
const tokenModule = sdk.getTokenModule(tokenAddress);

(async () => {
  try {
    // Give our treasury the power to mint additional token if needed.
    await tokenModule.grantRole("minter", voteModule.address);

    console.log(
      "Successfully gave vote module permissions to act on token module"
    );
  } catch (error) {
    console.error(
      "Failed to grant vote module permissions on token module",
      error
    );
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );

    // Grab 90% of the supply that we hold.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(5);

    // Transfer 90% of the supply to our voting contract.
    await tokenModule.transfer(
      voteModule.address,
      percent90
    );

    console.log("Successfully transferred tokens to vote module");
  } catch (err) {
    console.error("Failed to transfer tokens to vote module", err);
  }
})();