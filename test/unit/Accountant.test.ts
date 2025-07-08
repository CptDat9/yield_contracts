import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ERC20Mintable, ERC20Mintable__factory, MockStrategy, MockStrategy__factory, Vault, Vault__factory } from "../../typechain-types";
import { getNamedAccounts } from "hardhat";
import hre from "hardhat";
import { assert, ethers as ethersv6, MaxUint256, parseEther, parseUnits } from "ethers";
import {
  addDebtToStrategy,
  addStrategy,
  mintAndDeposit,
  setDepositLimit,
  setDepositLimitModule,
  setLock,
  setLoss,
  setMaxDebt,
  setMinimumTotalIdle,
  updateDebt,
  updateMaxDebt,
} from "../helper";
import { Accountant, Accountant__factory } from "../../typechain-types";
import { expect } from "chai";
import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
describe("Accountant test", () => {
  let accountant: Accountant;
  let deployer: Signer;
  let nonGovernance: Signer;
  let deployerAddress: string;
  let otherAddress: string;
  before(async () => {
    [deployer, nonGovernance] = await ethers.getSigners();
    deployerAddress = await deployer.getAddress();
    otherAddress = await nonGovernance.getAddress();
    const AccountantFactory = (await ethers.getContractFactory("Accountant", deployer)) as Accountant__factory;
    accountant = await AccountantFactory.deploy();
    await accountant.initialize(deployerAddress, 1000); // 10%
    // base_bps = 10000 (100%)
  });
    let amount = parseUnits("1000", 6);
    it("initializes correctly", async () => {
      expect(await accountant.governance()).to.equal(deployerAddress);
      expect(await accountant.fee_pbs()).to.equal(1000); // 10%
    });
    it("report correctly", async () => {
      const gain = parseUnits("1000", 6);
      const loss = parseUnits("200", 6);
      const [fee, refund] = await accountant.report(ethersv6.ZeroAddress, gain, loss);
      expect(fee).to.equal(80000000);
      expect(refund).to.equal(0);
      console.log("report case 1 thanh cong");
      const gain2 = parseUnits("500", 6);
      const loss2 = parseUnits("600", 6);
      const [fee2, refund2] = await accountant.report(ethersv6.ZeroAddress, gain2, loss2);
      expect(fee2).to.equal(0);
      expect(refund2).to.equal(0);
      console.log("report case 2 thanh cong");
    });
    it("set fee_bps correctly (governance can, nongovernance can't)", async () => {
      const feePbs = 1200; // 12%
      await accountant.connect(deployer).setFeePbs(feePbs);
      expect(await accountant.fee_pbs()).to.equal(feePbs);
      const feePbs2 = 1500; // 15%
      await expect(accountant.connect(nonGovernance).setFeePbs(feePbs2));
      expect(await accountant.fee_pbs()).to.equal(feePbs); //  not change 
    });
  
  });
