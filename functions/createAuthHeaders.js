/**
 * Create Authorization headers for ShareASale API Calls
 * @param {string} token ShareASale API token
 * @param {string} secret ShareASale API secret
 * @param {string} action The action
 * @returns Authorization Headers
 */
function createAuthHeaders(token, secret, action) {
  const crypto = require("crypto"),
    my_timestamp = new Date().toUTCString(),
    sig = token + ":" + my_timestamp + ":" + action + ":" + secret,
    sig_hash = crypto.createHash("sha256").update(sig).digest("hex"),
    headers = {
      "x-ShareASale-Date": my_timestamp,
      "x-ShareASale-Authentication": sig_hash,
    };
  return headers;
}
export default createAuthHeaders;
