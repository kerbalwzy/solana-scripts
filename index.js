// src/main.js
const { NewWallet, Wallet, ListWallets } = require("./src/wallet");
const {
  TokenDecimals,
  TokenBalanceAndDecimals,
  WalletsBalance,
  TransferBalance,
  CollectBalances,
} = require("./src/balance");
const { TokenSOL, TokenORE } = require("./src/consts");
const { Connection } = require("@solana/web3.js");
//
const transConnection = new Connection(
  "https://grateful-jerrie-fast-mainnet.helius-rpc.com",
  "confirmed"
);

// Wallet("4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3");

// NewWallet()

// TokenBalanceAndDecimals(Wallet("2dZrQcsKeF5pXhdgMVCSNA2dEXz67JY2QERNY2j36F5k"), TokenORE)

// WalletsBalance()

// WalletsBalance('wallets', TokenORE);

// TransferBalance(
//   Wallet("3Q292Tz7mXGzbgJXAUhbFGN3zB6eaVnkn7ezBfCM6nMv"),
//   "4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3",
//   0.001,
//   TokenSOL,
//   transConnection
// );

// TransferBalance(
//   Wallet("2dZrQcsKeF5pXhdgMVCSNA2dEXz67JY2QERNY2j36F5k"),
//   "4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3",
//   0.001,
//   TokenORE,
//   transConnection
// );

TransferBalance(
  Wallet("4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3"),
  "2dZrQcsKeF5pXhdgMVCSNA2dEXz67JY2QERNY2j36F5k",
  4,
  TokenSOL,
  transConnection
);

// CollectBalances(
//   "4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3",
//   "0.005",
//   transConnection,
// );
