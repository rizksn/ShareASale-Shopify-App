const shareasaleURLTest = new RegExp('checkouts.*thank_you|checkout.*orders.*show'),
  shareasaleFirstTimeAccessed = shareasaleURLTest.test(window.location.href),
  shareasaleScripts = document.getElementsByTagName("script"),
  shareasaleLocation = new URL(window.location.href),
  shareasaleTroubleshooting = shareasaleLocation.searchParams.get(
    "troubleshooting"
  );
for (let x of shareasaleScripts) {
  if (x.src.includes("shareasale-tracking.js")) {
    var shareasaleTrackingURL = new URL(x.src),
      shareasaleMerchantID = shareasaleTrackingURL.searchParams.get("sasmid"),
      shareasaleMasterTagID = shareasaleTrackingURL.searchParams.get("ssmtid"),
      shareasaleStoreID = shareasaleTrackingURL.searchParams.get("scid"),
      shareasaleXtypeMode = shareasaleTrackingURL.searchParams.get("xtm"),
      shareasaleXtypeValue = shareasaleTrackingURL.searchParams.get("xtv"),
      shareasaleChannelDeduplication = shareasaleTrackingURL.searchParams.get(
        "cd"
      );
    break;
  }
}
const sas_m_awin_cookie = shareasaleGetCookie("sas_m_awin"),
  shareasaleChannel = shareasaleGetCookie("source"),
  sas_sscid = sas_m_awin_cookie ? JSON.parse(sas_m_awin_cookie).clickId : null;
if (!typeof shareasaleScalability === 'undefined' && shareasaleScalability) {
  if (shareasaleScalabilityFTA || shareasaleTroubleshooting == "1") {
    var scalabilityOrder = {
      name: shareasaleScalabilityON || shareasaleGetOrderRef(),
      customer: {
        ordersCount: shareasaleScalabilityOC,
      },
    };
    shareasalePixelAppend(
      createShareasalePixelURL(scalabilityOrder, "shopify_app_1.0_scalability"),
      shareasaleMasterTagID
    );
  }
}
if (shareasaleFirstTimeAccessed || shareasaleTroubleshooting) {
  if (!sas_m_awin_cookie && Shopify.checkout.discount === null) {
    console.log('No SSCID located and no coupon used. Appending basic pixel');
    appendBasicPixel()
  }
  else {
    shareasaleRun();
  }
}
/**
 * Runs shareasale tracking
 */
async function shareasaleRun() {
  document.addEventListener("visibilitychange", fireShareasaleBeacon);
  const shareasaleFetchBody = {
    order_id: Shopify.checkout.order_id,
    shop: Shopify.shop,
  };
  try {
    const sendToServer = await fetch(
      'https://daedalus.shareasale.com/api/order/',
      {
        method: "POST",
        body: JSON.stringify(shareasaleFetchBody),
      }
    ),
      results = await sendToServer.json();
    document.removeEventListener("visibilitychange", fireShareasaleBeacon);
    const shareasalePixelURL = createShareasalePixelURL(results);
    if (shareasalePixelURL) {
      shareasalePixelAppend(shareasalePixelURL, shareasaleMasterTagID);
    }
  } catch (error) {
    console.log("ShareASale Pixel Failed. Appending basic tracking. " + error);
    appendBasicPixel();
    document.removeEventListener("visibilitychange", fireShareasaleBeacon);
  }
}
/**
 * Builds pixel URL for both advanced pixel and basic fallback pixel
 * @param {object} order Order data to buil pixel with
 * @returns string
 */
function createShareasalePixelURL(order, version) {
  if (!version) {
    version = "shopify_app_1.0_pixel";
  }
  var sas_merchantID = shareasaleMerchantID,
    sas_currency = Shopify.checkout.presentment_currency,
    sas_skulist = [],
    sas_pricelist = [],
    sas_quantitylist = [],
    sas_couponcode = Shopify.checkout.discount
      ? Shopify.checkout.discount.code
      : "",
    sas_totalDiscounts = Shopify.checkout.discount
      ? parseFloat(Shopify.checkout.discount.amount)
      : 0,
    sas_subtotal = parseFloat(Shopify.checkout.subtotal_price),
    sas_orderRatio =
      1 - sas_totalDiscounts / (sas_subtotal + sas_totalDiscounts);
  if (order.name) {
    var sas_orderName = order.name.split("#")[1] || order.name,
      sas_newcustomer = order.customer.ordersCount <= 1 ? 1 : 0;
  } else {
    var sas_orderName = shareasaleGetOrderRef(),
      sas_newcustomer = "";
  }
  Shopify.checkout.line_items.map((x) => {
    sas_skulist.push(x.sku);
    sas_pricelist.push((x.price * sas_orderRatio).toFixed(2));
    sas_quantitylist.push(x.quantity);
  });
  var shareasalePixelURL = `https://shareasale.com/sale.cfm?transtype=sale&merchantID=${sas_merchantID}&amount=${sas_subtotal}&tracking=${sas_orderName}&currency=${sas_currency}&newcustomer=${sas_newcustomer}&skulist=${sas_skulist}&pricelist=${sas_pricelist}&quantitylist=${sas_quantitylist}&couponcode=${sas_couponcode}&v=${version}`;
  if (sas_sscid) {
    shareasalePixelURL += `&sscid=${sas_sscid}&sscidmode=6`;
  }
  // Append additional settings. Because booleans and null types will be addded to
  // the pixel as strings, check against these as well
  if (shareasaleStoreID && shareasaleStoreID !== "null") {
    shareasalePixelURL += `&storeID=${shareasaleStoreID}`;
  }
  if (
    shareasaleXtypeValue &&
    shareasaleXtypeValue !== "null" &&
    shareasaleXtypeMode !== "disabled"
  ) {
    if (shareasaleXtypeMode === "static") {
      shareasalePixelURL += `&xtype=${shareasaleXtypeValue}`;
    } else if (shareasaleXtypeMode === "dynamic") {
      shareasalePixelURL += `&xtype=${window[shareasaleXtypeValue]}`;
    }
  }
  if (
    shareasaleChannel &&
    shareasaleChannelDeduplication &&
    shareasaleChannelDeduplication !== "false"
  ) {
    if (
      !shareasaleChannel.match(/sas|shareasale/gi) &&
      !shareasaleChannel.match(/ppc|display|google|adwords|googleads/gi)
    ) {
      shareasalePixelURL += `&autovoid=1&channel=${shareasaleChannel}`;
    } else {
      shareasalePixelURL += `&autovoid=0&channel=${shareasaleChannel}`;
    }
  }
  // Below adds a conversion script that allows easy use of the Master Tag plugins
  // by creating the AWIN sale object
  if (shareasaleMasterTagID !== "19038" && order.order_id) {
    const shareasaleConversionScript = document.createElement("script");
    shareasaleConversionScript.innerHTML = `
     var AWIN = AWIN || {};
     AWIN.Tracking = AWIN.Tracking || {};
     AWIN.Tracking.Sale = AWIN.Tracking.Sale || {};
     AWIN.Tracking.Sale.amount = AWIN.Tracking.Sale.amount || '${sas_subtotal}';
     AWIN.Tracking.Sale.channel = AWIN.Tracking.Sale.channel || '${shareasaleChannel}';
     AWIN.Tracking.Sale.orderRef = AWIN.Tracking.Sale.orderRef || '${sas_orderName}';
     AWIN.Tracking.Sale.voucher = AWIN.Tracking.Sale.voucher || '${sas_couponcode}';
     AWIN.Tracking.Sale.currency = AWIN.Tracking.Sale.currency || '${sas_currency}'`;
    document.body.appendChild(shareasaleConversionScript);
  }
  return shareasalePixelURL;
}
/**
 * Adds the pixel and the master tag to the Thank You page
 * @param {string} url The src value for the tracking pixel
 * @param {string|number} shareasaleMastertagID The ID of the master tag to append to the page
 */
function shareasalePixelAppend(url, shareasaleMastertagID) {
  var shareasaleImage = new Image();
  shareasaleImage.setAttribute('data-hj-suppress', '');
  shareasaleImage.src = url;
  document.body.appendChild(shareasaleImage);
  appendMasterTag(shareasaleMastertagID);
}
function shareasaleGetOrderRef() {
  var orderRef;
  try {
    var orderLabel = document.querySelector(".os-order-number");
    if (orderLabel !== null) {
      orderRef = orderLabel.innerText.split("#")[1];
      if (!orderRef) {
        orderRef = orderLabel.innerText.split(" ")[1];
      }
    }
    if (!orderRef) {
      orderRef = window.Shopify.checkout.order_id;
    }
    if (!orderRef) {
      throw Error("order_ref_error");
    }
  } catch (err) {
    console.log(
      "ShareASale: error getting orderRef from page. Using timestamp."
    );
    orderRef = Date.now();
  }
  return orderRef;
}
function shareasaleGetCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function fireShareasaleBeacon() {
  if (document.visibilityState === "hidden") {
    navigator.sendBeacon(
      createShareasalePixelURL(Shopify.checkout, "shopify_app_1.0_beacon")
    );
  }
}
function appendBasicPixel() {
  const shareasaleBasicPixel = new Image();
  shareasaleBasicPixel.setAttribute('data-hj-suppress', '');
  shareasaleBasicPixel.src = createShareasalePixelURL(
    Shopify.checkout,
    "shopify_app_1.0_fallback"
  );
  document.body.appendChild(shareasaleBasicPixel);
  appendMasterTag(shareasaleMasterTagID);
}
/**
 * Asynchronous code requires us to inject the tag only when ready
 * @param {string|number} id The Awin master tag ID 
 */
function appendMasterTag(id) {
  var shareasaleMasterTag = document.createElement("script");
  shareasaleMasterTag.src = `https://www.dwin1.com/${id}.js`;
  document.body.appendChild(shareasaleMasterTag);
}