import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const getTheAbi = (pathName: string) => {
  try {
    const dir = path.resolve(__dirname, pathName);
    const file = fs.readFileSync(dir, "utf8");
    const json = JSON.parse(file);
    const abi = json.abi;

    return abi;
  } catch (e) {
    console.log(`e`, e);
  }
};

const eoleAbi = getTheAbi("../artifacts/contracts/Eole.sol/Eole.json");
const xEoleAbi = getTheAbi("../artifacts/contracts/XEole.sol/XEole.json");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545"
  );

  const owner = provider.getSigner(0);
  const xEOwner = provider.getSigner(1);
  const user = provider.getSigner(2);
  const team = provider.getSigner(3);
  const vc = provider.getSigner(4);
  const feeVault = provider.getSigner(5);

  /** Get address */
  const userAddr = await user.getAddress();
  const teamAddress = await team.getAddress();
  const vcAddress = await vc.getAddress();

  const Eole = await ethers.getContractFactory("Eole", owner);
  const eole = await Eole.deploy(teamAddress, vcAddress);

  await eole.deployed();

  const XEole = await ethers.getContractFactory("XEole", xEOwner);
  const xEole = await XEole.deploy(eole.address, feeVault.getAddress());

  await xEole.deployed();

  await eole.setXEoleAddress(xEole.address);

  console.log("*** ADDRESS ***");
  console.log("| eole     ", eole.address);
  console.log("| xEole    ", xEole.address);
  console.log("*** ******* ***\n");

  // transfer the inflation reward to xEole contract (rewards for stakers)
  await eole.transferInflationReward(xEole.address);
  // await xEole.updateReceivedRewardForPool();

  /**
   * TEAM statement
   * team address well put his token to stake
   */
  console.log("*** TEAM STATEMENT ***");
  console.log("| TEAM", teamAddress);
  const eoleFromTeam = new ethers.Contract(eole.address, eoleAbi, team);
  const xEoleFromTeam = new ethers.Contract(xEole.address, xEoleAbi, team);
  const teamEoleDeposit = await eole.balanceOf(team.getAddress());
  await eoleFromTeam.approve(xEoleFromTeam.address, teamEoleDeposit);
  console.log("| TEAM eole balance ", await eole.balanceOf(teamAddress));
  console.log("| TEAM depositEole ");
  await xEoleFromTeam.depositEole(teamEoleDeposit);
  console.log("| TEAM new eole balance ", await eole.balanceOf(teamAddress));
  console.log(
    "| TEAM xEole balance",
    await xEoleFromTeam.balanceOf(teamAddress)
  );
  console.log("| TEAM stakeXEole ");
  await xEoleFromTeam.stakeXEole(teamEoleDeposit);
  console.log(
    "| TEAM xEole balance",
    await xEoleFromTeam.balanceOf(teamAddress)
  );
  console.log("| TEAM xEole staked ", await xEoleFromTeam.getXEoleStaked());
  console.log("*** ************** ***\n");

  /**
   * VC's statement
   * vc's address well put his token to stake
   */
  console.log("*** VC STATEMENT ***");
  console.log("| VC", vcAddress);
  const eoleFromVc = new ethers.Contract(eole.address, eoleAbi, vc);
  const xEoleFromVc = new ethers.Contract(xEole.address, xEoleAbi, vc);
  const vcEoleDeposit = await eole.balanceOf(vcAddress);
  await eoleFromVc.approve(xEoleFromVc.address, vcEoleDeposit);
  console.log("| VC eole balance ", await eole.balanceOf(vcAddress));
  console.log("| VC depositEole");
  await xEoleFromVc.depositEole(vcEoleDeposit);
  console.log("| VC eole balance ", await eole.balanceOf(vcAddress));
  console.log("| VC xEole balance", await xEoleFromVc.balanceOf(vcAddress));
  console.log("| VC stakeXEole ");
  await xEoleFromVc.stakeXEole(vcEoleDeposit);
  console.log("| VC xEole balance", await xEoleFromVc.balanceOf(vcAddress));
  console.log("| VC xEole staked ", await xEoleFromVc.getXEoleStaked());
  console.log("*** ************ **\n");

  /**
   * USER statement
   */
  // USER need to use eole SC and xEole SC
  console.log("USER statement ");
  const eoleFromUser = new ethers.Contract(eole.address, eoleAbi, user);
  const xEoleFromUser = new ethers.Contract(xEole.address, xEoleAbi, user);

  const userDepositAmount = ethers.utils.parseEther("10000");

  // faucet Eole
  await eoleFromUser.faucet(userDepositAmount);
  console.log("USER EOLE balance", await eole.balanceOf(userAddr));
  // approve Eole from user, fro xEoleFromUser contract
  await eoleFromUser.approve(xEoleFromUser.address, userDepositAmount);
  await xEoleFromUser.depositEole(userDepositAmount);
  console.log("USER EOLE balance", await eole.balanceOf(userAddr));

  console.log("USER xEOLE balance", await xEole.balanceOf(userAddr));

  console.log("USER EOLE deposit ", await xEoleFromUser.getEoleDeposit());

  await xEoleFromUser.stakeXEole(userDepositAmount);
  console.log("USER xEOLE staked", await xEoleFromUser.getXEoleStaked());
  console.log(" ");
  console.log(" ");

  console.log("XEole total supply", await xEole.balanceOf(xEole.address));
  console.log(" ");
  console.log(" ");
  console.log("USER xEOLE staked", await xEoleFromUser.getXEoleStaked());
  console.log(
    "USER share of pool ",
    (await xEoleFromUser.getShardOfPool()) / 1e18
  );
  console.log(
    "USER Daily Reward ",
    (await xEoleFromUser.getDailyReward()) / 1e18
  );
  console.log(
    "USER Reward per s ",
    (await xEoleFromUser.getRewardPerSecond()) / 1e18
  );
  console.log(" ");
  console.log("TEAM xEOLE staked", await xEoleFromTeam.getXEoleStaked());
  console.log(
    "TEAM share of pool ",
    (await xEoleFromTeam.getShardOfPool()) / 1e18
  );
  console.log("TEAM Daily Reward ", await xEoleFromTeam.getDailyReward());
  console.log("TEAM Reward per s ", await xEoleFromTeam.getRewardPerSecond());
  console.log(" ");
  console.log("VC xEOLE staked", (await xEoleFromVc.getXEoleStaked()) / 1e18);
  console.log("VC share of pool ", (await xEoleFromVc.getShardOfPool()) / 1e18);
  console.log("VC Daily Reward ", (await xEoleFromVc.getDailyReward()) / 1e18);
  console.log(
    "VS Reward per s ",
    (await xEoleFromVc.getRewardPerSecond()) / 1e18
  );
  console.log("getRewardEarned", (await xEoleFromVc.getRewardEarned()) / 1e18);

  // console.log(" ");
  // console.log(" ");
  console.log("VC xEOLE staked", await xEoleFromVc.getXEoleStaked());
  // await xEoleFromVc.compound();
  console.log("VC xEOLE staked", await xEoleFromVc.getXEoleStaked());

  console.log(" ");

  console.log("xEole Balance", await xEole.totalSupply());
  await xEoleFromVc.unlockEole(0);
  // await xEoleFromVc.unlockEole(0);
  console.log("VC balanceOf exole", await xEoleFromVc.balanceOf(vcAddress));

  console.log("feeVault eole", await eole.balanceOf(feeVault.getAddress()));

  // await xEoleFromVc.unlockEole(1);

  // provider.send("evm_increaseTime", [60]);
  // provider.send("evm_mine");
  console.log(" ");

  console.log("VC EOLE staked", await xEoleFromVc.getEoleDeposit());
  await xEoleFromVc.claim();
  console.log("VC EOLE staked", (await xEoleFromVc.getEoleDeposit()) / 1e18);
  console.log("VC EOLE balance", await eole.balanceOf(vcAddress));
  await xEoleFromVc.claim();
  console.log("VC EOLE staked", (await xEoleFromVc.getEoleDeposit()) / 1e18);
  console.log("VC EOLE balance", await eole.balanceOf(vcAddress));
  // await xEoleFromUser.withdrawXEole(amountXEoleToStake);

  // await xEole.depositEole(55);

  // console.log(
  //   "Xeole balance for eole SC",
  //   await ex.balanceOf(owner.getAddress())
  // );

  // const xEoleTeamOnwer = new ethers.Contract(xEole.address, xEoleAbi, team);

  // await eoleTeamOnwer.approve(xEoleTeamOnwer.address, TEAM_SUPPLY);
  // await xEoleTeamOnwer.depositEole(TEAM_SUPPLY);

  // console.log("eole team", await eole.balanceOf(team.getAddress()));
  // console.log("xEole of team", await xEole.balanceOf(team.getAddress()));
  // console.log(" ");

  // console.log("xEole of team", await xEole.balanceOf(team.getAddress()));
  // console.log("eole team", await eole.balanceOf(team.getAddress()));
  // // const eoleContract = new ethers.Contract(eole.address, eoleAbi, sBob);

  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log(" ");
  console.log("getXEoleRewardRate", await eole.getXEoleRewardRate());
  // console.log(
  //   "eole balance of xEole contract",
  //   await eole.balanceOf(xEole.address)
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
