const { Session } = require('@shopify/shopify-api/dist/auth/session');
const CryptoJS = require("crypto-js");
import decryptAccount from "../functions/decryptAccount";

let domain_id = '';
async function storeCallback(session) {
    try {
        const MongoClient = require("mongodb").MongoClient;
        const mongoUri = process.env.MONGO_URI;
        var client = new MongoClient(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await client.connect();
        const database = client.db("shareasale-shopify-app");
        const accounts = database.collection("accounts");
        let data = session;
        data.onlineAccessInfo = JSON.stringify(session.onlineAccessInfo);
        if (data.id.indexOf(data.shop) > -1) {
            domain_id = data.id
        }

        // Check to see if merchant already exists and update accordingly
        const query = { shop: data.shop };
        const account = await accounts.findOne(query);
        if (account) {
            const options = { upsert: true, ignoreUndefined: true };
            var updateDoc = {
                $set: {
                    accessToken: CryptoJS.AES.encrypt(
                        data.accessToken,
                        process.env.DB_SALT
                    ).toString(),
                    state: data.state,
                    session_id: data.id,
                    domain_id: domain_id,
                    scope: data.scope,
                    onlineAccessInfo: data.onlineAccessInfo,
                },
            };
            const updateResult = await accounts.updateOne(query, updateDoc, options);
        }
        // Otherwise, enter a new record
        else {
            const doc = {
                merchantID: null,
                primaryDomain: null,
                shop: data.shop,
                masterTagID: 19038,
                masterTagShopifyID: null,
                trackingTagShopifyID: null,
                shareasaleAPIToken: null,
                shareasaleAPISecret: null,
                shareasaleFTPUsername: null,
                shareasaleFTPPassword: null,
                ftpEnabled: false,
                nextFtpRun: false,
                datafeedDefaultCategory: 1,
                datafeedDefaultSubcategory: 1,
                datafeedExcludedSkus: [],
                datafeedCustomCommissions: [],
                advancedAnalytics: false,
                recurringCommissionsWebhookID: null,
                autoReconciliationWebhookID: null,
                storesConnectStoreID: null,
                xtypeMode: null,
                xtypeValue: null,
                channelDeduplication: false,
                ftpWebhooksRegistered: false,
                session_id: data.id,
                domain_id: domain_id,
                accessToken: data.accessToken,
                state: data.state,
                isOnline: data.isOnline,
                onlineAccessInfo: data.onlineAccessInfo,
                scope: data.scope,
            }
            const result = await accounts.insertOne(doc);
            console.log(
                `New merchant ${data.shop} inserted with the _id: ${result.insertedId}`
            );
        }
    } catch (e) {
        throw new Error(e);
    } finally {
        await client.close();
        return true
    }
}
async function loadCallback(id) {
    try {
        const MongoClient = require("mongodb").MongoClient;
        const mongoUri = process.env.MONGO_URI;
        var client = new MongoClient(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        const database = client.db("shareasale-shopify-app");
        const accounts = database.collection("accounts");
        var session = new Session(id);
        var search = { session_id: id },
            searchResult = await accounts.findOne(search);
        if (!searchResult) {
            var search = { domain_id: id },
                searchResult = await accounts.findOne(search);
        }
        searchResult = decryptAccount(searchResult);
        session.shop = searchResult.shop;
        session.state = searchResult.state;
        session.scope = searchResult.scope;
        session.isOnline = searchResult.isOnline;
        session.onlineAccessInfo = JSON.parse(searchResult.onlineAccessInfo);
        session.accessToken = searchResult.accessToken;
        const date = new Date();
        date.setDate(date.getDate() + 1);
        session.expires = date;

        if (session.expires && typeof session.expires === 'string') {
            session.expires = new Date(session.expires);
        }

    } catch (e) {
        throw new Error(e);
    } finally {
        await client.close();
        return session;
    }
}
async function deleteCallback(id) {
    try {
        return false;
    } catch (e) {
        throw new Error(e)
    }
}


module.exports = {
    storeCallback,
    loadCallback,
    deleteCallback
}