# Uniswap-Style DEX (Automated Market Maker)
**Team 1 - Blockchain Final Project**

## Project Structure (Person 1: Smart Contract Developer)
This project is integrated into the provided TA boilerplate. The custom logic is located in:
- `packages/contracts/src/SimpleDEX.sol`: Core AMM logic.
- `packages/contracts/src/Tokens.sol`: ERC20 Assets (Gold & Silver).
- `packages/abis/SimpleDEX.json`: Contract ABI for Frontend integration.

## How it Works
1. **Formula**: Uses Constant Product Formula $(x \times y = k)$.
2. **Fees**: 0.3% fee collected per swap to reward liquidity providers.
3. **Liquidity**: Users can add pairs to initialize the reserves.

## Developer Information
- **Role**: Smart Contract Developer
- **Tools**: VS Code, Remix IDE, Solidity 0.8.20.