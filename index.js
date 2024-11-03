// src/main.js
const { Connection } = require("@solana/web3.js");
const { TokenSOL, TokenORE, TokenGrass } = require("./src/consts");
const { NewWallet, Wallet, ListWallets } = require("./src/wallet");
const {
  TokenDecimals,
  TokenBalanceAndDecimals,
  WalletsBalance,
  TransferBalance,
  CollectBalances,
} = require("./src/balance");
const { ListATAs } = require("./src/account");
//
const transConnection = new Connection(
  "https://grateful-jerrie-fast-mainnet.helius-rpc.com",
  "confirmed"
);

// ListWallets()

// Wallet("4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3");

// NewWallet()

// TokenBalanceAndDecimals(Wallet("2dZrQcsKeF5pXhdgMVCSNA2dEXz67JY2QERNY2j36F5k"), TokenORE)

// WalletsBalance()

// WalletsBalance('wallets', TokenGrass);

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

// TransferBalance(
//   Wallet("9cLaARDrRMqZqU4BAwWB3HF2UjdNAFgf6JaPDXaF5JRJ"),
//   "FMEXrB2wQDRdTJFp2iYnaufrFwdUCtQCDaJSvtttNyD5",
//   10.25,
//   TokenGrass,
//   transConnection
// );

// CollectBalances(
//   "4j5PZ3fUGo57pq5EFvnVJKnygfzZg6RjxqEBBZX86Tv3",
//   "0.005",
//   transConnection,
// );

// ListATAs("2dZrQcsKeF5pXhdgMVCSNA2dEXz67JY2QERNY2j36F5k");
