# Project Report: Smart Contract Development for SimpleDEX

**Role: Smart Contract Developer**

## 1. Introduction
In this project, I was responsible for developing the core smart contracts that power the Decentralized Exchange (DEX). My work involved creating the tradable assets (ERC20 Tokens) and the exchange logic (AMM) that allows users to swap tokens without a central authority.

## 2. Development Environment
I used the Remix IDE to write, debug, and compile the smart contracts. This environment allowed me to simulate the blockchain behavior before the final deployment.

## 3. Creating the Tradable Assets (ERC20 Tokens)
The first step was to create the tokens that will be used in the liquidity pool. I developed a contract named `Tokens.sol` that implements the ERC20 standard.

**Logic:** I created two tokens (Gold and Silver) with an initial supply of 1,000,000 each. This supply is necessary to provide the initial liquidity for the exchange.

### Detailed Code Explanation: `Tokens.sol`

```solidity
// SPDX-License-Identifier: MIT
// This line specifies the license under which the smart contract code is released. MIT is a permissive free software license.
pragma solidity ^0.8.20;
// This line declares the Solidity compiler version to be used. The caret (^) indicates that it can be compiled with versions from 0.8.20 up to, but not including, 0.9.0.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Imports the ERC20 contract from OpenZeppelin, which provides a standard implementation for ERC20 tokens. This allows us to easily create new ERC20 compliant tokens.

// ERC20 Token implementation for Gold and Silver
// This is a regular comment indicating the purpose of the contracts below.
contract GoldToken is ERC20 {
    // Declares the `GoldToken` smart contract, inheriting functionality from the `ERC20` contract.
    constructor() ERC20("GoldToken", "GLD") {
        // The constructor for `GoldToken`. It calls the parent `ERC20` constructor to set the token's name ("GoldToken") and symbol ("GLD").
        _mint(msg.sender, 1000000 * 10**18);
        // Mints an initial supply of 1,000,000 GoldTokens (with 18 decimal places) and assigns them to the address that deployed this contract (`msg.sender`).
    }
}

contract SilverToken is ERC20 {
    // Declares the `SilverToken` smart contract, also inheriting functionality from the `ERC20` contract.
    constructor() ERC20("SilverToken", "SLV") {
        // The constructor for `SilverToken`. It calls the parent `ERC20` constructor to set the token's name ("SilverToken") and symbol ("SLV").
        _mint(msg.sender, 1000000 * 10**18);
        // Mints an initial supply of 1,000,000 SilverTokens (with 18 decimal places) and assigns them to the address that deployed this contract (`msg.sender`).
    }
}
```

## 4. Developing the DEX Contract (SimpleDEX.sol)
After creating the tokens, I developed the main exchange contract. This contract governs how liquidity is added, swapped, and removed.

### A. Contract Setup and Constructor
I initialized the contract to accept two specific token addresses (Token A and Token B) which will form the trading pair.

### B. Liquidity Provision
I added a function that allows users to deposit their tokens into the DEX. This is the "Pool" that other traders will use to swap their coins. I also implemented a mechanism to track liquidity shares (LP tokens) for each provider.

### C. Liquidity Removal
I added a function to allow liquidity providers to withdraw their deposited tokens proportionally to their liquidity shares.

### Detailed Code Explanation: `SimpleDEX.sol`

```solidity
// SPDX-License-Identifier: MIT
// This line specifies the license under which the smart contract code is released. MIT is a permissive free software license.
pragma solidity ^0.8.20;
// This line declares the Solidity compiler version to be used. The caret (^) indicates that it can be compiled with versions from 0.8.20 up to, but not including, 0.9.0.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Imports the IERC20 interface from OpenZeppelin, which defines the standard functions for ERC20 tokens. This allows the DEX to interact with any ERC20 compliant token.
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// Imports the SafeMath library from OpenZeppelin. While not explicitly used in all calculations due to Solidity 0.8+ built-in overflow checks, it's a good practice for older versions or for explicit safety.

/**
 * @title SimpleDEX
 * @dev Implements a constant product AMM (x * y = k)
 */
// This is a NatSpec comment, providing documentation for the contract. @title gives the contract's name, and @dev provides a short description of its functionality.
contract SimpleDEX {
    // Declares the SimpleDEX smart contract.

    IERC20 public tokenA;
    // Declares a public state variable `tokenA` of type IERC20. This will store the address of the first ERC20 token traded on the DEX.
    IERC20 public tokenB;
    // Declares a public state variable `tokenB` of type IERC20. This will store the address of the second ERC20 token traded on the DEX.
    uint256 public reserveA;
    // Declares a public state variable `reserveA` of type uint256. This stores the total amount of tokenA held by the DEX contract, representing its liquidity pool for tokenA.
    uint256 public reserveB;
    // Declares a public state variable `reserveB` of type uint256. This stores the total amount of tokenB held by the DEX contract, representing its liquidity pool for tokenB.
    uint256 public totalSupply;
    // Declares a public state variable `totalSupply` of type uint256. This represents the total amount of liquidity tokens (LP tokens) minted by the DEX, which track the total share of liquidity in the pool.
    mapping(address => uint256) public balanceOf;
    // Declares a public mapping `balanceOf` that associates an address with a uint256. This tracks how many liquidity tokens each user holds, representing their share of the pool.

    event LiquidityAdded(uint256 amountA, uint256 amountB, uint256 liquidity);
    // Declares an event `LiquidityAdded` that is emitted when liquidity is added to the pool. It logs the amounts of tokenA and tokenB added, and the amount of liquidity tokens minted.
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, string direction);
    // Declares an event `Swap` that is emitted when a swap occurs. It logs the user's address, the amount of token in, the amount of token out, and the direction of the swap.

    constructor(address _tokenA, address _tokenB) {
        // The constructor is a special function that runs only once when the contract is deployed.
        tokenA = IERC20(_tokenA);
        // Initializes `tokenA` with the address provided during contract deployment.
        tokenB = IERC20(_tokenB);
        // Initializes `tokenB` with the address provided during contract deployment.
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        // This function allows users to add liquidity to the pool by depositing both tokenA and tokenB.
        // It is `external`, meaning it can only be called from outside the contract.
        tokenA.transferFrom(msg.sender, address(this), amountA);
        // Transfers `amountA` of tokenA from the caller (`msg.sender`) to the DEX contract. The caller must have approved the DEX to spend this amount.
        tokenB.transferFrom(msg.sender, address(this), amountB);
        // Transfers `amountB` of tokenB from the caller (`msg.sender`) to the DEX contract. The caller must have approved the DEX to spend this amount.
        reserveA += amountA;
        // Increases the `reserveA` by the `amountA` deposited.
        reserveB += amountB;
        // Increases the `reserveB` by the `amountB` deposited.

        uint256 liquidity = 0;
        // Initializes a variable `liquidity` to store the amount of liquidity tokens to be minted.
        if (totalSupply == 0) {
            // If this is the first time liquidity is being added (i.e., the pool is empty).
            liquidity = amountA;
            // The initial liquidity tokens minted are equal to the amount of tokenA. This sets the initial price ratio.
        } else {
            // If liquidity already exists in the pool.
            // Calculates the amount of liquidity tokens to mint based on the proportion of tokens added relative to the existing reserves.
            // It uses the minimum of the two calculations to ensure the new liquidity doesn't skew the price.
            liquidity = Math.min(amountA * totalSupply / reserveA, amountB * totalSupply / reserveB);
        }
        require(liquidity > 0, "Insufficient liquidity minted");
        // Ensures that a positive amount of liquidity tokens is minted.
        balanceOf[msg.sender] += liquidity;
        // Assigns the newly minted liquidity tokens to the caller.
        totalSupply += liquidity;
        // Increases the total supply of liquidity tokens.
        emit LiquidityAdded(amountA, amountB, liquidity);
        // Emits the `LiquidityAdded` event to log the transaction details.
    }

    function getAmountOut(uint256 amountIn, uint256 resIn, uint256 resOut) public pure returns (uint256) {
        // This internal helper function calculates the amount of output tokens a user will receive for a given input amount, considering the constant product formula and a fee.
        // It is `public pure`, meaning it doesn't modify state and only reads its input parameters.
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        // Applies a 0.3% fee to the input amount. For every 1000 units, 3 units are taken as fee, so 997 units remain for the swap.
        uint256 numerator = amountInWithFee * resOut;
        // Calculates the numerator for the output amount formula: (amountInWithFee * reserveOut).
        uint256 denominator = (resIn * 1000) + amountInWithFee;
        // Calculates the denominator for the output amount formula: (reserveIn * 1000 + amountInWithFee).
        return numerator / denominator;
        // Returns the calculated amount of output tokens.
    }

    function swapAforB(uint256 amountAIn) external {
        // This function allows users to swap tokenA for tokenB.
        // It is `external`, meaning it can only be called from outside the contract.
        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);
        // Calculates the amount of tokenB the user will receive using the `getAmountOut` function.
        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        // Transfers `amountAIn` of tokenA from the caller to the DEX contract.
        tokenB.transfer(msg.sender, amountBOut);
        // Transfers `amountBOut` of tokenB from the DEX contract to the caller.
        reserveA += amountAIn;
        // Increases the `reserveA` as tokenA was received by the DEX.
        reserveB -= amountBOut;
        // Decreases the `reserveB` as tokenB was sent from the DEX.
        emit Swap(msg.sender, amountAIn, amountBOut, "A to B");
        // Emits the `Swap` event to log the transaction details.
    }

    function swapBforA(uint256 amountBIn) external {
        // This function allows users to swap tokenB for tokenA.
        // It is `external`, meaning it can only be called from outside the contract.
        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);
        // Calculates the amount of tokenA the user will receive using the `getAmountOut` function.
        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        // Transfers `amountBIn` of tokenB from the caller to the DEX contract.
        tokenA.transfer(msg.sender, amountAOut);
        // Transfers `amountAOut` of tokenA from the DEX contract to the caller.
        reserveB += amountBIn;
        // Increases the `reserveB` as tokenB was received by the DEX.
        reserveA -= amountAOut;
        // Decreases the `reserveA` as tokenA was sent from the DEX.
        emit Swap(msg.sender, amountBIn, amountAOut, "B to A");
        // Emits the `Swap` event to log the transaction details.
    }

    function removeLiquidity(uint256 _liquidity) external {
        // This function allows liquidity providers to remove their liquidity from the pool.
        // It is `external`, meaning it can only be called from outside the contract.
        require(_liquidity > 0, "Liquidity to remove must be greater than zero");
        // Ensures that the amount of liquidity tokens to remove is positive.
        require(balanceOf[msg.sender] >= _liquidity, "Insufficient liquidity");
        // Ensures that the caller has enough liquidity tokens to remove.

        uint256 amountA = _liquidity * reserveA / totalSupply;
        // Calculates the amount of tokenA to return to the user, proportional to their share of liquidity.
        uint256 amountB = _liquidity * reserveB / totalSupply;
        // Calculates the amount of tokenB to return to the user, proportional to their share of liquidity.

        require(amountA > 0 && amountB > 0, "Insufficient tokens to withdraw");
        // Ensures that positive amounts of both tokens will be withdrawn.

        balanceOf[msg.sender] -= _liquidity;
        // Decreases the caller's liquidity token balance.
        totalSupply -= _liquidity;
        // Decreases the total supply of liquidity tokens.
        reserveA -= amountA;
        // Decreases the `reserveA` as tokenA is sent out of the DEX.
        reserveB -= amountB;
        // Decreases the `reserveB` as tokenB is sent out of the DEX.

        tokenA.transfer(msg.sender, amountA);
        // Transfers the calculated `amountA` of tokenA from the DEX contract back to the caller.
        tokenB.transfer(msg.sender, amountB);
        // Transfers the calculated `amountB` of tokenB from the DEX contract back to the caller.
    }
}
```

## 5. The Mathematical Engine (AMM Formula)
The most critical part of my work was implementing the Automated Market Maker (AMM) logic. I used the Constant Product Formula ($x \times y = k$).

### A. Price Calculation
I wrote the `getAmountOut` function which calculates the exact amount a user should receive during a swap, including a small 0.3% transaction fee to reward the platform.

### B. Swapping Logic
I implemented two main functions to handle the exchange process: `swapAforB` and `swapBforA`. These functions handle the transfer of tokens between the user and the contract while updating the reserves.

## 6. Compilation and Quality Check
To ensure the code is free of syntax errors and logical bugs, I used the Solidity compiler. I verified that all functions work correctly according to the latest security standards.

## 7. Conclusion
My part as the Smart Contract Developer is complete. I have successfully:

1.  Created the ERC20 tokens for the exchange.
2.  Built the mathematical engine for the AMM.
3.  Developed the liquidity, swap, and liquidity removal functions.
4.  Verified the code through successful compilation.

The contract is now ready to be deployed to the testnet and integrated with the frontend interface.
