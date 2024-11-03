const { Connection, PublicKey } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { RPC } = require("./consts");

async function ListATAs(
  walletAddress,
  connection = new Connection(RPC, "confirmed")
) {
  const publicKey = new PublicKey(walletAddress);

  // 获取所有与该钱包相关的 SPL 代币账户
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  // 提取和返回所有 SPL 代币账户的相关信息
  const accountsInfo = tokenAccounts.value.map((accountInfo) => {
    const parsedInfo = accountInfo.account.data.parsed.info;
    const item = {
      tokenMint: parsedInfo.mint, // 代币的 Mint 地址
      tokenAccountAddress: accountInfo.pubkey.toBase58(), // 代币账户地址
      tokenAmount: parsedInfo.tokenAmount.uiAmount, // 代币数量（以人类友好的格式）
    };
    console.log(
      `Wallet: ${walletAddress} Token: ${item.tokenMint} ATA: ${item.tokenAccountAddress} balance:${item.tokenAmount}`
    );
    return item;
  });

  return accountsInfo;
}

// 导出函数
module.exports = { ListATAs };
