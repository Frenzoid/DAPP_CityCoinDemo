import Head from 'next/head';

import Web3Modal from "web3modal";

import { providers, Contract } from "ethers";
import { useEffect, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS, DEPLOYED_NETWORK, DEPLOYER_ADDRESS } from "../config/constants";

import Vendor from '../components/Vendor';

export default function Home() {

  const [web3provider, setWeb3provider] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [onTransaction, setOnTransaction] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(true);

  // Wallet Connect function, calls to connect the wallet, and initalized all web3 components of the react app.
  const connect = async () => {
    const web3mod = getWeb3Modal();
    const provider = await web3mod.connect();

    // When provider changes, calls init();
    setWeb3provider(provider);
    setWalletConnected(true);
  }

  // Web3 Functions.
  const getWeb3Modal = () => {
    const web3mod = new Web3Modal({
      network: DEPLOYED_NETWORK.name,
      cacheProvider: true,
      displayNoInjectedProvider: true,
      providerOptions: {},
    });

    return web3mod;
  }

  const getBalance = async (address) => {
    return await (getEthersProvider().getBalance(address));
  }

  const getEthersProvider = () => {
    const provider = new providers.Web3Provider(web3provider);
    return provider;
  }

  const getSigner = () => {
    const provider = getEthersProvider();
    const signer = provider.getSigner();
    return signer;
  }

  const getContract = () => {
    const signer = getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return contract;
  }

  const getENSorAdress = async (adress) => {
    const provider = getEthersProvider();
    const ens = await provider.lookupAddress(adress);
    return ens || adress;
  }


  // Behaviours
  const init = () => {
    // When new provider is connected, check network.
    checkNetwork();

    // Set events.
    web3provider.on('chainChanged', _ => checkNetwork());
  }

  const checkNetwork = async () => {
    const signer = getSigner();
    if (await signer.getChainId() !== DEPLOYED_NETWORK.chainId)
      setWrongNetwork(true)
    else setWrongNetwork(false);
  }

  // Use effects.
  // Uncomment to connect when page loads.
  useEffect(() => {
    // Connect when page loads.
    if (!walletConnected) connect();
  });

  useEffect(() => {
    // If provider changes, initializes new provider.
    if (web3provider) init();
  }, [web3provider]);


  const renderWrongNetworkErrorHeader = () => {
    if (walletConnected && wrongNetwork) {
      return (
        <div className={"alert alert-warning text-center"} role="alert">
          Wrong network selected, please switch to <a href="#" className={"alert-link"}>{DEPLOYED_NETWORK.name}</a>.
        </div>
      );
    }
  }

  const renderConnectButton = () => {
    if (!walletConnected) {
      return (
        <div className={"text-center"}>
          <button className={"btn btn-primary mt-4 mx-auto"} onClick={connect}>
            Connect Wallet
          </button>
        </div>
      )
    }
  }

  const renderBody = () => {
    if (walletConnected && !wrongNetwork) {
      return (
        <div>
          <Vendor
            onTransaction={onTransaction}
            setOnTransaction={setOnTransaction}
            wrongNetwork={wrongNetwork}
            contract={getContract()}
            signer={getSigner()}
            getENSorAdress={getENSorAdress}
            getBalance={getBalance}
          />
        </div>
      );
    }
  }




  // Main return.
  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {renderWrongNetworkErrorHeader()}
      <div className={"container"}>
        {renderConnectButton()}
        {renderBody()}
        <footer className={"text-center fixed-bottom"}>Created by <a href="https://frenzoid.dev" className={"text-primary"}>{DEPLOYER_ADDRESS} - MrFrenzoid</a> </footer>
      </div>
    </div>
  )
}
