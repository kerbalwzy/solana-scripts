// src/createWallet.js
const { Keypair } = require("@solana/web3.js");
const bip39 = require("bip39");
const bs58 = require("bs58");
const { derivePath } = require("ed25519-hd-key");
const fs = require("fs");
const path = require("path");

// 生成助记词
function generateMnemonic() {
  return bip39.generateMnemonic();
}

// 从助记词生成 Solana 密钥对
function mnemonicToSolanaKeypair(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
  return Keypair.fromSeed(derivedSeed.slice(0, 32));
}

// 创建新的钱包
function createWallet() {
  const mnemonic = generateMnemonic();
  const keypair = mnemonicToSolanaKeypair(mnemonic);
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = JSON.stringify(Array.from(keypair.secretKey));

  return { mnemonic, publicKey, secretKey };
}

// 保存钱包到文件
function saveWalletToFile(wallet, dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const filePath = path.join(dir, `${wallet.publicKey}.json`);
  fs.writeFileSync(filePath, wallet.secretKey);
  console.log(`Wallet saved to ${filePath}`);
}

// 打印助记词和钱包信息
function printWalletInfo(wallet) {
  const secretKeyArray = JSON.parse(wallet.secretKey); // 将 JSON 字符串转换回数组
  const secretKeyUint8Array = new Uint8Array(secretKeyArray); // 转换为 Uint8Array
  const secretKeyBase58 = bs58.default.encode(secretKeyUint8Array); // 使用 Base58 编码
  console.log("=============== new wallet ===============");
  console.log("Mnemonic:\t", wallet.mnemonic);
  console.log("Public Key:\t", wallet.publicKey);
  console.log("Secret Key (Base58):\t", secretKeyBase58); // 输出 Base58 编码
  console.log("==========================================");
}

// 创建并保存新钱包
function NewWallet(dir = "wallets") {
  const wallet = createWallet();
  printWalletInfo(wallet);
  saveWalletToFile(wallet, dir);
}

// 获取指定钱包的Keypair对象
function Wallet(address, dir = "wallets") {
  const filePath = path.join(dir, `${address}.json`);
  const filecontent = fs.readFileSync(filePath, "utf-8");
  const secretKeyArray = JSON.parse(filecontent);
  const secretKeyUint8Array = new Uint8Array(secretKeyArray);
  const keypair = Keypair.fromSecretKey(secretKeyUint8Array);
  console.log("Wallet Public Key:\t", keypair.publicKey.toBase58());
  return keypair;
}

// 扫描目录并获取所有钱包文件的 Keypair 对象
function ListWallets(dir = "wallets") {
  const keypairs = [];
  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((file) => path.extname(file) === ".json");
    console.log("=============== list wallets ==============");
    for (const file of files) {
      const filePath = path.join(dir, file);
      const filecontent = fs.readFileSync(filePath, "utf-8");
      const secretKeyArray = JSON.parse(filecontent);
      const secretKeyUint8Array = new Uint8Array(secretKeyArray);
      const keypair = Keypair.fromSecretKey(secretKeyUint8Array);
      const secretKeyBase58 = bs58.default.encode(secretKeyUint8Array); // 使用 Base58 编码
      keypairs.push(keypair);
      console.log("Wallet Public Key:\t", keypair.publicKey.toBase58());
      console.log("Secret Key (Base58):\t", secretKeyBase58); // 输出 Base58 编码
    }
    console.log("==========================================");
  }
  return keypairs;
}

// 导出函数
module.exports = { NewWallet, Wallet, ListWallets };
