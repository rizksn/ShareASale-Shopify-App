/**
 * Add a newly installed merchant to MongoDB
 * @param {object} input Object containing the shop's information
 * @param {string} shopifyShop Shop from Oauth: example.myshopify.com
 * @param {string} shopifyAccessToken Access token for interacting with Shopify's REST API
 */
async function addShop(input) {
  const { shopifyShop, shopifyAccessToken } = input;
  const CryptoJS = require("crypto-js");
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
    // Check to see if existing record exists for the myshopify domain
    const query = { shop: shopifyShop };
    const account = await accounts.findOne(query);
    if (account) {
      // Abort if an existing record is located
      await client.close();
      return
     }
    // create a document to be inserted
    const doc = {
      shop: shopifyShop,
      accessToken: CryptoJS.AES.encrypt(
        shopifyAccessToken,
        process.env.DB_SALT
      ).toString(),
      merchantID: input.merchantID || null,
      masterTagID: input.masterTagID || 19038,
      masterTagShopifyID: input.masterTagShopifyID || null,
      trackingTagShopifyID: input.trackingTagShopifyID || null,
      shareasaleAPIToken: input.shareasaleAPIToken || null,
      shareasaleAPISecret: input.shareasaleAPISecret || null,
      shareasaleFTPUsername: input.shareasaleFTPUsername || null,
      shareasaleFTPPassword: input.shareasaleFTPPassword || null,
      advancedAnalytics: input.advancedAnalytics || false,
      recurringCommissionsWebhookID: input.recurringCommissionsWebhookID || null,
      autoReconciliationWebhookID: input.autoReconciliationWebhookID || null,
      storesConnectStoreID: input.storesConnectStoreID || null,
      xtypeMode: input.xtypeMode || null,
      xtypeValue: input.xtypeValue || null,
      channelDeduplication: input.channelDeduplication || false,
    };
    const result = await accounts.insertOne(doc);
    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`, result
    );
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}
export default addShop;
