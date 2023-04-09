import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Eole token", () => {
  async function deployOneFixture() {
    const [owner, team, vc, otherAccount, xEole] = await ethers.getSigners();

    const teamAddr = await team.getAddress();
    const vcAddr = await vc.getAddress();
    const Eole = await ethers.getContractFactory("Eole");
    const eole = await Eole.deploy(teamAddr, vcAddr);

    return { eole, owner, otherAccount, xEole };
  }

  describe("Deployment", () => {
    it("Token name shoul be EOLE", async () => {
      const { eole } = await loadFixture(deployOneFixture);
      expect(await eole.name()).to.equal("EOLE");
    });

    it("Token symbol shoul be EOLE", async () => {
      const { eole } = await loadFixture(deployOneFixture);
      expect(await eole.symbol()).to.equal("EOLE");
    });

    it("Should have one supply set at 550 000 000", async function () {
      const { eole, owner } = await loadFixture(deployOneFixture);

      const mintedEole = await eole.balanceOf(owner.getAddress());

      expect(Number(mintedEole) / 1e18).to.equal(550000000);
    });
  });

  describe("Getters", () => {
    it("Get xEole reward rate should be 24 750 000", async function () {
      const { eole, otherAccount } = await loadFixture(deployOneFixture);

      const xEoleRewerd = await eole.connect(otherAccount).getXEoleRewardRate();
      expect(Number(xEoleRewerd) / 1e18).to.equal(24750000);
    });

    it("Get total reward distributed should be 0 and 49500000", async function () {
      const { eole, owner, xEole } = await loadFixture(deployOneFixture);

      const totalRewardDistributed = await eole
        .connect(owner)
        .getTotalRewardDistributed();

      expect(Number(totalRewardDistributed) / 1e18).to.equal(0);
      await eole.connect(owner).setXEoleAddress(xEole.address);
      await eole.connect(owner).transferInflationReward(xEole.address);

      const rewardAfterTransferInflationReward = await eole
        .connect(owner)
        .getTotalRewardDistributed();

      expect(Number(rewardAfterTransferInflationReward) / 1e18).to.equal(
        49500000
      );
    });
  });

  describe("Reverts & Events", () => {
    it("Revet Only the owner", async function () {
      const { eole, xEole } = await loadFixture(deployOneFixture);

      await expect(
        eole.connect(xEole).transferInflationReward(xEole.address)
      ).to.be.revertedWith("Only the owner can call this function");
    });

    it("Revet set xEole addres first ", async function () {
      const { eole, xEole, owner } = await loadFixture(deployOneFixture);
      await expect(
        eole.connect(owner).transferInflationReward(xEole.address)
      ).to.be.revertedWith("Set xEole first");
    });

    it("Should emit TransferInflationReward", async function () {
      const { eole, owner, xEole } = await loadFixture(deployOneFixture);

      await eole.connect(owner).setXEoleAddress(xEole.address);

      await expect(
        eole.connect(owner).transferInflationReward(xEole.address)
      ).to.emit(eole, "TransferInflationReward");
    });
  });
});
