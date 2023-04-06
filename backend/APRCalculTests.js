// 3% of 550k M
// years => 16 500
//    5500

const MAX_SUPPLY = 1000000000;

const COMMUNITY_SUPPLY = (MAX_SUPPLY * 55) / 100;
const TEAM_SUPPLY = (MAX_SUPPLY * 15) / 100;
const SCALABLE_FOUND_SUPPLY = (MAX_SUPPLY * 8) / 100;
const PRIVE_SELL_SUPPLY = (MAX_SUPPLY * 8) / 100;
const PUBLIC_SELL_SUPPLY = (MAX_SUPPLY * 7) / 100;
const PARTNEE_SUPPLY = (MAX_SUPPLY * 4) / 100;
const AIRDROP_SUPPLY = (MAX_SUPPLY * 3) / 100;

const ONE_M = 1000000;

const getUserApr = (userStake, ttLockStake, incentive) => {
  const userShareOfPoll = (userStake / ttLockStake) * 100;

  const useIncentive = (incentive * userShareOfPoll) / 100;
  return (useIncentive / userStake) * 100;
};

const numberTests = () => {
  const totalStacked = ONE_M * 230;

  console.log("totalStacked", totalStacked);
  const yearlyIncentive = (COMMUNITY_SUPPLY * 9) / 100; //    49500000 yearly
  console.log("yearlyIncentive 9% of COMMUNITY_SUPPLY", yearlyIncentive);
  const dailyIncentive = yearlyIncentive / 365; //            45205 daily

  const mStake = totalStacked / 100;

  const mShareOfPoll = (mStake / totalStacked) * 100;
  const mShareOfPoll2 = (mStake * 100) / totalStacked;
  console.log("mShareOfPoll2", mShareOfPoll2);
  console.log("mShareOfPoll", `${mShareOfPoll}%`, "stake:", mStake);

  const mDailyIncentive = (dailyIncentive * mShareOfPoll) / 100;

  const apr = (mDailyIncentive / mStake) * 100;

  // 86400 = 1 day
  const rewardPerSec = apr / 86400;
  console.log("rps", rewardPerSec, rewardPerSec * 86400);
  console.log(
    "apr Daily: [",
    apr,
    "]",

    "apr Yearly: [",
    getUserApr(100, totalStacked, yearlyIncentive),
    "]"
  );

  const xEolePoolAPR = (yearlyIncentive * 50) / 100;
  const eUSDCPoolAPR = (yearlyIncentive * 30) / 100;
  const eVLPPoolAPR = (yearlyIncentive * 20) / 100;
  console.log("APR for 1% share of pool");
  console.log(
    `xEole pool apr:  ~${getUserApr(100, totalStacked, xEolePoolAPR)}`
  );
  console.log(
    `eUSDC pool apr:  ~${getUserApr(100, totalStacked, eUSDCPoolAPR)}`
  );
  console.log(
    `eVLP pool apr:   ~${getUserApr(100, totalStacked, eVLPPoolAPR)}`
  );

  let yealyInflation = (COMMUNITY_SUPPLY * 9) / 100;
  const getXEoleRewardRate = (yealyInflation * 50) / 100;

  const dailyReward = getXEoleRewardRate / 365;
  const rewardSec = getXEoleRewardRate / 365;

  const userApr = (dailyReward / mStake) * 100;

  console.log("Test", (mStake / totalStacked) * 100);

  console.log("getXEoleRewardRate", getXEoleRewardRate, dailyReward);
  console.log("user APR", userApr);

  console.log("time cal currentTimeStamp - StartedAt", 1680764360 - 1680764312);
};

numberTests();
