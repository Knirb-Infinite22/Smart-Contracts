// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract Oracle {
  uint constant public ONE_HUNDRED_PERCENT = 100;

  mapping(address => uint) public testPrices;

  function setPriceOf(address _token, uint _price) external {
    testPrices[_token] = _price;
  }

  function _isPriceValid(IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount) internal returns(bool){
    uint totalInUSD;
    totalInUSD += (tokenInAmount * _getChainlinkPriceOf(tokenIn));

    uint usdReqOut = _getChainlinkPriceOf(tokenOut) * tokenOutAmount;

    return(totalInUSD <= usdReqOut);
  }

  function _getChainlinkPriceOf(IERC20 _token) internal returns(uint){
    return testPrices[address(_token)];
  }

}