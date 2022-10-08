require('dotenv').config();

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {account0} = await getNamedAccounts();

    await deploy('TestToken', {
        from: account0,
        args: ["Wrapped Ether","WETH"],
        log: true,
      });
  
    await deploy('TestToken', {
    from: account0,
    args: ["DAI Stablecoin","DAI"],
    log: true,
    });

}