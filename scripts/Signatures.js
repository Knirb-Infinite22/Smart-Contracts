const { ethers } = require("hardhat");
const brink = require("@brinkninja/sdk");

const verifier = {};
const implementation = require("./implementai");

// Call function to create new order message object
async function signOrder(signer, tokenIn, tokenOut, inAmount, outAmount){
    const accountSigner = brink.accountSigner(signer, "goerli");

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
          tokenIn,
          tokenOut,
          inAmount,
          outAmount,
          '999999999999999999999999'
        ]
      }
    
    const signedMessage = await accountSigner.signMetaDelegateCall(verifier.address, call);
    const data = await implementation.populateTransaction.tokensToToken(signer.address, [tokenIn], tokenOut, [inAmount], outAmount);

    return {signedMessage,data};

}

// Call to submit a new order object
async function submitOrder(signer, implementation, {signedMessage, data}){
    const provider = ethers.provider;
    
    const account = brink.account(signer.address, {provider, signer});
    
    const test = await account.metaDelegateCall(signedMessage, [implementation.address, implementation.address, data.data]);
}

const signer = ethers.Wallet(PRIVATE_KEY);

const implementation = await ethers.getContractAt(implementation.abi,implementation.address);

