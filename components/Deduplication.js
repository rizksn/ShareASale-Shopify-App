import React, { useCallback, useState } from "react";
import {
  Card,
  Collapsible,
  Layout,
  TextContainer,
  List,
  TextStyle,
} from "@shopify/polaris";
import gql from "graphql-tag";
import updateTrackingTagURL from "../functions/updateTrackingTagURL";

const Deduplication = (props) => {
  const { merchantSettings } = props;
  const shop = props.shop;

  const [dedupesActive, dedupesActiveUpdate] = useState(
    merchantSettings.channelDeduplication
  );

  const deduplicationContentStatus = dedupesActive ? "Deactivate" : "Activate";
  const deduplicationTextStatus = dedupesActive ? "activated" : "deactivated";

  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const [loading, loadingUpdate] = useState(false);

  return (
    <Card
      sectioned
      title="Multi-network Deduplication"
      primaryFooterAction={{
        content: deduplicationContentStatus,
        onAction: updateDedupes,
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
          Multi-network deduplication is{" "}
          <TextStyle variation="strong">{deduplicationTextStatus}</TextStyle>
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
                <em>
                  Note: Please <a target="_blank" href={`mailto:shareasale@shareasale.com?subject=Shopify Plugin - MID: ${merchantSettings.merchantID} - Mulit-network Deduplication&body=Hello,%0D%0A %0D%0AI'm using ShareASale's Shopify plugin and would like to set up multi-network deduplication.`}>reach out to ShareASale</a> before enabling this
                  feature.
                </em>
              </p>
              <p>
                If you operate multiple affiliate programs on networks other
                than ShareASale, you can use this feature to ensure that the
                network with the <em>last</em> click gets credit for the sale.
                This must be activated on your ShareASale account provided that
                the following criteria are met:
              </p>
              <List>
                <List.Item>
                  <strong>
                    The other channel must be an affiliate network.
                  </strong>{" "}
                  You cannot deduplicate your affiliate program against your PPC
                  or display campaigns, or any other marketing channel outside
                  the affiliate space.
                </List.Item>
                <List.Item>
                  <strong>Deduplication must be recipricol.</strong> The other
                  network must provide some method of standing down their
                  tracking if a ShareASale affiliate drove the last click before
                  a sale.
                </List.Item>
                <List.Item>
                  <strong>
                    You may not use another method to deduplicate your
                    ShareASale tracking.{" "}
                  </strong>
                  While you may use any method necessary to deduplicate sales on
                  your other networks, the ShareASale App must handle the
                  automatic voiding of any sales that would have been attributed
                  to a ShareASale affiliate.
                </List.Item>
              </List>
            </TextContainer>
          </Card.Section>
        </Collapsible>
      </Layout>
    </Card>
  );
  async function updateDedupes() {
    loadingUpdate(true);
    // Refresh merchant's settings in case others were adjusted
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: shop }),
    });
    const refreshedSettings = await results.json();

    const newTrackingUrl = updateTrackingTagURL(
      refreshedSettings,
      "cd",
      !dedupesActive
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

    const updateValue = !dedupesActive ? true : false;
    const fetchBody = {
      shop: props.shop,
      channelDeduplication: updateValue,
    };
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    dedupesActiveUpdate(!dedupesActive);
    loadingUpdate(false);
  }
};

export default Deduplication;
