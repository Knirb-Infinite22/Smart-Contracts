require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
require('hardhat-deploy')

const forkingAccounts = [
  {
    privateKey: process.env.PRIVATE_KEY,
    balance: `100${"0".repeat(18)}`,
  }
];
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.14",
  networks:{
    goerli:{
      url: `https://eth-goerli.g.alchemy.com/v2/`+process.env.GORELI_API_KEY,
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
      accounts: forkingAccounts,
      forking: {
        url: `https://eth-goerli.g.alchemy.com/v2/`+process.env.GORELI_API_KEY,
        enabled: true,
        timeout: 0,
      },
    },
  },
  namedAccounts: {
    account0: 0
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};
