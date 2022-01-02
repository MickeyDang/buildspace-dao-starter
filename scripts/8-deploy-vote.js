import sdk from "./1-initialize-sdk.js";

const thirdWebAddress = "0x9643225C208B32d8fFBdC17Eba9a06B6B346661C";
const tokenAddress = "0xA0CD276367227f04Eea06a6474407d5A6F757F1B";

// Grab the app module address.
const appModule = sdk.getAppModule(thirdWebAddress);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "NumtotDAO's Proposals",
      votingTokenAddress: tokenAddress,
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 5,
      minimumNumberOfTokensNeededToPropose: "10",
    });

    console.log(
      "Successfully deployed vote module, address:",
      voteModule.address,
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();