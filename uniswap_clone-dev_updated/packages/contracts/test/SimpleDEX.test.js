const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDEX", function () {

  let goldToken;
  let silverToken;
  let dex;
  let owner;
  let addr1;

  beforeEach(async function () {

    [owner, addr1] = await ethers.getSigners();

    // Deploy Gold Token
    const GoldToken = await ethers.getContractFactory("GoldToken");
    goldToken = await GoldToken.deploy();

    // Deploy Silver Token
    const SilverToken = await ethers.getContractFactory("SilverToken");
    silverToken = await SilverToken.deploy();

    // Deploy DEX
    const SimpleDEX = await ethers.getContractFactory("SimpleDEX");

    dex = await SimpleDEX.deploy(
      goldToken.address,
      silverToken.address
    );

    // Approve tokens for liquidity
    await goldToken.approve(dex.address, 100000);
    await silverToken.approve(dex.address, 100000);

  });

  /*
    TEST 1
    Add liquidity successfully
  */
  it("Should add liquidity correctly", async function () {

    await dex.addLiquidity(1000, 1000);

    expect((await dex.reserveA()).toString()).to.equal("1000");
    expect((await dex.reserveB()).toString()).to.equal("1000");

  });

  /*
    TEST 2
    Swap Token A for Token B
  */
  it("Should swap Token A for Token B", async function () {

    await dex.addLiquidity(1000, 1000);

    await goldToken.approve(dex.address, 100);

    await dex.swapAforB(100);

    expect((await dex.reserveA()).toString()).to.equal("1100");

  });

  /*
    TEST 3
    Swap Token B for Token A
  */
  it("Should swap Token B for Token A", async function () {

    await dex.addLiquidity(1000, 1000);

    await silverToken.approve(dex.address, 100);

    await dex.swapBforA(100);

    expect((await dex.reserveB()).toString()).to.equal("1100");

  });

  /*
    TEST 4
    Revert without liquidity
  */
  it("Should revert when swapping without liquidity", async function () {

    let failed = false;

    try {
      await dex.swapAforB(100);
    } catch (error) {
      failed = true;
    }

    expect(failed).to.equal(true);

  });

  /*
    TEST 5
    Fail when approval is missing
  */
  it("Should fail if token approval is missing", async function () {

    await goldToken.transfer(addr1.address, 1000);

    let failed = false;

    try {
      await dex.connect(addr1).swapAforB(100);
    } catch (error) {
      failed = true;
    }

    expect(failed).to.equal(true);

  });

  /*
    TEST 6
    Large liquidity amounts
  */
  it("Should handle large liquidity amounts", async function () {

    await dex.addLiquidity(50000, 50000);

    expect((await dex.reserveA()).toString()).to.equal("50000");
    expect((await dex.reserveB()).toString()).to.equal("50000");

  });

  /*
    TEST 7
    Multiple swaps
  */
  it("Should update reserves after multiple swaps", async function () {

    await dex.addLiquidity(1000, 1000);

    await dex.swapAforB(100);
    await dex.swapBforA(50);

    const reserveA = await dex.reserveA();
    const reserveB = await dex.reserveB();

    expect(reserveA.toNumber()).to.be.greaterThan(0);
    expect(reserveB.toNumber()).to.be.greaterThan(0);

  });

  /*
    TEST 8
    Output calculation
  */
  it("Should calculate output amount correctly", async function () {

    const output = await dex.getAmountOut(
      100,
      1000,
      1000
    );

    expect(output.toNumber()).to.be.greaterThan(0);

  });

  /*
    TEST 9
    Reject zero liquidity
  */
  it("Should reject zero liquidity addition", async function () {

    let failed = false;

    try {
      await dex.addLiquidity(0, 0);
    } catch (error) {
      failed = true;
    }

    expect(failed).to.equal(true);

  });

  /*
    TEST 10
    Reject zero swap
  */
  it("Should reject zero swap amount", async function () {

    await dex.addLiquidity(1000, 1000);

    let failed = false;

    try {
      await dex.swapAforB(0);
    } catch (error) {
      failed = true;
    }

    expect(failed).to.equal(true);

  });

});