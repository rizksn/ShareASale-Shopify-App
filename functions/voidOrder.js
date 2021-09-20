import createAuthHeaders from "./createAuthHeaders";
/**
 * Void a transaction via the ShareASale API
 * @param {object} order Order data received from Shopify webhook
 * @param {string|number} merchantID ShareASale merchant ID
 * @param {string} apiToken ShareASale API Token
 * @param {string} apiSecret ShareASale API Secret Key
 */
async function voidOrder(order, merchantID, apiToken, apiSecret) {
  const fetch = require("node-fetch"),
    orderName = order.name.split("#")[1] || ctx.request.body.name,
    reason = "Order Refunded (Shopify App)",
    date = new Date(order.created_at),
    // Format the date to mm/dd/yyyy (NOT actually necessary like our documentation says)
    // ShareASale API has a 1-2 day buffer for dates, so no need to convert time zones
    dateFormatted =
      (date.getMonth() > 8
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)) +
      "/" +
      (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
      "/" +
      date.getFullYear();
  // credentials and request params

  var my_merchant_id = merchantID,
    api_version = process.env.SHAREASALE_API_VERSION,
    action_verb = "void",
    my_timestamp = new Date().toUTCString(),
    // setup request params
    url = `https://api.shareasale.com/w.cfm?merchantId=${my_merchant_id}&token=${apiToken}&version=${api_version}&action=${action_verb}&ordernumber=${orderName}&date=${dateFormatted}&reason=${reason}`,
    // execute request
    request = await fetch(url, {
      method: "GET",
      headers: createAuthHeaders(apiToken, apiSecret, action_verb),
    }),
    // log the response from ShareASale
    response = await request.text();
  console.log(response.trim());
  // send back server response if needed
  return response.trim();
}

export default voidOrder;
