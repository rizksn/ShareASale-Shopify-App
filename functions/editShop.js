/**
 * Edits a merchant's listing in MongoDB
 * @param {object} input all variables should be passed as an object with the below properties:
 * @param {string} input.shop The myshopify domain
 * @param {string} input.merchantID ShareASale merchant ID
 * @param {string} input.masterTagID Awin Master Tag ID
 * @param {string} input.apiToken ShareASale API Token
 * @param {string} input.apiSecret ShareASale API Secret Key
 * @param {string} input.shareasaleFTPUsername Username for ShareASale FTP
 * @param {string} input.shareasaleFTPPassword Password for ShareASale FTP
 * @param {boolean} input.advancedAnalytics Advanced Analytics package enabled?
 * @param {boolean} input.recurringCommissions Recurring commissions enabled?
 * @param {boolean} input.autoReconciliation Auto reconciliation enabled?
 * @param {boolean} input.storesConnect StoresConnect enabled?
 * @param {number} input.storesConnectStoreID Store ID for StoresConnect
 * @param {string} input.xtypeMode Enter 'static' or 'dynamic'
 * @param {string} input.xtypeValue Value for static xtype
 * @param {boolean} input.channelDeduplication Whether or not to dedupe by channel
 */
async function editShop(input) {
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
    // create a filter for a merchant to update
    const filter = { shop: input.shop };
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true, ignoreUndefined: true };
    var updateDoc = {
      $set: {},
    };
    if (input.merchantID) {
      updateDoc.$set = {
        ...updateDoc.$set,
        merchantID: parseInt(input.merchantID),
      };
    }
    if (input.masterTagID) {
      updateDoc.$set = {
        ...updateDoc.$set,
        masterTagID: parseInt(input.masterTagID),
      };
    }
    if (input.masterTagShopifyID) {
      updateDoc.$set = {
        ...updateDoc.$set,
        masterTagShopifyID: input.masterTagShopifyID,
      };
    }
    if (input.trackingTagShopifyID) {
      updateDoc.$set = {
        ...updateDoc.$set,
        trackingTagShopifyID: input.trackingTagShopifyID,
      };
    }
    if (input.shareasaleAPIToken) {
      updateDoc.$set = {
        ...updateDoc.$set,
        shareasaleAPIToken: aesEncrypt(input.shareasaleAPIToken),
      };
    }
    if (input.shareasaleAPISecret) {
      updateDoc.$set = {
        ...updateDoc.$set,
        shareasaleAPISecret: aesEncrypt(input.shareasaleAPISecret),
      };
    }
    if (input.hasOwnProperty('shareasaleFTPUsername')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        shareasaleFTPUsername: input.shareasaleFTPUsername,
      };
    }
    if (input.hasOwnProperty('shareasaleFTPPassword')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        shareasaleFTPPassword: input.shareasaleFTPPassword,
      };
    }
    if (input.hasOwnProperty('ftpEnabled')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        ftpEnabled: input.ftpEnabled,
      };
    }
    if (input.hasOwnProperty('nextFtpRun')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        nextFtpRun: input.nextFtpRun,
      };
    }
    if (input.hasOwnProperty('ftpWebhooksRegistered')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        ftpWebhooksRegistered: input.ftpWebhooksRegistered,
      };
    }
    if (input.hasOwnProperty('advancedAnalytics')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        advancedAnalytics: input.advancedAnalytics,
      };
    }
    if (input.hasOwnProperty('recurringCommissionsWebhookID')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        recurringCommissionsWebhookID: input.recurringCommissionsWebhookID,
      };
    }
    if (input.hasOwnProperty('autoReconciliationWebhookID')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        autoReconciliationWebhookID: input.autoReconciliationWebhookID,
      };
    }
    if (input.hasOwnProperty('storesConnectStoreID')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        storesConnectStoreID: input.storesConnectStoreID,
      };
    }
    if (input.xtypeMode) {
      updateDoc.$set = { ...updateDoc.$set, xtypeMode: input.xtypeMode };
    }
    if (input.hasOwnProperty('xtypeValue')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        xtypeValue: input.xtypeValue,
      };
    }
    if (input.hasOwnProperty('channelDeduplication')) {
      updateDoc.$set = {
        ...updateDoc.$set,
        channelDeduplication: input.channelDeduplication,
      };
    }
    if (input.datafeedDefaultCategory) {
      updateDoc.$set = {
        ...updateDoc.$set,
        datafeedDefaultCategory: input.datafeedDefaultCategory,
      };
    }
    if (input.datafeedDefaultSubcategory) {
      updateDoc.$set = {
        ...updateDoc.$set,
        datafeedDefaultSubcategory: input.datafeedDefaultSubcategory,
      };
    }
    if (input.datafeedExcludedSkus) {
      updateDoc.$set = {
        ...updateDoc.$set,
        datafeedExcludedSkus: input.datafeedExcludedSkus,
      };
    }
    if (input.datafeedCustomCommissions) {
      updateDoc.$set = {
        ...updateDoc.$set,
        datafeedCustomCommissions: input.datafeedCustomCommissions,
      };
    }
    if (input.primaryDomain) {
      updateDoc.$set = {
        ...updateDoc.$set,
        primaryDomain: input.primaryDomain,
      };
    }
    if (input.session_id) {
      updateDoc.$set = {
        ...updateDoc.$set,
        session_id: input.session_id,
      };
    }
    if (input.domain_id) {
      updateDoc.$set = {
        ...updateDoc.$set,
        domain_id: input.domain_id,
      };
    }
    if (input.state) {
      updateDoc.$set = {
        ...updateDoc.$set,
        state: input.state,
      };
    }
    if (input.isOnline) {
      updateDoc.$set = {
        ...updateDoc.$set,
        isOnline: input.isOnline,
      };
    }
    if (input.onlineAccessInfo) {
      updateDoc.$set = {
        ...updateDoc.$set,
        onlineAccessInfo: input.onlineAccessInfo,
      };
    }
    if (input.scope) {
      updateDoc.$set = {
        ...updateDoc.$set,
        scope: input.scope,
      };
    }
    if (input.accessToken) {
      updateDoc.$set = {
        ...updateDoc.$set,
        accessToken: input.accessToken,
      };
    }


    const result = await accounts.updateOne(filter, updateDoc, options);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  } finally {
    await client.close();
  }
  function aesEncrypt(text) {
    const passphrase = process.env.DB_SALT;
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  }
}

export default editShop;
