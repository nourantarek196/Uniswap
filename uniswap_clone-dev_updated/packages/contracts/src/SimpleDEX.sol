// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/**
 * @title SimpleDEX
 * @dev Implements a constant product AMM (x * y = k)
 */

contract SimpleDEX is ReentrancyGuard {

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    event LiquidityAdded(uint256 amountA, uint256 amountB);

    event Swap(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        string direction
    );

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {

        require(amountA > 0, "Invalid amount");
        require(amountB > 0, "Invalid amount");

        require(
            tokenA.transferFrom(msg.sender, address(this), amountA),
            "TokenA transfer failed"
        );

        require(
            tokenB.transferFrom(msg.sender, address(this), amountB),
            "TokenB transfer failed"
        );

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(amountA, amountB);
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 resIn,
        uint256 resOut
    ) public pure returns (uint256) {

        uint256 amountInWithFee = amountIn * 997;

        uint256 numerator = amountInWithFee * resOut;

        uint256 denominator =
            (resIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function swapAforB(
        uint256 amountAIn
    ) external nonReentrant {

        require(amountAIn > 0, "Invalid amount");

        require(
            reserveA > 0 && reserveB > 0,
            "No liquidity"
        );

        uint256 amountBOut = getAmountOut(
            amountAIn,
            reserveA,
            reserveB
        );

        require(
            tokenA.transferFrom(
                msg.sender,
                address(this),
                amountAIn
            ),
            "TokenA transfer failed"
        );

        require(
            tokenB.transfer(msg.sender, amountBOut),
            "TokenB transfer failed"
        );

        reserveA += amountAIn;
        reserveB -= amountBOut;

        emit Swap(
            msg.sender,
            amountAIn,
            amountBOut,
            "A to B"
        );
    }

    function swapBforA(
        uint256 amountBIn
    ) external nonReentrant {

        require(amountBIn > 0, "Invalid amount");

        require(
            reserveA > 0 && reserveB > 0,
            "No liquidity"
        );

        uint256 amountAOut = getAmountOut(
            amountBIn,
            reserveB,
            reserveA
        );

        require(
            tokenB.transferFrom(
                msg.sender,
                address(this),
                amountBIn
            ),
            "TokenB transfer failed"
        );

        require(
            tokenA.transfer(msg.sender, amountAOut),
            "TokenA transfer failed"
        );

        reserveB += amountBIn;
        reserveA -= amountAOut;

        emit Swap(
            msg.sender,
            amountBIn,
            amountAOut,
            "B to A"
        );
    }
}