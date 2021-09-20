import React, { useState, useCallback } from "react";
import {
  Layout,
  Card,
  FormLayout,
  TextField,
  PageActions,
  InlineError,
} from "@shopify/polaris";
const os = require("os");

const APICredentials = (props) => {
  const [tokenValue, setTokenValue] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const handleTokenChange = useCallback(
    (newValue) => setTokenValue(newValue),
    []
  );
  const handleKeyChange = useCallback((newValue) => setKeyValue(newValue), []);

  const [buttonState, setButtonState] = useState(false);
  const [errorValue, setErrorValue] = useState("");
  const handleErrorChange = useCallback(
    (newValue) => setErrorValue(newValue),
    []
  );
  return (
    <Card sectioned>
      <Layout>
        <Layout.AnnotatedSection
          title="API Credentials"
          description="Adding your API credentials will allow you to automate certain tasks such as voiding commissions on refunded orders. Click the API Center button to get your credentials."
        >
          <FormLayout>
            <TextField
              label="API Token"
              id="apiToken"
              onChange={handleTokenChange}
              value={tokenValue}
            />
            <TextField
              label="API Secret"
              id="apiSecret"
              onChange={handleKeyChange}
              value={keyValue}
            />
          </FormLayout>

          <PageActions
            primaryAction={{
              content: "Save",
              loading: buttonState,
              onAction: () => {
                attemptAPIcall();
              },
            }}
            secondaryActions={[
              {
                content: "ShareASale API Center",
                destructive: false,
                external: true,
                url: "https://account.shareasale.com/m-apiips.cfm",
              },
            ]}
          />
        </Layout.AnnotatedSection>
        <InlineError message={errorValue} fieldID="apiError" />
      </Layout>
    </Card>
  );
  async function attemptAPIcall() {
    setButtonState(true);
    let token = document.getElementById("apiToken").value.trim(),
      secret = document.getElementById("apiSecret").value.trim(),
      fetchBody = {
        shop: props.shop,
        apiToken: token,
        apiSecret: secret,
      };
    const results = await fetch(`https://${os.hostname()}/api/validate/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    const resultsText = await results.text();
    setButtonState(false);
    if (!resultsText.includes("Error Code")) {
      // If there wasn't an error code, store the credentials in the DB
      let editBody = {
        shop: props.shop,
        shareasaleAPIToken: token,
        shareasaleAPISecret: secret,
      };
      await fetch(`https://${os.hostname()}/api/editshop/`, {
        method: "POST",
        body: JSON.stringify(editBody),
      });
      props.checkedCredentialsSwitch(false);
    }
    if (resultsText.includes("Error Code 4001")) {
      handleErrorChange("API Token field is blank");
    }
    if (resultsText.includes("Error Code 4002")) {
      handleErrorChange(
        'In the ShareASale API Center, change "Require IP address match for all API Calls" to "Require IP address match only for version 1.1 and lower"'
      );
    }
    if (resultsText.includes("Error Code 4003")) {
      handleErrorChange(
        "Incorrect API Token. Visit the ShareASale API Center to obtain the token."
      );
    }
    if (resultsText.includes("Error Code 4031")) {
      handleErrorChange(
        "Incorrect API Secret. Visit the ShareASale API Center to obtain the API Secret."
      );
    }
  }
};

export default APICredentials;
