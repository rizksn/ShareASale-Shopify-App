const CryptoJS = require("crypto-js");
/**
 * For decrypting stored keys and passwords
 * @param {object} account The account details retrieved from Mongo DB
 * @returns Account object with decrypted keys
 */
function decryptAccount(account) {
  if (account.shareasaleAPIToken) {
    account.shareasaleAPIToken = aesDecrypt(account.shareasaleAPIToken);
  }
  if (account.shareasaleAPISecret) {
    account.shareasaleAPISecret = aesDecrypt(account.shareasaleAPISecret);
  }
  if (account.accessToken) {
    account.accessToken = aesDecrypt(account.accessToken);
  }
  // if (account.shareasaleFTPUsername) {
  //   account.shareasaleFTPUsername = aesDecrypt(account.shareasaleFTPUsername);
  // }
  // if (account.shareasaleFTPPassword) {
  //   account.shareasaleFTPPassword = aesDecrypt(account.shareasaleFTPPassword);
  // }
  return account;
  function aesDecrypt(ciphertext) {
    const passphrase = process.env.DB_SALT;
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }
}
export default decryptAccount;
