// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20{
    constructor(string memory name, string memory symbol) ERC20(name, symbol){
        _mint(msg.sender, 10000000 ether);
    }

    function mint(address _to, uint _amount) external{
        _mint(_to, _amount);
    }
}