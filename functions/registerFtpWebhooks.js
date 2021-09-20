import gql from "graphql-tag";
function registerFtpWebhooks(shop) {
    const productsCreate = fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: shop,
          graphql: buildMutation('PRODUCTS_CREATE')
        })
      });
      const productsUpdate = fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: shop,
          graphql: buildMutation('PRODUCTS_UPDATE')
        })
      });
      const productsDelete = fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: shop,
          graphql: buildMutation('PRODUCTS_DELETE')
        })
      });
      function buildMutation(topic) {
        return gql`mutation {
            webhookSubscriptionCreate(
              topic: ${topic}
              webhookSubscription: {
                callbackUrl: "https://daedalus.shareasale.com/api/webhooks/"
                format: JSON
              }
            ) {
              userErrors {
                field
                message
              }
              webhookSubscription {
                id
              }
            }
          }`
    }
}
export default registerFtpWebhooks;