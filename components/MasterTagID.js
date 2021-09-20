import React, { useState, useCallback } from "react";
import { Card, Stack, TextField, InlineError } from "@shopify/polaris";
import gql from "graphql-tag";
import updateTrackingTagURL from "../functions/updateTrackingTagURL";

const MasterTagID = (props) => {
  const [errorMessage, errorMessageUpdate] = useState("");
  const [masterTagLoading, masterTagLoadingUpdate] = useState(false);
  const { merchantSettings } = props;
  const content =
    merchantSettings.masterTagID == "19038"
      ? "Your Master Tag is not configured for plugins."
      : "Your Master Tag is configured to work with publisher plugins.";
  const [masterTagContent, masterTagContentUpdate] = useState(content);
  const [textFieldMasterTagID, setTextFieldMasterTagID] = useState(
    merchantSettings.masterTagID
  );

  const handleMasterTagIDChange = useCallback(
    (newValue) => setTextFieldMasterTagID(newValue),
    []
  );

  return (
    <Card
      title="Master Tag ID:"
      actions={[
        {
          content: "Edit",
          onAction: () => {
            {
              const shareasaleMasterTagID = document.getElementById(
                "masterTagID"
              );
              shareasaleMasterTagID.removeAttribute("disabled");
            }
          },
        },
      ]}
      primaryFooterAction={{
        content: "Update Master Tag ID",
        loading: masterTagLoading,
        onAction: masterTagClicked,
      }}
    >
      <Card.Section>
        <Stack distribution="fill" wrap={false} spacing="extraLoose">
          <p>{masterTagContent}</p>
          <div>
            <TextField
              id="masterTagID"
              name="masterTagID"
              value={textFieldMasterTagID.toString()}
              onChange={handleMasterTagIDChange}
              disabled
              type="number"
            ></TextField>
          </div>
        </Stack>
        <InlineError message={errorMessage} fieldID="masterTagID" />
      </Card.Section>
    </Card>
  );
  async function masterTagClicked() {
    const shareasaleMasterTagID = document.getElementById("masterTagID");
    const newMasterTagID = document.getElementById("masterTagID").value;
    masterTagLoadingUpdate(true);
    // Load the content of the new master tag, then check to see if it contains
    // references to ShareASale. If it does, then it's a valid master tag
    const newMasterTag = await fetch(
      `https://www.dwin1.com/${newMasterTagID}.js`
    ),
      newMasterTagContent = await newMasterTag.text();
    if (newMasterTagContent.includes("shareasale")) {
      // Rebuild tracking script parameters
      const newTrackingUrl = updateTrackingTagURL(
        merchantSettings,
        "ssmtid",
        newMasterTagID
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
      // Update Master Tag
      await fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: props.shop,
          graphql: gql`mutation {
            scriptTagUpdate(id: "${merchantSettings.masterTagShopifyID}",
              input: {
                src: "https://www.dwin1.com/${newMasterTagID}.js"
              }) {
              userErrors {
                field
                message
              }
            }
          }`
        })
      });
      // Update ID Number in MongoDB
      const fetchBody = {
        shop: props.shop,
        masterTagID: newMasterTagID,
      };
      await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
        method: "POST",
        body: JSON.stringify(fetchBody),
      });
      shareasaleMasterTagID.setAttribute("disabled", "");
      merchantSettings.masterTagID = newMasterTagID;
      newMasterTagID == "19038"
        ? masterTagContentUpdate(
          "Your Master Tag is not configured for plugins."
        )
        : masterTagContentUpdate(
          "Your Master Tag is configured to work with publisher plugins."
        );
      masterTagLoadingUpdate(false);
      errorMessageUpdate("");
    } else {
      setTextFieldMasterTagID(merchantSettings.masterTagID);
      shareasaleMasterTagID.setAttribute("disabled", "");
      masterTagLoadingUpdate(false);
      errorMessageUpdate(
        "Invalid Master Tag ID. Please reach out to ShareASale before editing this field."
      );
    }
  }
};

export default MasterTagID;
