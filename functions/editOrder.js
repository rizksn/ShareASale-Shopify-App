import createAuthHeaders from "./createAuthHeaders";
async function editOrder(order, merchantID, apiToken, apiSecret) {
  // The original data persists in the object Shopify sends us
  // so the new_amount will start with the original price and then
  // subtract down through each refund
  var new_amount = order.subtotal_price_set.presentment_money.amount,
    currency = order.presentment_currency;
  // Each individual refund event (x) is at the top of order.refunds
  // Below that is an array of each individual line item that was refunded (y)
  for (let x of order.refunds) {
    for (let y of x.refund_line_items) {
      new_amount = new_amount - y.subtotal_set.presentment_money.amount;
    }
  }

  const fetch = require("node-fetch"),
    orderName = order.name.split("#")[1] || ctx.request.body.name,
    date = new Date(order.created_at),
    // Format the date to mm/dd/yyyy
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
    action_verb = "edit",
    // setup request params
    url = `https://api.shareasale.com/w.cfm?merchantId=${my_merchant_id}&token=${apiToken}&version=${api_version}&action=${action_verb}&ordernumber=${orderName}&date=${dateFormatted}&newamount=${new_amount}&currency=${currency}`,
    // execute request
    request = await fetch(url, {
      method: "GET",
      headers: createAuthHeaders(apiToken, apiSecret, action_verb),
    }),
    // log the response from ShareASale
    response = await request.text();
  console.log(response.trim());
}

export default editOrder;
