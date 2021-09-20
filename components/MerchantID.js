import React, { useState, useCallback } from "react";
import { Card, Stack, TextField } from "@shopify/polaris";
import gql from "graphql-tag";
import updateTrackingTagURL from "../functions/updateTrackingTagURL";

const MerchantID = (props) => {
  const [merchantIDLoading, merchantIDLoadingUpdate] = useState(false);
  const { merchantSettings } = props;
  const [textFieldMerchantID, setTextFieldMerchantID] = useState(
    merchantSettings.merchantID
  );
  const handleMerchantIDTextFieldChange = useCallback(
    (newValue) => setTextFieldMerchantID(newValue),
    []
  );

  return (
    <Card
      title="Merchant ID:"
      actions={[
        {
          content: "Edit",
          onAction: () => {
            {
              const shareasaleMerchantID = document.getElementById(
                "shareasaleMerchantID"
              );
              shareasaleMerchantID.removeAttribute("disabled");
            }
          },
        },
      ]}
      primaryFooterAction={{
        content: "Update Merchant ID",
        loading: merchantIDLoading,
        onAction: merchantIDClicked,
      }}
    >
      <Card.Section>
        <Stack distribution="fill" wrap={false} spacing="extraLoose">
          <div>
            <p>ID number should match your ShareASale merchant ID</p>
            <br />
            <p>
              Your merchant ID is listed in the upper left corner of your
              ShareASale merchant account
            </p>
          </div>
          <div>
            <TextField
              id="shareasaleMerchantID"
              value={textFieldMerchantID.toString()}
              onChange={handleMerchantIDTextFieldChange}
              disabled
              type="number"
            />
            <br />
          </div>
        </Stack>
      </Card.Section>
    </Card>
  );
  async function merchantIDClicked() {
    merchantIDLoadingUpdate(true);
    const merchantID = document.getElementById("shareasaleMerchantID").value;
    const newTrackingUrl = updateTrackingTagURL(
      merchantSettings,
      "sasmid",
      merchantID
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
      merchantID: merchantID,
    };
    console.log('fetchBody', fetchBody);
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    const shareasaleMerchantID = document.getElementById(
      "shareasaleMerchantID"
    );
    shareasaleMerchantID.setAttribute("disabled", "");
    merchantIDLoadingUpdate(false);
  }
};

export default MerchantID;
