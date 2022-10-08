// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract Implementation{
    IUniswapV2Router02 constant public uni = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    
    event InvalidData();

    function tokensToToken(address maker, IERC20[] calldata tokensIn, IERC20 tokenOut, uint256[] calldata tokensInAmount, uint256 tokenOutAmount)external{
    require(tokensIn.length == tokensInAmount.length, "Arrays must have the same length");
    for(uint i = 0; i < tokensIn.length; i++){
        require(tokensIn[i].balanceOf(address(this)) >= tokensInAmount[i], "Tokens not received");

        tokensIn[i].approve(address(uni), tokensInAmount[i]);
        address[] memory path = new address[](2);
        path[0] = address(tokensIn[i]);
        path[1] = address(tokenOut);
        uni.swapExactTokensForTokens(tokensInAmount[i], tokenOutAmount, path, address(this), block.timestamp + 30);
    }

    tokenOut.transfer(maker, tokenOutAmount);

  }

  fallback() external{
    revert("Invalid call to implementation");
  }
}