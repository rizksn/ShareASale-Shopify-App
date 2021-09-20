import React, { useState, useCallback } from "react";
import { Page, Layout, EmptyState, Card, Link, TextField } from "@shopify/polaris";
import gql from "graphql-tag";
const os = require("os");


const Start = (props) => {
  const [installationLoading, installationLoadingUpdate] = useState(false);
  const [textFieldMerchantID, setTextFieldMerchantID] = useState("");
  const handleMerchantIDTextFieldChange = useCallback((newValue) => {
    if (newValue.match(/^\d*$/gi)) {
      setTextFieldMerchantID(newValue);
    }
  }, []);
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="To start, enter your ShareASale Merchant ID"
              action={{
                content: "Install Tracking",
                onAction: () => {
                  installationLoadingUpdate(true);
                  merchantStart(props.shop);
                },
                loading: installationLoading,
              }}
              secondaryAction={{
                content: "ShareASale Login",
                url: "https://account.shareasale.com/m-main.cfm",
                external: true,
                outline: true,
              }}
              image={`https://${os.hostname()}/logo.png`}
              footerContent={
                <p>
                  New merchant?{" "}
                  <Link
                    external={true}
                    monochrome
                    url="https://www.shareasale.com/info/merchants/"
                  >
                    Learn More!
                  </Link>
                </p>
              }
            >
              <TextField
                id="shareasaleMerchantID"
                value={textFieldMerchantID}
                onChange={handleMerchantIDTextFieldChange}
              />
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
  async function merchantStart(shop) {
    // Check to see if the text field has a numeric value
    if (document.getElementById("shareasaleMerchantID").value.match(/\d+/)) {
      const shareasaleTrackingURL = "https://static.shareasale.com/json/shopify/shareasale-tracking.js";
      // const shareasaleTrackingURL = "https://daedalus.shareasale.com/shareasale-tracking.js";
      const merchantID = document.getElementById("shareasaleMerchantID").value,
        enterMIDfetchBody = {
          shop: shop,
          merchantID: merchantID,
        },
        enterMID = await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
          method: "POST",
          body: JSON.stringify(enterMIDfetchBody),
        }),
        enterMIDPassedValidation = await enterMID.text();
      console.log(enterMIDPassedValidation);
      if (!enterMIDPassedValidation) {
        return;
      }
      // Add the master tag
      const masterTag = await fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: props.shop,
          graphql: gql`mutation {
            scriptTagCreate(input: {
              src: "https://www.dwin1.com/19038.js",
              displayScope: ONLINE_STORE
            }) {
              scriptTag {
                displayScope
                id
                src
              }
            }
          }`
        })
      }),
        deduplicationTag = await fetch('https://daedalus.shareasale.com/api/graphql/', {
          method: 'POST',
          body: JSON.stringify({
            shop: props.shop,
            graphql: gql`mutation {
              scriptTagCreate(input: {
                src: "https://static.shareasale.com/json/shopify/deduplication.js",
                displayScope: ONLINE_STORE
              }) {
                scriptTag {
                  displayScope
                  id
                  src
                }
              }
            }`
          })
        }),
        trackingTag = await fetch('https://daedalus.shareasale.com/api/graphql/', {
          method: 'POST',
          body: JSON.stringify({
            shop: props.shop,
            graphql: gql`mutation {
              scriptTagCreate(input: {
                src: "${shareasaleTrackingURL}?sasmid=${merchantID}&ssmtid=19038",
                displayScope: ORDER_STATUS
              }) {
                scriptTag {
                  displayScope
                  id
                  src
                }
              }
            }`
          })
        }),
        masterTagResult = await masterTag.json(),
        trackingTagResult = await trackingTag.json();
        const enterTagsfetchBody = {
          shop: shop,
          primaryDomain: props.primaryDomain,
          merchantID: merchantID,
          masterTagShopifyID: masterTagResult.scriptTagCreate.scriptTag.id,
          trackingTagShopifyID: trackingTagResult.scriptTagCreate.scriptTag.id,
        };
      await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
        method: "POST",
        body: JSON.stringify(enterTagsfetchBody),
      });
      installationLoadingUpdate(false);
      window.location.reload();
    } else {
      alert("Please enter a valid merchant ID");
    }
  }
};
export default Start;
