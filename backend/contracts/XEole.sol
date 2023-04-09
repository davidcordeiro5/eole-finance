// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.16;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Eole.sol";

/// @title xEole is ERC20 you can deposit your ERC20 Eole to mint xEole. You can stake your xEole to earn Eole the yearly inflation by your share of pool. If you want withdraw your Eole you need to waiting for the unlocking time. 30 days or 6month, if you choose 30 days you will get slash 50% of your stake.
/// @author David CORDEIRO
/// @custom:formation This contract has been made for a formation.


contract XEole is ERC20, Ownable  {
  using SafeMath for uint;

  struct Users {
    uint eoleStaked;
    uint xEoleStaked;
    uint reward;
    uint updateAt;
    uint startStakeAt;
    uint withdrawStakeAt;
    uint unlockTime;
    uint8 unlockTimeEoleChooded;
    bool stopEarning;
  }

  Eole immutable eole;

  uint constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;
  uint receivedReward;

  address feeVaultAddress;

  mapping(address => Users) user;
  uint totalXEoleStaked;

  event XEoleMinted(address minter, uint amount);
  event StakedXEole(address minter, uint amount);
  event Claim(address sender, uint amountTokenClaimed);
  event CompoundingReward(address sender, uint amount);
  event UnlockingEole(address sender, uint unlockStartAt, bool slashed, uint amount);



  constructor(address _eoleToken, address _feeVaultAddress) ERC20("xEole", "xEOLE") {
    eole = Eole(_eoleToken);
    receivedReward = eole.getTotalRewardDistributed();
    feeVaultAddress = _feeVaultAddress;
    // _mint(_teamAddress, eole.balanceOf(_teamAddress));
  }

  modifier checkEoleBalance (address _addrToCheck, uint _amount) {
    require(eole.balanceOf(_addrToCheck) >= _amount, "Your Eole balance is insufficient");
    _;
  }

  /** GETTERS */
  /// @return Eole deposed by the sender
  function getEoleDeposit() external view returns (uint) {
    return user[msg.sender].eoleStaked;
  }

  /// @return xEole staked by the sender
  function getXEoleStaked() external view returns (uint) {
    return user[msg.sender].xEoleStaked;
  }

  function getUserReaward () external view returns(uint) {
    return user[msg.sender].reward;
  }

  function getUserStartStakeAt () external view returns(uint) {
    return user[msg.sender].startStakeAt;
  }

  function getUserUpdateAt () external view returns(uint) {
    return user[msg.sender].updateAt;
  }

  function getTimestamp () external view returns(uint) {
    return block.timestamp;
  }

  function getUnlockTimeEoleChooded () external view returns(uint8) {
    return user[msg.sender].unlockTimeEoleChooded;
  }

  function getUnlockEoleAutorize () external view returns(bool) {
    return user[msg.sender].stopEarning;
  }

  /// @notice Calculate the shard of pool of a Sender, mul by 1e18 to get small share. We need this result for the reward calcul
  /// @return ShardOfPool of the sender
  function getShardOfPool () public view returns (uint) {
    if (balanceOf(address(this)) == 0 || user[msg.sender].xEoleStaked == 0) {
      return 0;
    }

    // return (user[msg.sender].xEoleStaked)
    //   .div(balanceOf(address(this)))
    //   .mul(1e18);

    return ((user[msg.sender].xEoleStaked)
      .mul(1e18))
      .div(balanceOf(address(this)));
  }

  /// @return dailyReward of the sender
  function getDailyReward () public view returns (uint) {
    uint dailyReward = eole.getXEoleRewardRate().div(365);
    return getShardOfPool().mul(dailyReward).div(1e18);
  }


  function getRewardPerSecond() public view returns (uint) {
    return getDailyReward() / 86400;
  }

function getMin (uint _startDate, uint _endSate) private pure returns (uint) {
    return _startDate < _endSate ? _startDate : _endSate;
}

  function getRewardEarned () public view returns (uint) {
    if (user[msg.sender].startStakeAt == 0) {
      return 0;
    } else if (user[msg.sender].updateAt == 0) {
        return getRewardPerSecond()
          .mul(block.timestamp - user[msg.sender].startStakeAt);
    } else {
        return getRewardPerSecond()
          .mul(block.timestamp - user[msg.sender].updateAt);

    }
  }

  function getTotalXEoleStaked () public view returns (uint) {
    return  totalXEoleStaked;
  }

  function updateReceivedRewardForPool() external {
    receivedReward = eole.getTotalRewardDistributed();
  }

  /**
    * Requirements:
    *  - This contact need to be approved by Eole contract before `transferFrom`.
    * @param _amount: amount deposit
  */
  function depositEole (uint _amount) external checkEoleBalance(msg.sender, _amount) {

    // the sender deposits his eole in to this contract
    require(eole.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    // add eole deposited to sender balance staked
    user[msg.sender].eoleStaked += _amount;

    // mint xEole in the sender wallet
    _mint(msg.sender, _amount);
    emit XEoleMinted(msg.sender, _amount);
  }

  function stakeXEole (uint _amount) external {
    require(_amount > 0, "You can stake 0 xEole");
    require(balanceOf(msg.sender) >= _amount, "Your balance is insufficient");

    approve(msg.sender, _amount);
    require(transferFrom(msg.sender, address(this), _amount), "Transfer failed");

    if (user[msg.sender].xEoleStaked <= 0) {
      user[msg.sender].startStakeAt = block.timestamp;
    } else {
      user[msg.sender].updateAt = block.timestamp;
    }

    totalXEoleStaked += _amount;
    user[msg.sender].xEoleStaked += _amount;

    emit StakedXEole(msg.sender, _amount);
  }

  function compound () public {
    if (!user[msg.sender].stopEarning) {
      uint currentReward = getRewardEarned();
      require(currentReward > 0, "Not reward");

      user[msg.sender].updateAt = block.timestamp;
      user[msg.sender].xEoleStaked += currentReward;
      totalXEoleStaked += currentReward;


      emit CompoundingReward(msg.sender, currentReward);
    }
  }

  function unlockEole(uint8 lockTimeChoosed) external {
    require(lockTimeChoosed == 1 || lockTimeChoosed == 0,
    "Bad unclock time choosed");
    require(!user[msg.sender].stopEarning, "Unlock already started");
    require(user[msg.sender].withdrawStakeAt == 0, "Unlock already started");
    require(user[msg.sender].xEoleStaked > 0, "Your stake is empty");

    compound();

    user[msg.sender].stopEarning = true;

    uint monthInSeconde = 30 * 24 * 60 * 60;
    uint sixMonthInSeconde = monthInSeconde.mul(6);

    uint xEoleAmount = user[msg.sender].xEoleStaked;

    // lockTimeChoosed === 0 ? unclockTime well be 30 days
    // with 5O% of stake slash
    if (lockTimeChoosed == 0) {
      user[msg.sender].unlockTime = block.timestamp + monthInSeconde;
      _burn(address(this), xEoleAmount);

      uint slash = xEoleAmount.div(2);
      user[msg.sender].xEoleStaked = 0;
      user[msg.sender].eoleStaked = slash;
      totalXEoleStaked -= xEoleAmount;
      eole.transfer(feeVaultAddress, slash);

      emit UnlockingEole(msg.sender, block.timestamp, true, slash);
    // lockTimeChoosed === 1 ? unclockTime well be 30 days
    // with no slash
    } else if (lockTimeChoosed == 1) {
      user[msg.sender].unlockTime = block.timestamp + sixMonthInSeconde;
      _burn(address(this), xEoleAmount);

      user[msg.sender].xEoleStaked = 0;
      totalXEoleStaked -= xEoleAmount;
      user[msg.sender].eoleStaked = xEoleAmount;

      emit UnlockingEole(msg.sender, block.timestamp, false, xEoleAmount);
    }

    user[msg.sender].withdrawStakeAt = block.timestamp;
  }

  function getUnlockedTokenPerSec () public view returns (uint) {
    require(user[msg.sender].stopEarning, "Unlock Eole not started");
    require(user[msg.sender].eoleStaked > 0, "Nothing to claim");

    uint unlockTime = user[msg.sender].unlockTime - block.timestamp;
    uint unlockTimeToDay = unlockTime.div(86400);
    uint dailyReward = user[msg.sender].eoleStaked.div(unlockTimeToDay);

    return dailyReward.div(86400);
  }

  function claim () external  {
    require(user[msg.sender].stopEarning, "Unlock Eole not started");
    require(user[msg.sender].eoleStaked > 0, "Nothing to claim");
    uint unlockedToken = getUnlockedTokenPerSec();

    user[msg.sender].eoleStaked -= unlockedToken;

    eole.transfer(msg.sender, unlockedToken);
    emit Claim(msg.sender, unlockedToken);
  }
}
