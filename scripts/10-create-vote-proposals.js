import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteContractAddress = "0x0E149b0d81e50f9C886b77fe75Cf491eE97f5726";
const voteModule = sdk.getVoteModule(voteContractAddress);

const tokenAddress = "0xA0CD276367227f04Eea06a6474407d5A6F757F1B";
const tokenModule = sdk.getTokenModule(tokenAddress);

// Create two hard-coded proposals via this script
(async () => {
    try {
        await tokenModule.delegateTo(process.env.WALLET_ADDRESS);
        const amount = 420_000;
        // Proposal to mint 420,000 new token to the treasury.
        await voteModule.propose(
            `Should the DAO mint an additional ${amount} tokens into the treasury?`,
            [
                {
                    // Our nativeToken is ETH. nativeTokenValue is the amount of ETH we want
                    // to send in this proposal. In this case, we're sending 0 ETH.
                    // We're just minting new tokens to the treasury. So, set to 0.
                    nativeTokenValue: 0,
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        // We're doing a mint action.
                        // We're minting to the voteModule, which is acting as our treasury.
                        "mint",
                        [
                            voteModule.address,
                            ethers.utils.parseUnits(amount.toString(), 18),
                        ]
                    ),
                    // Our token module that actually executes the mint.
                    toAddress: tokenModule.address,
                },
            ]
        );

        console.log("Successfully created proposal to mint tokens");
    } catch (error) {
        console.error("Failed to create first proposal", error);
        process.exit(1);
    }

    try {
        const amount = 6_900;
        // Create proposal to transfer ourselves 6,900 tokens
        await voteModule.propose(
            `
      Should the DAO transfer ${amount} tokens from the treasury 
      to ${process.env.WALLET_ADDRESS} for being awesome?
      `,
            [
                {
                    // Again, we're sending ourselves 0 ETH. Just sending our own token.
                    nativeTokenValue: 0,
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        // We're doing a transfer action from the treasury to our wallet.
                        "transfer",
                        [
                            process.env.WALLET_ADDRESS,
                            ethers.utils.parseUnits(amount.toString(), 18),
                        ]
                    ),

                    toAddress: tokenModule.address,
                },
            ]
        );

        console.log(
            "Successfully created proposal to reward ourselves from the treasury"
        );
    } catch (error) {
        console.error("Failed to create second proposal", error);
    }
})();

