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

const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";

async function main() {
  const signers = await ethers.getSigners();

  const owner = signers[0];
  const xeOwner = signers[1];
  const team = signers[2];
  const vc = signers[3];
  const feeVault = signers[4];

  const Eole = await ethers.getContractFactory("Eole", owner);

  const eole = await Eole.deploy(team.address, vc.address);

  await eole.deployed();

  const XEole = await ethers.getContractFactory("XEole", xeOwner);
  const xEole = await XEole.deploy(eole.address, feeVault.getAddress());

  await xEole.deployed();

  await eole.setXEoleAddress(xEole.address);

  console.log("*** ADDRESS ***");
  console.log("| eole     ", eole.address);
  console.log("| xEole    ", xEole.address);
  console.log("*** ******* ***\n");

  // transfer the inflation reward to xEole contract (rewards for stakers)
  await eole.transferInflationReward(xEole.address);

  // /**
  //  * TEAM statement
  //  * team address well put his token to stake
  //  */
  console.log("*** TEAM STATEMENT ***");
  console.log("| TEAM", team.address);
  const eoleFromTeam = new ethers.Contract(eole.address, eoleAbi, team);
  const xEoleFromTeam = new ethers.Contract(xEole.address, xEoleAbi, team);
  const teamEoleDeposit = await eole.balanceOf(team.getAddress());
  await eoleFromTeam.approve(xEole.address, teamEoleDeposit);
  console.log("| TEAM eole balance ", await eole.balanceOf(team.address));
  console.log("| TEAM depositEole ");
  await xEoleFromTeam.depositEole(teamEoleDeposit);
  console.log("| TEAM new eole balance ", await eole.balanceOf(team.address));
  console.log(
    "| TEAM xEole balance",
    await xEoleFromTeam.balanceOf(team.address)
  );
  console.log("| TEAM stakeXEole ");
  await xEoleFromTeam.stakeXEole(teamEoleDeposit);
  console.log(
    "| TEAM xEole balance",
    await xEoleFromTeam.balanceOf(team.address)
  );
  console.log("| TEAM xEole staked ", await xEoleFromTeam.getXEoleStaked());
  console.log("*** ************** ***\n");

  // /**
  //  * VC's statement
  //  * vc's address well put his token to stake
  //  */
  console.log("*** VC STATEMENT ***");
  console.log("| VC", vc.address);
  const eoleFromVc = new ethers.Contract(eole.address, eoleAbi, vc);
  const xEoleFromVc = new ethers.Contract(xEole.address, xEoleAbi, vc);
  const vcEoleDeposit = await eole.balanceOf(vc.address);
  await eoleFromVc.approve(xEoleFromVc.address, vcEoleDeposit);
  console.log("| VC eole balance ", await eole.balanceOf(vc.address));
  console.log("| VC depositEole");
  await xEoleFromVc.depositEole(vcEoleDeposit);
  console.log("| VC eole balance ", await eole.balanceOf(vc.address));
  console.log("| VC xEole balance", await xEoleFromVc.balanceOf(vc.address));
  console.log("| VC stakeXEole ");
  await xEoleFromVc.stakeXEole(vcEoleDeposit);
  console.log("| VC xEole balance", await xEoleFromVc.balanceOf(vc.address));
  console.log("| VC xEole staked ", await xEoleFromVc.getXEoleStaked());
  console.log("*** ************ **\n");

  console.log(" ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
