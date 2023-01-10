const { expect } = require('chai');
const { ethers, waffle} = require("hardhat");

const provider = waffle.provider;

describe('Deploy contracts', () => {
  let deployer, user, attacker;
  let bankContract, attackerContract;

  beforeEach(async () => {
    [deployer, user, attacker] = await ethers.getSigners();

    const BankFactory = await ethers.getContractFactory("BankSendValueReentrancyGuard", deployer);
    bankContract = await BankFactory.deploy();

    await bankContract.deposit({ value: ethers.utils.parseEther("100") });
    await bankContract.connect(user).deposit({ value: ethers.utils.parseEther("50") });

    const AttackerFactory = await ethers.getContractFactory("Attacker", attacker);
    attackerContract = await AttackerFactory.deploy(bankContract.address);

  });

  describe('deposit', () => {
    it("Should accept deposits", async function () {

      // deployer balance pada bank
      const deployerBalance = await bankContract.balanceOf(deployer.address);
      expect(deployerBalance).to.eq(ethers.utils.parseEther("100"));
      // console.log('deployerBalance', deployerBalance);

      // user balance pada bank
      const userBalance = await bankContract.balanceOf(user.address);
      expect(userBalance).to.eq(ethers.utils.parseEther("50"));
      // console.log('userBalance', userBalance);

      // total eth pada bank
      const bankBalance = await provider.getBalance(bankContract.address);
      expect(bankBalance).to.eq(ethers.utils.parseEther("150"));
      // console.log('bankBalance', bankBalance);

    });

    it("Should accept withdrawals", async function () {
      await bankContract.withdraw();

      const deployerBalance = await bankContract.balanceOf(deployer.address);
      const userBalance = await bankContract.balanceOf(user.address);

      expect(deployerBalance).to.eq(0);
      expect(userBalance).to.eq(ethers.utils.parseEther("50"));
    });

    it("Perform Attack: attack success", async function () {
      console.log("");
      console.log("*** Before ***");
      console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bankContract.address)).toString()}`);
      console.log(`Attacker's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`);

      // tidak berhasil
      await expect(
        attackerContract.attack({ value: ethers.utils.parseEther("10") })
      )
      .to.be.reverted;
      
      console.log("");
      console.log("*** After ***");
      console.log(`Bank's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bankContract.address)).toString()}`);
      console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)).toString()}`);
      console.log("");

      expect(await ethers.provider.getBalance(bankContract.address)).to.eq(ethers.utils.parseEther("150"));
    });
  });

});