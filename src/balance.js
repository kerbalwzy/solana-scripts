const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  VersionedTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} = require("@solana/spl-token");
const Decimal = require("decimal.js");
const { RPC, TokenSOL } = require("./consts");
const { ListWallets } = require("./wallet");

// 定义 sleep 函数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 获取代币的精度
async function TokenDecimals(
  keypair,
  tokenAddress,
  connection = new Connection(RPC, "confirmed")
) {
  let decimals = 1e9; // 默认TokenSOL的精度
  if (tokenAddress != TokenSOL) {
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
      decimals = 10 ** accountInfo.value.data.parsed.info.tokenAmount.decimals;
      break;
    }
  }
  return decimals;
}

// 查询钱包中指定币种的余额和单位精度
async function TokenBalanceAndDecimals(
  keypair,
  tokenAddress = TokenSOL,
  connection = new Connection(RPC, "confirmed")
) {
  let balance = new Decimal(0);
  let decimals = 9; // 默认TokenSOL的精度
  // 如果是 SOL 的余额
  if (tokenAddress == TokenSOL) {
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
      decimals = accountInfo.value.data.parsed.info.tokenAmount.decimals;
    }
  }
  //
  console.log(
    `wallet: ${keypair.publicKey.toBase58()}\ttoken:${tokenAddress}\tbalance:${balance}\tdecimals:${decimals}`
  );
  return { balance, decimals };
}

// 查询所有钱包的指定币种的余额
async function WalletsBalance(
  dir = "wallets",
  tokenAddress = TokenSOL,
  connection = new Connection(RPC, "confirmed")
) {
  const keypairs = ListWallets(dir);
  for (const keypair of keypairs) {
    await TokenBalanceAndDecimals(keypair, tokenAddress, connection); // 调用函数并在函数内部打印余额
    // await sleep(50);
  }
}

// 转移钱包中的指定币种的余额
async function TransferBalance(
  sender,
  receiver,
  amount,
  tokenAddress = TokenSOL,
  connection = new Connection(RPC, "confirmed")
) {
  const receiverPublicKey = new PublicKey(receiver);
  // 发送者和接收者是同一个账号时， 不进行处理
  if (sender.publicKey.equals(receiverPublicKey)) {
    console.log(
      `transaction: ${tokenAddress} ${sender.publicKey.toBase58()} -> ${receiverPublicKey.toBase58()} sender == receiver, skip!`
    );
    return;
  }
  // 转移金额为0时，不进行处理
  amount = new Decimal(amount);
  if (amount == 0) {
    console.log(
      `transaction: ${tokenAddress} ${sender.publicKey.toBase58()} -> ${receiverPublicKey.toBase58()} amount == 0, skip!`
    );
    return;
  }
  const { balance, decimals } = await TokenBalanceAndDecimals(
    sender,
    tokenAddress,
    connection
  );
  if (balance == 0) {
    console.log(
      `transaction: ${tokenAddress} ${sender.publicKey.toBase58()} -> ${receiverPublicKey.toBase58()} balance == 0, skip!`
    );
    return;
  }
  let signature = null;
  let transaction = new Transaction();
  // 根据不同的币种构建交易
  if (tokenAddress == TokenSOL) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new PublicKey(receiver),
        lamports: new Decimal(amount).times(1e9).toNumber(),
      })
    );
  } else {
    const tokenPublicKey = new PublicKey(tokenAddress);
    // 获取或创建发件人和接收人的代币账户
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenPublicKey,
      sender.publicKey
    );
    const receiverTokenAccount = await getAssociatedTokenAddress(
      tokenPublicKey,
      receiverPublicKey
    );
    // 检查并创建接收者的代币账户（如果不存在）
    const receiverAccountInfo = await connection.getAccountInfo(
      receiverTokenAccount
    );
    if (!receiverAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          sender.publicKey,
          receiverTokenAccount,
          receiverPublicKey,
          tokenPublicKey
        )
      );
    }
    // 创建转账指令
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        receiverTokenAccount,
        sender.publicKey,
        new Decimal(amount).times(10 ** decimals).toNumber()
      )
    );
  }
  // 发送交易
  // 获取最近的区块哈希值并设置到交易中
  let retries = 3; // 设置重试次数
  while (retries > 0) {
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender.publicKey;
      // 发送并确认交易
      signature = await sendAndConfirmTransaction(connection, transaction, [
        sender,
      ]);
      console.log(
        `transaction: ${tokenAddress} ${sender.publicKey.toBase58()} -> ${receiverPublicKey.toBase58()} ${amount}\n${signature}`
      );
      break; // 成功后退出循环
    } catch (error) {
      console.error(`Transaction failed: ${error.message}`);
      retries -= 1;
      if (retries == 0) {
        throw new Error("Transaction failed after multiple retries.");
      }
    }
  }
}

// 汇集所有钱包的指定币种的余额
async function CollectBalances(
  targetAddress,
  retainAmount = new Decimal("0"),
  connection = new Connection(RPC),
  payerAddress = new Array(),
  wallestDir = "wallets",
  tokenAddress = TokenSOL
) {
  const wallets = ListWallets(wallestDir);
  for (const wallet of wallets) {
    if (
      payerAddress.length > 0 &&
      payerAddress.indexOf(wallet.publicKey.toBase58()) == -1
    ) {
      // 跳过不在指定的sourceAddress中的钱包地址
      continue;
    }
    // 发送者币种余额为0时，不进行处理
    const { balance } = await TokenBalanceAndDecimals(
      wallet,
      tokenAddress,
      connection
    );
    if (balance.isZero()) {
      console.log(
        `collect balance: ${tokenAddress} ${wallet.publicKey.toBase58()} balance == 0, skip!`
      );
      continue;
    }
    sleep(500);
    if (balance.greaterThan(retainAmount)) {
      await TransferBalance(
        wallet,
        targetAddress,
        balance.minus(retainAmount),
        tokenAddress,
        connection
      );
    } else {
      console.log(
        `collect balance: ${tokenAddress} ${wallet.publicKey.toBase58()} balance < retain amount, skip!`
      );
    }
  }
}
module.exports = {
  TokenDecimals,
  TokenBalanceAndDecimals,
  WalletsBalance,
  TransferBalance,
  CollectBalances,
};
