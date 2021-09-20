/**
 * Deletes account data from MongoDB using the Shopify shop to search
 * @param {string} shopifyShop The Shopify shop: example.myshopify.com
 */
async function deleteAccountByShop(shopifyShop) {
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

    const account = await accounts.deleteOne(query);
    if (account.deletedCount === 1) {
      console.log(`${shopifyShop} uninstalled the app. Removed from DB`);
    } else {
      console.log(
        `${shopifyShop} uninstalled the app, but no account was matched in the DB`
      );
    }
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}
export default deleteAccountByShop;
