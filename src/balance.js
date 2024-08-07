const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const Decimal = require("decimal.js");
const { RPC, TokenSOL } = require("./consts");

async function TokenBalance(keypair, tokenAddress = TokenSOL) {
  const connection = new Connection(RPC, "confirmed");
  let balance = new Decimal(0);

  // 如果是 SOL 的余额
  if (tokenAddress === TokenSOL) {
    const lamports = await connection.getBalance(keypair.publicKey);
    balance = new Decimal(lamports).div(1e9); // Convert lamports to SOL
  } else {
    // 如果是 SPL 代币的余额
    const tokenPublicKey = new PublicKey(tokenAddress);
    const accounts = await connection.getTokenAccountsByOwner(
      keypair.publicKey,
      {
        mint: tokenPublicKey,
      }
    );
    for (const account of accounts.value) {
      const accountInfo = await connection.getParsedAccountInfo(account.pubkey);
      const tokenAmount =
        accountInfo.value.data.parsed.info.tokenAmount.uiAmount;
      balance = balance.plus(tokenAmount);
    }
  }
  //
  console.log(
    `wallet: ${keypair.publicKey.toBase58()}\ttoken:${tokenAddress}\tbalance:${balance}`
  );
  return balance;
}

module.exports = { TokenBalance };
