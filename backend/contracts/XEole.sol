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
    uint startRewardStakingAt;
    uint startStakeAt;
    uint withdrawStakeAt;
    uint unlockTime;
    bool stopEarning;
  }

  Eole immutable eole;
  
  uint constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;
  uint receivedReward;

  address feeVaultAddress;


  mapping(address => Users) user;
  mapping(address => uint) exBalance;

  event XEoleMinted(address minter, uint amount);
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

  /// @notice Calculate the shard of pool of a Sender, mul by 1e18 to get small share. We need this result for the reward calcul
  /// @dev The Alexandr N. Tetearing algorithm could increase precision
  /// @return ShardOfPool of the sender
  function getShardOfPool () public view returns (uint) {
    if (balanceOf(address(this)) == 0 || user[msg.sender].xEoleStaked == 0) {
      return 0;
    }

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

  function getRewardEarned () public view returns (uint) {
    if (user[msg.sender].startRewardStakingAt == 0) {
      return 0;
    }
    
    return getRewardPerSecond()
      .mul(block.timestamp - user[msg.sender].startRewardStakingAt);
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
    
    user[msg.sender].startStakeAt = block.timestamp;
    user[msg.sender].startRewardStakingAt = block.timestamp;
    user[msg.sender].xEoleStaked += _amount;
  }

  function withdrawXEole (uint _amount) external {
    require(_amount > 0, "You have't xEole");
    uint amount = user[msg.sender].xEoleStaked;
    user[msg.sender].xEoleStaked = 0;

    _transfer(address(this), msg.sender, amount);
  }


  // dailyReward eole.getXEoleRewardRate()div(365)
  // userSharedOfPool =  (user balance / thisBalance) * 100

  // userDailyRward =  (dailyReward * userSharedOfPool) / 100;
  // userAPR =  (userDailyRward / user balance) * 100;
  // userRewardPerSec = userAPR / 86400
  
  // userRewardPerSec * (currentTimeStamp - StartedAt);



  function compound () public {
    if (!user[msg.sender].stopEarning) {
      uint currentReward = getRewardEarned();
      user[msg.sender].startRewardStakingAt = block.timestamp;
      user[msg.sender].xEoleStaked += currentReward;

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
      eole.transfer(feeVaultAddress, slash);

      emit UnlockingEole(msg.sender, block.timestamp, true, slash);
    // lockTimeChoosed === 1 ? unclockTime well be 30 days
    // with no slash
    } else if (lockTimeChoosed == 1) {
      user[msg.sender].unlockTime = block.timestamp + sixMonthInSeconde;
      _burn(address(this), xEoleAmount);
      
      user[msg.sender].xEoleStaked = 0;
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
    require(user[msg.sender].eoleStaked > 0, "Nothing to claim");
    uint unlockedToken = getUnlockedTokenPerSec();

    user[msg.sender].eoleStaked -= unlockedToken;
     
    eole.transfer(msg.sender, unlockedToken);
    emit Claim(msg.sender, unlockedToken);
  }
}
