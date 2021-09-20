import decryptAccount from "./decryptAccount";
/**
 * Returns account data from MongoDB
 * @param {string|number} mid The merchant ID from Shareasale
 * @returns All account information we have stored in MongoDB for this merchant ID
 */
async function getAccountByMerchantID(mid) {
  const MongoClient = require("mongodb").MongoClient;
  const mongoUri = process.env.MONGO_URI;
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const database = client.db("shareasale-shopify-app");
    const accounts = database.collection("accounts");
    const query = { merchantID: parseInt(mid) };
    const account = await accounts.findOne(query);
    const accountDecrypted = decryptAccount(account);
    await client.close();
    return accountDecrypted;
  } catch (e) {
    console.log(e);
    await client.close();
  }
}
export default getAccountByMerchantID;
