import { useEffect, useRef, useState } from "react";
import { utils } from "ethers";
import { DEPLOYER_ADDRESS } from "../config/constants";
import { getStatic } from "ethers/lib/utils";

export default function Vendor({ onTransaction, setOnTransaction, wrongNetwork, contract, getSigner, onAccountChanged, getENSorAdress, getBalance }) {

  // Forms
  const [tokensToBuy, setTokensToBuy] = useState(0);
  const [tokensToSell, setTokensToSell] = useState(0);

  // Contract display view data and state.
  const [contractSupply, setContractSupply] = useState(0);
  const [contractBalance, setContractBalance] = useState(0)
  const [contractTokenPrice, setContractTokenPrice] = useState(0);
  const [contractSymbol, setContractSymbol] = useState("");
  const [contractPausedStatus, setContractPausedStatus] = useState("");
  const [contractOwnerAddress, setContractOwnerAddress] = useState("");

  // Current connected account display view data and balance.
  const [userTokenBalane, setUserTokenBalance] = useState(0);
  const [userEtherBalance, setUserEtherBalance] = useState(0);
  const [userENS, setUserENS] = useState("");
  const [userAddress, setUserAddress] = useState("");


  // Effects.
  useEffect(() => {
    // If we are in the correct network ( network where our contract is deployed ), request data to contract.
    if (!wrongNetwork) reloadViewData();
  }, [wrongNetwork, onAccountChanged]);


  // Init functions.
  const reloadViewData = () => {
    getUserTokenBalance();
    getUserEtherBalance();
    getUserENSandAddress();

    getContractERCSymbol();
    getContractERCTokenPrice();
    getContractERCSupply();
    getContractBalance();

    getContractPausedStatus();
    getContractOwnerAddress();
  }

  // Contract data grabbers.
  const getContractERCSupply = async () => {
    const supply = await contract.balanceOf(contract.address);
    setContractSupply(utils.formatEther(supply), { pad: true });
  }

  const getContractERCTokenPrice = async () => {
    const price = await contract.ctcPrice();
    setContractTokenPrice(utils.formatEther(price), { pad: true });
  }

  const getContractBalance = async () => {
    const bal = await getBalance(contract.address);
    setContractBalance(utils.formatEther(bal), { pad: true });
  }

  const getContractERCSymbol = async () => {
    const symbol = await contract.symbol();
    setContractSymbol(symbol);
  }

  const getContractPausedStatus = async () => {
    const paused = await contract.paused();
    setContractPausedStatus(paused);
  }

  const getContractOwnerAddress = async () => {
    const owner = await contract.owner();
    setContractOwnerAddress(owner);
  }

  const getUserTokenBalance = async () => {
    const tbal = await contract.balanceOf(await getSigner().getAddress());
    setUserTokenBalance(utils.formatEther(tbal), { pad: true });
  }

  const getUserEtherBalance = async () => {
    const ebal = await getSigner().getBalance();
    setUserEtherBalance(utils.formatEther(ebal), { pad: true });
  }

  const getUserENSandAddress = async () => {
    const [ens, address] = await Promise.all([
      getENSorAdress(await getSigner().getAddress()),
      getSigner().getAddress()
    ]);

    setUserAddress(address);
    setUserENS(ens);
  }


  // Contract transaction (methods calls) functions.
  const buyTokens = async () => {
    setOnTransaction(true);
    try {
      const ether = utils.parseEther((tokensToBuy * contractTokenPrice).toString());
      const tx = await contract.buyTokens({ value: ether });
      await tx.wait();
    } catch (e) {
      console.error(e)
    } finally {
      setOnTransaction(false);
    }
    reloadViewData();

  }

  const sellTokens = async () => {
    setOnTransaction(true);
    try {
      const tx = await contract.sellTokens(tokensToSell);
      await tx.wait();
    } catch (e) {
      console.error(e)
    } finally {
      setOnTransaction(false);
    }
    reloadViewData();
  }

  const pause = async () => {
    setOnTransaction(true);
    try {
      const tx = await contract.pause();
      await tx.wait();
    } catch (e) {
      console.error(e)
    } finally {
      setOnTransaction(false);
    }
    reloadViewData();
  }

  const unPause = async () => {
    setOnTransaction(true);
    try {
      const tx = await contract.unpause();
      await tx.wait();
    } catch (e) {
      console.error(e)
    } finally {
      setOnTransaction(false);
    }
    reloadViewData();
  }


  // Components render.
  const renderBody = () => {
    return (
      <div>
        <h2 className={"text-center mt-3"}>CityCoin {contractSymbol} Vendor</h2>
        <hr />

        <label className={"text-secondary"}>You are {userENS}</label>
        <div className={"d-flex flex-row justify-content-around mt-5"}>
          <div className={"d-fex flex-col"}>
            <h3>Contract Supply: {contractSupply} CTC</h3>
            <label className={"text-secondary text-center m-1"}>Your {contractSymbol} balance: {userTokenBalane}</label>
            <div className={"input-group mb-1"}>
              <input type="number" className={"form-control"} onChange={(e) => setTokensToBuy(e.target.value)} placeholder="Ammount of Tokens" />
              <div className={"input-group-append"} >
                <button className={"btn btn-secondary"} onClick={buyTokens} type="button">Buy</button>
              </div>
            </div>
            <label className={"m-2"}>Purchase price: {tokensToBuy * contractTokenPrice}</label>
          </div>
          <div className={"d-fex flex-col"}>
            <h3>Contract Balance: {contractBalance} Ether</h3>
            <label className={"text-secondary text-center m-1"}>Your Ether balance: {userEtherBalance}</label>
            <div className={"input-group mb-3"}>
              <input type="number" className={"form-control"} onChange={(e) => setTokensToSell(e.target.value)} placeholder="Ammount of Tokens" />
              <div className={"input-group-append"} >
                <button className={"btn btn-secondary"} onClick={sellTokens} type="button">Sell</button>
              </div>
            </div>
            <label className={"m-2"}>Retrieved Ether: {tokensToSell * contractTokenPrice}</label>
          </div >
        </div >

        {renderPauseButton()}
        {renderLoadingGif()}
      </div >
    );
  }


  const renderLoadingGif = () => {
    if (onTransaction)
      return (
        <div className={"text-center mt-4"} >
          <hr />

          <h4>Transaction in progress</h4>
          <img width="50%"
            src="./loading.gif" alt="Loading..." />
        </div>
      );
  }

  const renderPauseButton = () => {
    if (contractOwnerAddress === userAddress) {
      return (
        <div className={"d-flex flex-column"}>
          <hr />

          <label className={"text-secondary mb-2 mt-3"}>Contract Stauts: <strong>{contractPausedStatus ? "Paused" : "Unpaused"}</strong></label>
          {!contractPausedStatus ?
            <div className={"d-flex flex-column"}>
              <button className={"btn btn-outline-danger"} onClick={pause}>Pause</button>
              <label className={"m-2 text-danger"}>Pausing the contract will disable all transactions until status is resumed.</label>
            </div>
            :
            <div className={"d-flex flex-column"}>
              <button className={"btn btn-outline-success"} onClick={unPause}>Unpause</button>
              <label className={"m-2 text-success"}>Unpausing the contract will allow all transactions until status is paused.</label>
            </div>
          }
        </div>
      )
    }
  }

  return (
    renderBody()
  );
}