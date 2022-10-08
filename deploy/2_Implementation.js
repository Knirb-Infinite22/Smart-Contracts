require('dotenv').config();

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {account0} = await getNamedAccounts();

    await deploy('Implementation', {
        from: account0,
        args: [],
        log: true,
      });
  
}