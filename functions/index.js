const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

// 載入 Firebase Admin SDK 憑證檔案
const serviceAccount = require("./firebase-adminsdk-credentials.json");

// 初始化 Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 處理POST請求
exports.customTokenEndpoint = functions.https.onRequest(async (req, res) => {
  cors()(req, res, async () => {
  // 驗證錢包地址
    const walletAddress = req.body.walletAddress;
    console.log("test");
    console.log("Request body:", req.body);
    console.log(walletAddress);

    const testAddress = "0xdbE430Ab7b69E95948aF9a003341838FA937fcB4";
    console.log("answer:", isValidWalletAddress(testAddress)); // 預期輸出：true

    const testAddress1 = walletAddress;
    console.log("answer:", isValidWalletAddress(testAddress1)); // 預期輸出：true

    // 輸出錢包地址到 Firebase 控制台
    console.log("Received wallet address:", walletAddress);
    if (isValidWalletAddress(walletAddress) !== true) {
      res.status(400).send("Invalid wallet address");
      return;
    }

    
    if (req.headers["content-type"] !== "application/json") {
      res.status(400).send("Invalid Content-Type");
      return;
    }

    // 其他額外的驗證或檢查
    if (!walletAddress) {
      res.status(400).send("Missing wallet address");
      return;
    }

    try {
    // 生成自定義令牌
      const customToken = await admin.auth().createCustomToken(walletAddress);
      res.status(200).send(customToken);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating custom token");
    }
  });
});

/**
 * 驗證錢包地址是否有效
 * @param {string} walletAddress - 要驗證的錢包地址
 * @return {boolean} - 如果錢包地址有效，則返回 true；否則返回 false
 */
function isValidWalletAddress(walletAddress) {
  // 在這裡實現驗證邏輯
  // 使用正則表達式驗證錢包地址的格式
  const walletAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return walletAddressRegex.test(walletAddress);
}

