import { useEffect, useRef, useState } from "react";
import { utils } from "ethers";
import { DEPLOYER_ADDRESS } from "../config/constants";
import { getStatic } from "ethers/lib/utils";

export default function Vendor({ onTransaction, setOnTransaction, wrongNetwork, contract, signer, getENSorAdress, getBalance }) {

  const [tokensToBuy, setTokensToBuy] = useState(0);
  const [tokensToSell, setTokensToSell] = useState(0);

  const [contractSupply, setContractSupply] = useState(0);
  const [contractBalance, setContractBalance] = useState(0)
  const [contractTokenPrice, setContractTokenPrice] = useState(0);
  const [contractSymbol, setContractSymbol] = useState("");

  const [userTokenBalane, setUserTokenBalance] = useState(0);
  const [userEtherBalance, setUserEtherBalance] = useState(0);

  // Effects.
  useEffect(() => {
    // If we are in the correct network ( network where our contract is deployed ), request data to contract.
    if (!wrongNetwork) reloadViewData();
  }, [wrongNetwork]);


  // Init functions.
  const reloadViewData = () => {
    getSymbol();
    getSupply();
    getContractBalance();
    getTokenPrice();
    getUserTokenBalance();
    getUserEtherBalance();
  }

  const getSupply = async () => {
    const supply = await contract.balanceOf(contract.address);
    setContractSupply(utils.formatEther(supply), { pad: true });
  }

  const getContractBalance = async () => {
    const bal = await getBalance(contract.address);
    setContractBalance(utils.formatEther(bal), { pad: true });
  }

  const getSymbol = async () => {
    const symbol = await contract.symbol();
    setContractSymbol(symbol);
  }

  const getTokenPrice = async () => {
    const price = await contract.ctcPrice();
    setContractTokenPrice(utils.formatEther(price), { pad: true });
  }

  const getUserTokenBalance = async () => {
    const tbal = await contract.balanceOf(await signer.getAddress());
    setUserTokenBalance(utils.formatEther(tbal), { pad: true });
  }

  const getUserEtherBalance = async () => {
    const ebal = await signer.getBalance();
    setUserEtherBalance(utils.formatEther(ebal), { pad: true });
  }

  // Transactions.

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

  // Components render.
  const renderBody = () => {
    return (
      <div>
        <h2 className={"text-center mt-3"}>{contractSymbol} vendor</h2>
        <div className={"d-flex flex-row justify-content-around mt-3"}>
          <div className={"d-fex flex-col"}>
            <h3>Contract Supply: {contractSupply} CTC</h3>
            <label className={"text-secondary text-center m-1"}>Your {contractSymbol} balance: {userTokenBalane}</label>
            <div className={"input-group mb-1"}>
              <input type="number" className={"form-control"} onChange={(e) => setTokensToBuy(e.target.value)} placeholder="Ammount of Tokens" ></input>
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
              <input type="number" className={"form-control"} onChange={(e) => setTokensToSell(e.target.value)} placeholder="Ammount of Tokens" ></input>
              <div className={"input-group-append"} >
                <button className={"btn btn-secondary"} onClick={sellTokens} type="button">Sell</button>
              </div>
            </div>
            <label className={"m-2"}>Retrieved Ether: {tokensToSell * contractTokenPrice}</label>
          </div >
        </div >
        {renderLoadingGif()}
      </div >
    );
  }


  const renderLoadingGif = () => {
    if (onTransaction)
      return (
        <div className={"text-center mt-4"} >
          <h4>Transaction in progress</h4>
          <img width="50%"
            src="./loading.gif" alt="Loading..." />
        </div>
      );
  }


  return (
    renderBody()
  );
}