// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract Oracle {
  uint constant public ONE_HUNDRED_PERCENT = 100;

  mapping(address => uint) public testPrices;

  function setPriceOf(address _token, uint _price) external {
    testPrices[_token] = _price;
  }

  function _isPriceValid(IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount) public view returns(bool){
    uint totalInUSD;
    totalInUSD += (tokenInAmount * testPrices[address(tokenIn)]);
    
    uint usdReqOut = testPrices[address(tokenOut)] * tokenOutAmount;
    require(totalInUSD > 0 && usdReqOut > 0, "Cannot have 0");
    return(totalInUSD <= usdReqOut);
  }

}