// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.16;

contract SimpleStorage {
  uint private value;

  event SettedValue(address user, uint value);

  function getValue () external view returns(uint) {
    return value;
  }

  function setValue (uint _newValue) external {
    value = _newValue;
    emit SettedValue(msg.sender, _newValue);
  }
}
