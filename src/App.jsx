// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address);

  return (
    <div className="landing">
      {/* Prompt to connect wallet if no address */}
      {/* TODO: refactor into a component */}
      {!address && (
        <>
          <h1>Welcome to NarutoDAO</h1>
          <button onClick={() => connectWallet("injected")} className="btn-hero">
            Connect your wallet
          </button>
        </>
      )}

      {/* Main Screen */}
      {address && (<>
        <h1>👀 wallet connected, now what!</h1>
      </>)}
    </div>);
};

export default App;