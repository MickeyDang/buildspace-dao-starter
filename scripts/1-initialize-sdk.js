import thirdWebSDK from "@3rdweb/sdk";
const { ThirdwebSDK } = thirdWebSDK;
import ethers from "ethers";
//Importing and configuring our .env file that we use to securely store our environment variables
import dotenv from "dotenv";

dotenv.config();

// Some quick checks to make sure our .env is working.
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
    console.error("Private key not found.");
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == "") {
    console.error("Alchemy API URL not found.");
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
    console.error("Wallet Address not found.");
}

// create sdk with provided wallet
const sdk = new ThirdwebSDK(
    new ethers.Wallet(
        // Your wallet private key. ALWAYS KEEP THIS PRIVATE, DO NOT SHARE IT WITH ANYONE, add it to your .env file and do not commit that file to github!
        process.env.PRIVATE_KEY,
        // RPC URL, we'll use our Alchemy API URL from our .env file.
        ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
    ),
);

// essentially an anon run function
(async () => {
    // try running a script
    // to verify we can obtain the thirdweb app we created in their dashboard
    try {
        const apps = await sdk.getApps();
        console.log("Your app address is:", apps[0].address);
    } catch (err) {
        console.error("Failed to get apps from the sdk", err);
        process.exit(1);
    }
})();

// We are exporting the initialized thirdweb SDK 
// so that we can use it in our other scripts
export default sdk;
