const { GraphQLClient, gql } = require("graphql-request");
/**
 * Retrieves order information from the Shopify API
 * @param {string} shop The Shopify 'shop' identifier
 * @param {string|number} tracking The order ID received from the ShareASale POSTback 
 * @param {string} accessToken The Shopify access token for the shop
 * @param {string|number} userID The affiliate ID that received commission
 * @param {string} commission The total commission paid to the affiliate
 * @returns The full order details from the Shopify API 
 */
async function getOrder(shop, tracking, accessToken, userID, commission) {
    try {
        const endpoint = `https://${shop}/admin/api/2021-01/graphql.json`,
            graphQLClient = new GraphQLClient(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                }
            }),
            query = gql`
                query {
                orders(first: 1, query: "${tracking}"){
                    edges{
                    node{
                        id
                        name
                    }
                    }
                }
                }`,
            queryData = await graphQLClient.request(query).catch((e) => console.log(e)),
            orderGraphQLID = queryData.orders.edges[0].node.id,
            mutation = gql`
            mutation {
                tagsAdd(id:"${orderGraphQLID}", tags: ["ShareASale Tracked", "Affiliate ID\: ${userID}", "Commission: ${commission}"]){
                    userErrors{
                        message
                        field
                     }
                    }
            }`;
        await graphQLClient.request(mutation).catch((e) => console.log(e));
        console.log(`Added Shopify tags for ${shop} on order ${tracking}`);
        // Example output from this call: { order: { name: '#1045', customer: { ordersCount: '0' } } }
        return queryData.order
    }
    catch (e) {
        console.log(`GraphQL request failed for ${shop} on Shopify Order No. ${tracking}`);
        console.log(e);
    }
}
export default getOrder