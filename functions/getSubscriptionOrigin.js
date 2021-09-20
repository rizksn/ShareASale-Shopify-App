const { GraphQLClient, gql } = require("graphql-request");
/**
 * For recurring commissions with SUBSCRIPTIONS BY RECHARGE, we need to find the originating order in Shopify
 * @param {string} shop The MyShopify domain for the merchant
 * @param {string} customerID Shopify's customer ID for the subscriber
 * @param {string} subscriptionSkulist The new order's SKUs
 * @param {string} accessToken The merchant's access token for the Shopify API
 * @returns The original order's date and order ID
 */
async function getSubscriptionOrigin(
  shop,
  customerID,
  subscriptionSkulist,
  accessToken
) {
  try {
    const endpoint = `https://${shop}/admin/api/2021-01/graphql.json`,
      graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      });
    // Query Shopify to find the first 5 orders from the customer that were placed
    // through the web (as opposed to "subscription_contract"). If the customer has
    // placed more than 5 orders, the cursor position is returned, the function
    // recurses, and we can use pagination to retrieve the
    // customer's next 5 orders until we find a match.
    async function findMatch(cursor = "") {
      try {
        var query = cursor
            ? gql`
                query {
                  customer (id: "gid://shopify/Customer/${customerID}") {
                   orders (first: 5, after: "${cursor}", query: "source_name:web") {
                    edges {
                    cursor
                    node {
                        name
                        createdAt
                        lineItems (first: 15) {
                        edges {
                            node {
                            sku
                            }
                        }
                        }
                    }
                    }
                    pageInfo {
                    hasNextPage
                    }
                   }
                  }
                }`
            : gql`
                query {
                  customer (id: "gid://shopify/Customer/${customerID}") {
                   orders (first: 5, query: "source_name:web") {
                    edges {
                    cursor
                    node {
                        name
                        createdAt
                        lineItems (first: 15) {
                        edges {
                            node {
                            sku
                            }
                        }
                        }
                    }
                    }
                    pageInfo {
                    hasNextPage
                    }
                   }
                  }
                }`,
          queryData = await graphQLClient
            .request(query)
            .catch((e) => console.log(e));
        if (queryData.customer.orders.edges[0].cursor) {
          var customerOrders = queryData.customer.orders.edges;
          for (var i = 0; i < customerOrders.length; i++) {
            var oldTransactionSkulist = [];
            for (let x of customerOrders[i].node.lineItems.edges) {
              oldTransactionSkulist.push(x.node.sku);
            }
            if (
              // Check every SKU in the order to see if it matches the subscription
              subscriptionSkulist.every((lineItem) => {
                return oldTransactionSkulist.includes(lineItem) ? true : false;
              })
            ) {
              // When we find a skulist match, we've got the origin order
              var { name, createdAt } = customerOrders[i].node,
                orderNumber = name.split("#")[1] || name;
              return { orderNumber, createdAt };
            }
          }
          // If this code is reached, then we did not get a match on the customer's first
          // 10 orders. We then need to check if there are more records to sift through
          // This should be relatively rare
          if (queryData.customer.orders.pageInfo.hasNextPage) {
            var finalCursor = queryData.customer.orders.edges[i].cursor;
            findMatch(finalCursor);
          } else {
            // If we get here, we have looped through all of the customer's orders but
            // we did not find a match for their origin purchase. This should not happen
            // outside of edge cases.
            return false;
          }
        } else {
          // Every record will have a cursor, so if one wasn't found, return false
          // This scenario should not be possible unless the merchant accidentally
          // deleted their order history in Shopify
          return false;
        }
      } catch (e) {
        console.log(e);
        return false;
      }
    }
    const result = await findMatch();
    return result;
  } catch (e) {
    console.log(
      `Attempted to find reference transaction for ${shop} on the SKUs ${subscriptionSkulist}, but was unsuccessful`
    );
    console.log(e);
  }
}
export default getSubscriptionOrigin;
