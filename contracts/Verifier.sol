// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./Interfaces/ICallExecutor.sol";
import "./Libraries/Bit.sol";
import {Oracle} from "./Oracle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOracle{
  function isPriceValid(IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount) external view returns(bool);
}

/// @title Verifier for ERC20 limit swaps
/// @notice These functions should be executed by metaPartialSignedDelegateCall() on Brink account proxy contracts
contract StopLimitSwapVerifier{
  /// @dev Revert when limit swap is expired
  error Expired();

  /// @dev Revert when swap has not received enough of the output asset to be fulfilled
  error NotEnoughReceived(uint256 amountReceived);

  event InvalidData();

  ICallExecutor internal immutable CALL_EXECUTOR;

  constructor(ICallExecutor callExecutor) {
    CALL_EXECUTOR = callExecutor;
  }

  /// @dev Executes an ERC20 to ERC20 limit swap
  /// @notice This should be executed by metaDelegateCall() or metaDelegateCall_EIP1271() with the following signed and unsigned params
  /// @param bitmapIndex The index of the replay bit's bytes32 slot [signed]
  /// @param bit The value of the replay bit [signed]
  /// @param tokenIn The input token provided for the swap [signed]
  /// @param tokenOut The output token required to be received from the swap [signed]
  /// @param tokenInAmount Amount of tokenIn provided [signed]
  /// @param tokenOutAmount Amount of tokenOut required to be received [signed]
  /// @param expiryBlock The block when the swap expires [signed]
  /// @param to Address of the contract that will fulfill the swap [unsigned]
  /// @param data Data to execute on the `to` contract to fulfill the swap [unsigned]
  function tokenToToken(
    uint256 bitmapIndex, uint256 bit, IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount,
    uint256 expiryBlock, address recipient, address to, bytes calldata data
  )
    external
  {
    // Oracle Check
    require(IOracle(address(0x378f110af67faD24a7e4311D6B33c81d5810B089)).isPriceValid(tokenIn, tokenOut, tokenInAmount, tokenOutAmount), "Price too high");

    if (expiryBlock <= block.number) {
      revert Expired();
    }
  
    Bit.useBit(bitmapIndex, bit);

    address owner = proxyOwner();

    uint256 tokenOutBalance = tokenOut.balanceOf(owner);

    tokenIn.transferFrom(owner, recipient, tokenInAmount);

    CALL_EXECUTOR.proxyCall(to, data);

    uint256 tokenOutAmountReceived = tokenOut.balanceOf(owner) - tokenOutBalance;

    // todo find out what this is all about
    if (tokenOutAmountReceived < tokenOutAmount) {
      revert NotEnoughReceived(tokenOutAmountReceived);
    }
  }

  /// @dev Returns the owner address for the proxy
  /// @return _proxyOwner The owner address for the proxy
  function proxyOwner() internal view returns (address _proxyOwner) {
    assembly {
      // copies to "scratch space" 0 memory pointer
      extcodecopy(address(), 0, 0x28, 0x14)
      _proxyOwner := shr(0x60, mload(0))
    }
  }

    fallback() external{
    emit InvalidData();
  }


}