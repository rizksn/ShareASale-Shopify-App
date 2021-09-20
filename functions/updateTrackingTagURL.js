/**
 * Sets all parameters on the tracking tag URL
 * @param {object} settings Settings from Mongo DB
 * @param {string} parameter The parameter's name on the tracking tag to update. Pass 'xtype' for xtype changes since 2 parameters are affected
 * @param {string} newValue The value for the parameter to set
 * @param {string} newValue2 Additional value for setting xtype value param
 * @returns
 */
function updateTrackingTagURL(settings, parameter, newValue, newValue2 = "") {
  const merchantID = parameter === "sasmid" ? newValue : settings.merchantID,
    masterTagID = parameter === "ssmtid" ? newValue : settings.masterTagID,
    storesConnectStoreID =
      parameter === "scid" ? newValue : settings.storesConnectStoreID,
    xtypeMode = parameter === "xtype" ? newValue : settings.xtypeMode,
    xtypeValue = parameter === "xtype" ? newValue2 : settings.xtypeValue,
    channelDeduplication =
      parameter === "cd" ? newValue : settings.channelDeduplication;
  return `https://static.shareasale.com/json/shopify/shareasale-tracking.js?sasmid=${merchantID}&ssmtid=${masterTagID}&scid=${storesConnectStoreID}&xtm=${xtypeMode}&xtv=${xtypeValue}&cd=${channelDeduplication}`;
}
export default updateTrackingTagURL;
