import React, { useCallback, useState } from "react";
import {
  Card,
  TextField,
  Collapsible,
  Layout,
  TextContainer,
  List,
} from "@shopify/polaris";
import gql from "graphql-tag";
import updateTrackingTagURL from "../functions/updateTrackingTagURL";

const StoreID = (props) => {
  const shop = props.shop;
  const [merchantSettings, merchantSettingsUpdate] = useState(props.merchantSettings);

  const [storesConnectStoreID, setStoreID] = useState(
    merchantSettings.storesConnectStoreID
  );

  const handleStoreIDChange = useCallback((value) => {
    if (value.match(/^\d*$/gi)) {
      setStoreID(value);
    }
  });

  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const [loading, loadingUpdate] = useState(false);

  return (
    <Card
      sectioned
      title="StoresConnect"
      primaryFooterAction={{
        content: "Save",
        onAction: updateStoreID,
        loading: loading,
      }}
      secondaryFooterActions={[
        {
          content: "Learn More",
          onAction: handleToggle,
        },
      ]}
    >
      <Layout>
        <Layout.Section oneThird>
          <div>
            <p>
              Unique ID for this store. <em>(Optional)</em>
            </p>
          </div>
        </Layout.Section>
        <Layout.Section oneThird>
          <div>
            <TextField
              id="storeID"
              value={storesConnectStoreID}
              onChange={handleStoreIDChange}
            />
          </div>
        </Layout.Section>
        <Collapsible
          open={open}
          id="basic-collapsible"
          transition={{ duration: "350ms", timingFunction: "ease-in-out" }}
          expandOnPrint
        >
          <Card.Section>
            <TextContainer>
              <p>
                If you have multiple, distinct stores, these can each be added
                to your ShareASale account. Each store that you add to your
                account costs an additional $200, and they must meet the
                following criteria:
              </p>
              <List type="bullet">
                <List.Item>
                  <strong>Each site must be in the same category.</strong> All
                  sites that you add will share the same affiliates. That said,
                  you cannot add one site that sells gardening products and a
                  second that sells marketing tools.
                </List.Item>
                <List.Item>
                  <strong>Additional sites must be distinct.</strong> If the
                  only difference between your websites is their region
                  (eu.mysite.com vs us.mysite.com), these are considered the{" "}
                  <em>same</em> store on ShareASale and each can be added free
                  of charge.
                </List.Item>
                <List.Item>
                  <strong>Your stores must share unified billing.</strong>{" "}
                  Because your sites will be listed on the same ShareASale
                  account, they will be charged from the same balance.
                </List.Item>
              </List>
              <p>
                If you would like to set this up, <a target="_blank" href={`mailto:shareasale@shareasale.com?subject=Shopify Plugin - MID: ${merchantSettings.merchantID} - StoresConnect&body=Hello,%0D%0A %0D%0AI'm using ShareASale's Shopify plugin and am interested in setting up StoresConnect.`}>please reach out</a> to
                ShareASale's Client Services team for more details.
              </p>
            </TextContainer>
          </Card.Section>
        </Collapsible>
      </Layout>
    </Card>
  );
  async function updateStoreID() {
    loadingUpdate(true);
    // Refresh merchant's settings in case others were adjusted
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: shop }),
    });
    const refreshedSettings = await results.json();
    const newTrackingUrl = updateTrackingTagURL(
      refreshedSettings,
      "scid",
      storesConnectStoreID
    );
    // Update tracking script
    await fetch('https://daedalus.shareasale.com/api/graphql/', {
      method: 'POST',
      body: JSON.stringify({
        shop: props.shop,
        graphql: gql`mutation {
            scriptTagUpdate(id: "${merchantSettings.trackingTagShopifyID}",
              input: {
                src: "${newTrackingUrl}"
              }) {
              userErrors {
                field
                message
              }
            }
          }`
      })
    });
    const fetchBody = {
      shop: props.shop,
      storesConnectStoreID: storesConnectStoreID || null,
    };
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    loadingUpdate(false);
  }
};

export default StoreID;
