import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Eole token", () => {
  async function deployOneFixture() {
    const [owner, team, vc, otherAccount] = await ethers.getSigners();

    const teamAddr = await team.getAddress();
    const vcAddr = await vc.getAddress();
    const Eole = await ethers.getContractFactory("Eole");
    const eole = await Eole.deploy(teamAddr, vcAddr);

    return { eole, owner, otherAccount };
  }

  describe("Deployment", () => {
    it("Should have one supply set at 550 000 000", async function () {
      const { eole, owner } = await loadFixture(deployOneFixture);

      const mintedEole = await eole.balanceOf(owner.getAddress());

      expect(Number(mintedEole) / 1e18).to.equal(550000000);
    });
  });

  describe("Use Faucet", () => {
    it("Should use the faucet", async function () {
      const { eole, otherAccount } = await loadFixture(deployOneFixture);

      const useFaucet = await eole.connect(otherAccount).faucet(44);
      const result: any = await useFaucet.wait();
      // cast BN EventResult to a number
      const BnEventResult = Number(result?.events[1].args.amount);
      expect(BnEventResult).to.equal(44);

      await expect(eole.connect(otherAccount).faucet(44)).to.emit(
        eole,
        "FaucetUsed"
      );
    });

    it("Should fail the faucet transfer", async function () {
      const { eole, otherAccount } = await loadFixture(deployOneFixture);

      await expect(eole.connect(otherAccount).faucet(0)).to.be.revertedWith(
        "Amount should be greater than 0"
      );
    });
  });

  describe("Events", () => {
    it("Should emit FaucetUsed and Transfer", async function () {
      const { eole, otherAccount } = await loadFixture(deployOneFixture);

      const useFaucet = await eole.connect(otherAccount).faucet(44);
      const result: any = await useFaucet.wait();
      // cast BN EventResult to a number
      const BnEventResult = Number(result?.events[1].args.amount);
      expect(BnEventResult).to.equal(44);

      await expect(eole.connect(otherAccount).faucet(44)).to.emit(
        eole,
        "Transfer"
      );
    });

    it("Should fail the faucet transfer", async function () {
      const { eole, otherAccount } = await loadFixture(deployOneFixture);

      await expect(eole.connect(otherAccount).faucet(0)).to.be.revertedWith(
        "Amount should be greater than 0"
      );
    });
  });
});
