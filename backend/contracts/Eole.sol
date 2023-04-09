// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Eole is ERC20, Ownable {
  using SafeMath for uint;

  address xEoleAddress;
  uint256 constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;

  uint256 constant COMU_ALLOCATION = TOTAL_SUPPLY * 55 / 100;
  uint256 constant TEAM_ALLOCATION = TOTAL_SUPPLY * 15 / 100;
  uint256 constant VC_ALLOCATION = TOTAL_SUPPLY * 8 / 100;

  uint256 lastExecutionTime;
  uint256 rewardDistributed;

  // Faucet une testnet if you want
  // event FaucetUsed(address sender, uint amount);
  event TransferInflationReward(address to, uint date, uint amount);

  constructor (address _teamAddress, address _vc) ERC20("EOLE", "EOLE") {
    _mint(owner(), COMU_ALLOCATION);
    _mint(_teamAddress, TEAM_ALLOCATION);
    _mint(_vc, VC_ALLOCATION);
  }

  // modifier to call one function per year
  modifier oncePerYear {
    require(msg.sender == owner(), "Only the owner can call this function");
    require(block.timestamp - lastExecutionTime >= 365 days, "Function transfer inflation reward can be call now");
    _;
    lastExecutionTime = block.timestamp;
  }

  // setter to get xEole (ERC20) address
  function setXEoleAddress (address _xEoleAddress) external onlyOwner {
    xEoleAddress = _xEoleAddress;
  }

  // -- GETTERS --
  //fuction pure that return inflation raward (9% of total COMU_ALLOCATION)
  function getInflationReward () internal pure returns(uint) {
    return COMU_ALLOCATION.mul(9).div(100);
  }

  //fuction pure that return 50% of getInflationReward
  // 50 % of inflationReward for xEole staking
  function getXEoleRewardRate () external pure returns(uint) {
    return getInflationReward().mul(50).div(100);
  }

  //return all reward distributed
  function getTotalRewardDistributed () external view returns(uint) {
    return rewardDistributed;
  }


  // function can be called one time per year bu the owner to send inflation rewards
  function transferInflationReward(address _xEoleAddress) external oncePerYear onlyOwner payable {
    require(xEoleAddress != address(0), "Set xEole first");
    require(xEoleAddress == _xEoleAddress, "Bad xEole address");
    require(balanceOf(owner()) >= getInflationReward(), "Not enough tokens in the contract");

    rewardDistributed += getInflationReward();

    _transfer(owner(), _xEoleAddress, getInflationReward());

    emit TransferInflationReward(
      _xEoleAddress, block.timestamp, getInflationReward());
  }

  // function faucet(uint256 amount) public {
  //   require(amount > 0, "Amount should be greater than 0");
  //   require(balanceOf(owner()) >= amount, "Not enough tokens in the contract");
  //   _transfer(owner(), msg.sender, amount);
  //   emit FaucetUsed(msg.sender, amount);
  // }
}
