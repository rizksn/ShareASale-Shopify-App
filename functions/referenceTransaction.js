import createAuthHeaders from "./createAuthHeaders";
async function referenceTransaction(
  originalOrderNumber,
  originalTransdate,
  amount,
  tracking,
  merchantID,
  apiToken,
  apiSecret
) {
  const fetch = require("node-fetch"),
    newTracking = tracking.split("#")[1] || tracking,
    date = new Date(originalTransdate),
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
    action_verb = "reference",
    // setup request params
    url = `https://api.shareasale.com/w.cfm?transtype=sale&merchantId=${my_merchant_id}&token=${apiToken}&version=${api_version}&action=${action_verb}&ordernumber=${originalOrderNumber}&date=${dateFormatted}&amount=${amount}&tracking=${newTracking}`,
    // execute request
    request = await fetch(url, {
      method: "GET",
      headers: createAuthHeaders(apiToken, apiSecret, action_verb),
    }),
    // log the response from ShareASale
    response = await request.text();
  console.log(response.trim());
  return response.trim();
}
export default referenceTransaction;
