import decryptAccount from "./decryptAccount";
/**
 * Returns account data from MongoDB
 * @param {string} shopifyShop The Shopify shop: example.myshopify.com
 * @returns All account information we have stored in MongoDB for this shop
 */
async function getAccountByShop(shopifyShop) {
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
    const query = { shop: shopifyShop };

    const account = await accounts.findOne(query);
    await client.close();
    // Decrypt confidential stuff
    if (!account) {
      return false
    }
    const accountDecrypted = decryptAccount(account);
    return accountDecrypted;
  } catch (e) {
    console.log(e);
    await client.close();
  }
}
export default getAccountByShop;
