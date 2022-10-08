const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const brink = require("@brinkninja/sdk");
const { Wallet } = require("ethers");

let accounts;
let callExecutor, implementation, verifier, usdc, weth;

describe("Knirb", function () {
  before(async function() {
    accounts = await hre.ethers.getSigners();
    const CallExecutor = await ethers.getContractFactory("CallExecutor");
    const Implementation = await ethers.getContractFactory("Implementation");
    const Verifier = await ethers.getContractFactory("StopLimitSwapVerifier");
    const TestToken = await ethers.getContractFactory("TestToken");

    callExecutor = await CallExecutor.deploy();
    implementation = await Implementation.deploy();
    verifier = await Verifier.deploy(callExecutor.address);
    usdc = await TestToken.deploy();
    weth = await TestToken.deploy();

    const Uni = await ethers.getContractAt("IUniswapV2Router02","0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");

    await usdc.approve(Uni.address, toWei("200000"));
    await weth.approve(Uni.address, toWei("100"));
    await Uni.addLiquidity(
      usdc.address,
      weth.address,
      toWei('200000'),
      toWei('100'),
      0,
      0,
      accounts[0].address,
      "99999999999999999"
    );
  });

  describe("unsignedTest", async function(){
    it("Approves token transfer", async function(){
      await weth.approve(verifier.address, toWei("10"));
    });

    it("Tests Implementation", async function(){
      const balBefore = await usdc.balanceOf(accounts[0].address);
      await weth.transfer(implementation.address, toWei('1'));
      await implementation.tokensToToken(accounts[0].address, [weth.address], usdc.address, [toWei('1')], toWei('1970'));
      const balAfter = await usdc.balanceOf(accounts[0].address);
      expect(balBefore.add(toWei('1970'))).to.equal(balAfter);
    });

    it('Sets test prices', async function(){
      await verifier.setPriceOf(usdc.address, toWei('1'));
      await verifier.setPriceOf(weth.address, toWei('2000'));
    });

    it.only('Calls func', async function(){
      const balBefore = await usdc.balanceOf(accounts[0].address);
      const abiCoder = ethers.utils.defaultAbiCoder;
      
      const data = await implementation.populateTransaction.tokensToToken(accounts[0].address, [weth.address], usdc.address, [toWei('1')], toWei('1970'));
      // const data = abiCoder.encode(["address", "address[]", "address", "uint[]", "uint"], [accounts[0].address, [weth.address], usdc.address, [toWei('1')], toWei('1970')]);
      console.log(data);
      const call = {
        functionName: 'tokenToToken',
        paramTypes: [
          { name: 'bitmapIndex', type: 'uint256', signed: true },
          { name: 'bit', type: 'uint256', signed: true },
          { name: 'tokenIn', type: 'address', signed: true },
          { name: 'tokenOut', type: 'address', signed: true},
          { name: 'tokenInAmount', type: 'uint256', signed: true },
          { name: 'tokenOutAmount', type: 'uint256', signed: true },
          { name: 'expiryBlock', type: 'uint256', signed: true },
          { name: 'recipient', type: 'address', signed: false},
          { name: 'to', type: 'address', signed: false },
          { name: 'data', type: 'bytes', signed: false }
        ],
        params: [
          '0',
          '1',
          weth.address,
          usdc.address,
          toWei('1'),
          toWei('1970'),
          '999999999999999999999999'
        ]
      }

      const provider = ethers.provider;

      const accountSigner = brink.accountSigner(accounts[0], "hardhat");
      const account = brink.account(accounts[0].address, {provider, signer: accounts[0]});

      const signedMessage = await accountSigner.signMetaDelegateCall(verifier.address, call);
      await weth.approve(accountSigner.accountAddress(), toWei('1'));
      const test = await account.metaDelegateCall(signedMessage, [implementation.address, implementation.address, data.data]);
      const balAfter = await usdc.balanceOf(accounts[0].address);

      expect(balBefore.add(toWei('1970'))).to.equal(balAfter);
    });
  });
  // it("test", async function () {
  //   console.log(callExecutor.address);
  // });
})

function toWei(num){
  return ethers.utils.parseEther(num);
}
