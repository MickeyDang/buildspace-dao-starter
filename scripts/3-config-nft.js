import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDropAddress = "0xD263bbcff505E47275FA35A0453555DC2E14BE74";
const bundleDrop = sdk.getBundleDropModule(
  bundleDropAddress,
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Octocard",
        description: "This NFT will give you access to NumtotDAO!",
        image: readFileSync("scripts/assets/mtr-logo.png"),
      },
    ]);
    console.log("Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();