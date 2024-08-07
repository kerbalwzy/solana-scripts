// src/main.js
const { NewWallet, ListWallets } = require("./src/wallet");
const { TokenBalance } = require("./src/balance");
const { TokenORE } = require("./src/consts");

// NewWallet()
const keypairs = ListWallets();

(async () => {
  try {
    keypairs.forEach(async (keypair) => {
      const balance = await TokenBalance(keypair, TokenORE); // 调用函数并在函数内部打印余额
    });
  } catch (err) {
    console.error(err);
  }
})();
