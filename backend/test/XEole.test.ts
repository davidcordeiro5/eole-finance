import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

describe("xEole token", () => {
  async function deployOneFixture() {
    const [owner, team, vc, otherAccount] = await ethers.getSigners();

    const teamAddr = await team.getAddress();
    const vcAddr = await vc.getAddress();
    const Eole = await ethers.getContractFactory("Eole");
    const eole = await Eole.deploy(teamAddr, vcAddr);

    const XEole = await ethers.getContractFactory("XEole", owner);
    const xEole = await XEole.deploy(eole.address, otherAccount.address);

    return { eole, owner, otherAccount, xEole };
  }

  describe("Deployment", () => {
    it("Token name shoul be xEole", async () => {
      const { xEole } = await loadFixture(deployOneFixture);
      expect(await xEole.name()).to.equal("xEole");
    });

    it("Token symbol shoul be xEole", async () => {
      const { xEole } = await loadFixture(deployOneFixture);
      expect(await xEole.symbol()).to.equal("xEOLE");
    });
  });

  describe("Getters", () => {
    it("Get Eole deposit should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const desposit = await xEole.connect(owner).getEoleDeposit();
      expect(Number(desposit) / 1e18).to.equal(0);
    });

    it("Get xEole Staked should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const stake = await xEole.connect(owner).getXEoleStaked();
      expect(Number(stake) / 1e18).to.equal(0);
    });

    it("Get user reward should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const reward = await xEole.connect(owner).getUserReaward();
      expect(Number(reward) / 1e18).to.equal(0);
    });
    it("Get user update should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const update = await xEole.connect(owner).getUserUpdateAt();
      expect(Number(update) / 1e18).to.equal(0);
    });
    it("Get unlock time Eole chooded should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const reward = await xEole.connect(owner).getUnlockTimeEoleChooded();
      expect(Number(reward) / 1e18).to.equal(0);
    });
    it("Get user autorized should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const autorized = await xEole.connect(owner).getUnlockEoleAutorize();
      expect(Number(autorized) / 1e18).to.equal(0);
    });

    it("Get unlock time should be 0", async function () {
      const { xEole, owner } = await loadFixture(deployOneFixture);

      const unlock = await xEole.connect(owner).getUnlockTime();
      expect(Number(unlock) / 1e18).to.equal(0);
    });
  });
});
