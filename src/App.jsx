// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { UnsupportedChainIdError } from "@web3-react/core";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

// We instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

const tokenModule = sdk.getTokenModule("0xA0CD276367227f04Eea06a6474407d5A6F757F1B");
const bundleDropModule = sdk.getBundleDropModule("0xD263bbcff505E47275FA35A0453555DC2E14BE74");
const voteModule = sdk.getVoteModule("0x0E149b0d81e50f9C886b77fe75Cf491eE97f5726");

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // State variables to handle voting
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Helper function to shorten a wallet address 
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to voteModule.getAll() to grab the proposals.
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal.
    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
      })
      .catch((err) => {
        console.error("Failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold our NFT (with tokenId 0).
    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresess) => {
        console.log("Members addresses", addresess)
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error("Failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  // Grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Amounts", amounts)
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("Failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  // useMemo caches the memberList even upon re-render: 
  //  https://www.w3schools.com/react/react_usememo.asp
  // Combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't
          // hold any of our token.
          memberTokenAmounts[address] ?? 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // Fires when signer is initilized and uses it to set sdk provider
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
        } else {
          setHasClaimedNFT(false);
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("Failed to obtain nft balance", error);
      });
  }, [address]);

  const mintNft = () => {
    console.log('Begin minting NFT...');
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    return bundleDropModule
      .claim("0", 1)
      .then(() => {
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT!
        console.log(
          `Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
        );
      })
      .catch((err) => {
        console.error("Failed to claim", err);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
      });
  }

  const extractVotes = () => {
    return proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        //abstain by default
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });
  };

  const castVote = async (vote) => {
    // Before voting we first need to check whether the proposal is open for voting
    // We first need to get the latest state of the proposal
    const proposal = await voteModule.get(vote.proposalId);
    // Then we check if the proposal is open for voting (state === 1 means it is open)
    if (proposal.state === 1) {
      // If it is open for voting, we'll vote on it
      return voteModule.vote(vote.proposalId, vote.vote);
    }
    // if the proposal is not open for voting we just return nothing, letting us continue
    return;
  }

  const executeProposal = async (vote) => {
    // We'll first get the latest state of the proposal again, since we may have just voted before
    const proposal = await voteModule.get(
      vote.proposalId
    );

    // If the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
    if (proposal.state === 4) {
      return voteModule.execute(vote.proposalId);
    }
  };

  const voteOnProposals = async () => {
    // lets get the votes from the form for the values
    const votes = extractVotes();

    // Make sure the user 'delegates' their token to vote
    try {
      // Check if the wallet still needs to delegate their tokens before they can vote
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }

      // Vote on the proposals
      try {
        await Promise.all(votes.map(castVote));

        try {
          // If any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(votes.map(executeProposal));

          // If we get here that means we successfully voted, so let's set the "hasVoted" state to true
          setHasVoted(true);
          console.log("Successfully voted");

        } catch (err) {
          console.error("Failed to execute votes", err);
        }
      } catch (err) {
        console.error("Failed to vote", err);
      }
    } catch (err) {
      console.error("Failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  };

  // Error handling for connection to wrong network
  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* TODO: refactor everything into a component */}

      {/* Case: not connected wallet */}
      {!address && (
        <>
          <h1>Welcome to NumtotDAO</h1>
          <button onClick={() => connectWallet("injected")} className="btn-hero">
            Connect your wallet
          </button>
        </>
      )}

      {/* Case: not a DAO member */}
      {address && !hasClaimedNFT && (
        <>
          <div className="mint-nft">
            <h1>Mint your free DAO Membership NFT</h1>
            <button
              disabled={isClaiming}
              onClick={mintNft}
            >
              {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
            </button>
          </div>
        </>
      )}

      {/* Case: DAO member */}
      {address && hasClaimedNFT && (
        <>
          <div className="member-page">
            <h1>NumtotDAO Member Page</h1>
            <p>Congratulations on being a Numtot</p>
            <div>
              <div>
                <h2>Member List</h2>
                <table className="card">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Token Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberList.map((member) => {
                      return (
                        <tr key={member.address}>
                          <td>{shortenAddress(member.address)}</td>
                          <td>{member.tokenAmount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <h2>Active Proposals</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsVoting(true);
                    voteOnProposals();
                  }}
                >
                  {proposals.map((proposal, index) => (
                    <div key={proposal.proposalId} className="card">
                      <h5>{proposal.description}</h5>
                      <div>
                        {proposal.votes.map((vote) => (
                          <div key={vote.type}>
                            <input
                              type="radio"
                              id={proposal.proposalId + "-" + vote.type}
                              name={proposal.proposalId}
                              value={vote.type}
                              //default the "abstain" vote to chedked
                              defaultChecked={vote.type === 2}
                            />
                            <label htmlFor={proposal.proposalId + "-" + vote.type}>
                              {vote.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={isVoting || hasVoted} type="submit">
                    {isVoting
                      ? "Voting..."
                      : hasVoted
                        ? "You Already Voted"
                        : "Submit Votes"}
                  </button>
                  <small>
                    This will trigger multiple transactions that you will need to
                    sign.
                  </small>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>);
};

export default App;