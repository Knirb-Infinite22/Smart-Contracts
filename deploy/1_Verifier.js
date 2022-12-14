const CallExecutor = "0xDE61dfE5fbF3F4Df70B16D0618f69B96A2754bf8";
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {account0} = await getNamedAccounts();

    await deploy('StopLimitSwapVerifier', {
        from: account0,
        args: [CallExecutor],
        log: true,
      });
}
module.exports.tags = ['Verifier'];