// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Oracle {
  mapping(address => uint) public testPrices;

  constructor(){
    // easy set prices
    testPrices[0x6bAd8529bB6530A7EE00BD55A62c507ab2dC6AE8] = 1;
    testPrices[0x7F25168fd1668691546Aa994b90A124b94d38998] = 2000;
  }

  function setPriceOf(address _token, uint _price) external {
    testPrices[_token] = _price;
  }

  function isPriceValid(IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount) external view returns(bool){
    uint totalInUSD;
    totalInUSD += (tokenInAmount * testPrices[address(tokenIn)]);
    
    uint usdReqOut = testPrices[address(tokenOut)] * tokenOutAmount;
    require(totalInUSD > 0 && usdReqOut > 0, "Cannot have 0");
    return(totalInUSD <= usdReqOut);
  }

}