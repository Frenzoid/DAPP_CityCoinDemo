import ContractMeta from "./contractMeta.json";

const { abi } = require(`../artifacts/contracts/${ContractMeta.name}.sol/${ContractMeta.name}.json`);


const NETWORKS = {
    localhost: {
        name: "localhost",
        color: "#666666",
        chainId: 31337,
    },
    rinkeby: {
        name: "rinkeby",
        color: "#e0d068",
        chainId: 4,
    },
    ropsten: {
        name: "ropsten",
        color: "#F60D09",
        chainId: 3,
    },
    mumbai: {
        name: "mumbai",
        color: "#92D9FA",
        chainId: 80001,
    },
    goerli: {
        name: "goerli",
        color: "#00D0D0",
        chainId: 420,
    },
}

export const CONTRACT_ABI = abi;
export const CONTRACT_ADDRESS = ContractMeta.address;
export const DEPLOYER_ADDRESS = ContractMeta.deployer;
export const DEPLOYED_NETWORK = NETWORKS[ContractMeta.network];