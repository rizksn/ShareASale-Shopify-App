import React, { useState } from "react";
import { Page, Layout, Spinner } from "@shopify/polaris";
import APICredentials from "./APICredentials";
import APISettings from "./APISettings";
const os = require("os");

const APICenter = (props) => {
  // API credential states
  const [apiEnabled, apiEnabledChange] = useState("");
  const [settingsLoading, settingsLoadingChange] = useState(true);

  const [checkedCredentials, checkedCredentialsSwitch] = useState(false);
  const [checkedSettings, checkedSettingsSwitch] = useState(false);

  const [voidsSubscriptionID, setVoidsSubscriptionID] = useState("");
  const [recurringSubscriptionID, setRecurringSubscriptionID] = useState("");

  const [recurringActive, setRecurringActive] = useState(false);
  const [voidsActive, setVoidsActive] = useState(false);

  // Look to see if credentials have already been tested
  // to prevent superfluous calls on re-render. Otherwise, test
  // the credentials (if any) that are stored in the DB
  if (!checkedCredentials) {
    let prefetchBody = {
      shop: props.shop,
      apiToken: null,
      apiSecret: null,
      useDBCredentials: true,
    };
    fetch(`https://${os.hostname()}/api/validate/`, {
      method: "POST",
      body: JSON.stringify(prefetchBody),
    })
      .then((x) => {
        return x.text();
      })
      .then((x) => {
        checkedCredentialsSwitch(true);
        if (x.includes("Transaction Not Found")) {
          apiEnabledChange(true);
        } else if (x.includes("Error Code 4004")) {
          alert("Too many concurrent requests");
        } else {
          apiEnabledChange(false);
        }
      });
  }
  // While we wait for the response from ShareASale, return a spinner
  if (apiEnabled === "") {
    return (
      <Page>
        <Layout>
          <Spinner />
        </Layout>
      </Page>
    );
  }
  // If we don't have the correct credentials, then show config page
  if (!apiEnabled) {
    return (
      <APICredentials
        checkedCredentialsSwitch={checkedCredentialsSwitch}
        shop={props.shop}
      />
    );
  }
  // If we currently have the correct credentials in the DB,
  // display the options for the API. First, check to see which
  // API options are enabled
  if (!checkedSettings) {
    fetch(`https://${os.hostname()}/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: props.shop }),
    })
      .then((x) => {
        return x.json();
      })
      .then((x) => {
        checkedSettingsSwitch(true);
        settingsLoadingChange(false);
        if (x.recurringCommissionsWebhookID) {
          setRecurringActive(true);
          setRecurringSubscriptionID(x.recurringCommissionsWebhookID);
        }
        if (x.autoReconciliationWebhookID) {
          setVoidsActive(true);
          setVoidsSubscriptionID(x.autoReconciliationWebhookID);
        }
      });
  }

  if (settingsLoading) {
    return (
      <Page>
        <Layout>
          <Spinner />
        </Layout>
      </Page>
    );
  }

  if (apiEnabled) {
    return (
      <APISettings
        voidsSubscriptionID={voidsSubscriptionID}
        recurringSubscriptionID={recurringSubscriptionID}
        voidsActive={voidsActive}
        setVoidsActive={setVoidsActive}
        recurringActive={recurringActive}
        setRecurringActive={setRecurringActive}
        checkedSettingsSwitch={checkedSettingsSwitch}
        shop={props.shop}
      />
    );
  }
};

export default APICenter;
