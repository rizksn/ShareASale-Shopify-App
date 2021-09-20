const { GraphQLClient, gql } = require("graphql-request");

async function graphql(shop, accessToken, query) {
    try {
        const endpoint = `https://${shop}/admin/api/2021-01/graphql.json`,
            graphQLClient = new GraphQLClient(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": accessToken,
                },
            });
        const queryData = await graphQLClient
            .request(query)
            .catch((e) => console.log(e));
        return queryData;
    } catch (e) {
        return {
            "callresult":"failed",
            "error": e
        }
    }
}
export default graphql;