import Router from "koa-router";
const koaBody = require("koa-body");
import shareasale from "../functions";
const crypto = require("crypto");
const router = new Router();
const MongoClient = require("mongodb").MongoClient;
const mongoUri = process.env.MONGO_URI;

router.post("/api/shareasalepostback/", koaBody(), async (ctx) => {
  ctx.status = 200;
  console.log(ctx);
  if (ctx.request.header["user-agent"] === "ShareASale Postback Agent") {
    const { commission, userID, tracking } = ctx.request.body,
      merchantID = ctx.request.query.merchantID;
    if (merchantID) {
      const account = await shareasale.getAccountByMerchantID(merchantID);
      shareasale.addTagsToOrder(
        account.shop,
        tracking,
        account.accessToken,
        userID,
        commission
      );
    }
  }
});

router.post("/api/editshop/", koaBody(), async (ctx) => {
  ctx.status = 200;
  let requestBody = JSON.parse(ctx.request.body);
  if ("merchantID" in requestBody) {
    if (!/^\d+$/.test(requestBody.merchantID)) {
      ctx.body = false;
      return;
    }
  }
  shareasale.editShop(requestBody);
  ctx.body = true;
});

// Retrieve a list of master tag plugins
router.get("/api/plugins/", async (ctx) => {
  ctx.status = 200;
  const client = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    const database = client.db("shareasale-shopify-app");
    const accounts = database.collection("accounts");

    ctx.body = await accounts.find();
  } catch(e) {
    console.log(e)
  } finally {
    await client.close();
  }

  
});

// This endpoint is called to validate a merchant's API credentials
router.post("/api/validate/", koaBody(), async (ctx) => {
  ctx.status = 200;
  // A fake order is sent to ShareASale to attempt a void
  let requestBody = JSON.parse(ctx.request.body),
    { shop, apiToken, apiSecret, action, useDBCredentials } = requestBody,
    fakeOrder = {
      name: "#01",
      created_at: "01/01/2000",
    },
    response,
    shareasaleAccount = await shareasale.getAccountByShop(shop);
  if (action === "reference") {
    response = await shareasale.referenceTransaction(
      "test_100_test",
      "01/01/2017",
      "1",
      "ABC123",
      shareasaleAccount.merchantID,
      shareasaleAccount.shareasaleAPIToken,
      shareasaleAccount.shareasaleAPISecret
    );
  } else {
    // "useDBCredentials" checks the existing API credentials in the DB
    // Without it, we check the credentials passed as arguments
    response = useDBCredentials
      ? await shareasale.voidOrder(
        fakeOrder,
        shareasaleAccount.merchantID,
        shareasaleAccount.shareasaleAPIToken,
        shareasaleAccount.shareasaleAPISecret
      )
      : await shareasale.voidOrder(
        fakeOrder,
        shareasaleAccount.merchantID,
        apiToken,
        apiSecret
      );
  }
  ctx.body = response;
});
router.post("/api/settings/", koaBody(), async (ctx) => {
  ctx.status = 200;
  let requestBody = JSON.parse(ctx.request.body);
  // Only extract settings here and not actual tokens, keys, passwords, etc.
  const {
    merchantID,
    masterTagID,
    masterTagShopifyID,
    trackingTagShopifyID,
    recurringCommissionsWebhookID,
    autoReconciliationWebhookID,
    storesConnectStoreID,
    xtypeMode,
    xtypeValue,
    channelDeduplication,
    datafeedCustomCommissions,
    datafeedDefaultCategory,
    datafeedDefaultSubcategory,
    datafeedExcludedSkus,
    primaryDomain,
    ftpEnabled,
    shareasaleFTPUsername,
    shareasaleFTPPassword,
    ftpWebhooksRegistered
  } = await shareasale.getAccountByShop(requestBody.shop);
  ctx.body = {
    merchantID: merchantID,
    masterTagID: masterTagID,
    masterTagShopifyID: masterTagShopifyID,
    trackingTagShopifyID: trackingTagShopifyID,
    recurringCommissionsWebhookID: recurringCommissionsWebhookID,
    autoReconciliationWebhookID: autoReconciliationWebhookID,
    storesConnectStoreID: storesConnectStoreID,
    xtypeMode: xtypeMode,
    xtypeValue: xtypeValue,
    channelDeduplication: channelDeduplication,
    datafeedCustomCommissions: datafeedCustomCommissions,
    datafeedDefaultCategory: datafeedDefaultCategory,
    datafeedDefaultSubcategory: datafeedDefaultSubcategory,
    datafeedExcludedSkus: datafeedExcludedSkus,
    primaryDomain: primaryDomain,
    ftpEnabled: ftpEnabled,
    shareasaleFTPUsername: shareasaleFTPUsername,
    shareasaleFTPPassword: shareasaleFTPPassword,
    ftpWebhooksRegistered: ftpWebhooksRegistered
  };
});
router.post("/api/graphql/", koaBody(), async (ctx) => {
  const gqlBody = JSON.parse(ctx.request.body);
  if (!gqlBody?.shop) { return {success: false} }
  const account = await shareasale.getAccountByShop(gqlBody.shop);
  const queryResult = await shareasale.graphql(gqlBody.shop, account.accessToken, gqlBody.graphql);
  ctx.body = JSON.stringify(queryResult);
});
router.post("/api/order/", koaBody(), async (ctx) => {
  let trackingTagRequestBody = JSON.parse(ctx.request.body),
    orderID = trackingTagRequestBody.order_id,
    shop = trackingTagRequestBody.shop,
    shareasaleAccount = await shareasale.getAccountByShop(shop);
  const shopifyResponse = await shareasale.getOrder(
    shop,
    orderID,
    shareasaleAccount.accessToken
  );
  ctx.status = 200;
  ctx.body = shopifyResponse;
});
router.post(
  "/api/webhooks/",
  koaBody({ includeUnparsed: true }),
  async (ctx) => {
    ctx.status = 200;
    const webhookHeaders = ctx.request.header,
      webhookHashHeader = webhookHeaders["x-shopify-hmac-sha256"],
      webhookTopic = webhookHeaders["x-shopify-topic"],
      webhookShop = webhookHeaders["x-shopify-shop-domain"],
      rawBody = ctx.request.body[Symbol.for("unparsedBody")],
      authenticatedHash = crypto
        .createHmac("SHA256", process.env.SHOPIFY_API_SECRET)
        .update(rawBody)
        .digest("base64");
    if (
      webhookHashHeader.length !== authenticatedHash.length ||
      !crypto.timingSafeEqual(
        Buffer.from(webhookHashHeader),
        Buffer.from(authenticatedHash)
      )
    ) {
      ctx.status = 401;
      console.log("A request came in and it was not from Shopify");
      return;
    }
    if (webhookTopic === "orders/updated") {
      // Run the VOID API call for any fully refunded order
      // Otherwise, run the EDIT call for any partial refunds
      const shareasaleAccount = await shareasale.getAccountByShop(webhookShop),
        {
          merchantID,
          shareasaleAPIToken,
          shareasaleAPISecret,
        } = shareasaleAccount;
      try {
        if (ctx.request.body.financial_status === "refunded") {
          shareasale.voidOrder(
            ctx.request.body,
            merchantID,
            shareasaleAPIToken,
            shareasaleAPISecret
          );
        } else if (ctx.request.body.financial_status === "partially_refunded") {
          shareasale.editOrder(
            ctx.request.body,
            merchantID,
            shareasaleAPIToken,
            shareasaleAPISecret
          );
        }
      } catch (e) {
        console.log(`Edit/Void Call Failed for ${webhookShop}: ${e}`);
      }
    }
    if (webhookTopic === "app/uninstalled") { 
      shareasale.deleteAccountByShop(webhookShop);
    }
    // This is a required webhook, but we don't store any customer data.
    // There's nothing we can do with this, but it needs to be here.
    if (webhookTopic === "customers/redact") {
      console.log("Customer Redaction Request");
      ctx.body = "GDPR Customer Redaction Request received and processed.";
    }
    // Same as above. This is also required even though it's not relevant
    if (webhookTopic === "customers/data_request") {
      console.log("Customer Data Request");
      ctx.body =
        "GDPR Customer Data Request received. However, no customer records were located.";
    }
    // Merchants who delete the app will have their record removed immediately. Shopify
    // sends this required webhook 48 hours later, but we don't want cases where the merchant
    // uninstalls, reinstalls, then the GDPR webhook deletes the DB record.
    if (webhookTopic === "shop/redact") {
      ctx.body = "GDPR Deletion Request received and processed.";
    }
    // For recurring commissions
    if (webhookTopic === "orders/create") {
      const newOrder = ctx.request.body;
      if (newOrder.source_name === "subscription_contract") {
        // We need to find the origin order, which would have been a web checkout
        // that contained the same SKUs as the new order
        var subscriptionSkulist = [];
        for (let x of newOrder.line_items) {
          subscriptionSkulist.push(x.sku);
        }
        const shareasaleAccount = await shareasale.getAccountByShop(
          webhookShop
        ),
          {
            merchantID,
            shareasaleAPIToken,
            shareasaleAPISecret,
          } = shareasaleAccount,
          originTransaction = await shareasale.getSubscriptionOrigin(
            webhookShop,
            newOrder.customer.id,
            subscriptionSkulist,
            shareasaleAccount.accessToken
          );
        if (originTransaction) {
          shareasale.referenceTransaction(
            originTransaction.orderNumber,
            originTransaction.createdAt,
            newOrder.subtotal_price,
            newOrder.name,
            merchantID,
            shareasaleAPIToken,
            shareasaleAPISecret
          );
        } else {
          console.log("Failed ref transaction");
        }
      }
    }
    // Listen for product updates for FTP
    if (['products/delete', 'products/create', 'products/update'].includes(webhookTopic)) {
      shareasale.editShop({
        shop: webhookShop,
        nextFtpRun: true
      })
    }
  }
);
router.get("/healthcheck", async (ctx) => {
  ctx.res.statusCode = 200;
  ctx.body = 'app is running'
});
module.exports = router;
