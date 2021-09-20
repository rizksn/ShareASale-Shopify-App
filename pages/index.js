import React, { useState, useCallback } from "react";
import { Page, Layout, Spinner } from "@shopify/polaris";
import gql from "graphql-tag";

import Start from "../components/Start";
import Dashboard from "../components/Dashboard";

const Index = (props) => {
  const [merchantSettings, merchantSettingsUpdate] = useState({});
  const [merchantPrimaryDomain, merchantPrimaryDomainUpdate] = useState('');
  const [settingsLoading, settingsLoadingSwitch] = useState(true);
  const [checkedSettings, checkedSettingsSwitch] = useState(false);
  const [trackingInstalled, trackingInstalledSwitch] = useState(false);
  const handleMerchantIDTextFieldChange = useCallback(
    (newValue) => setTextFieldMerchantID(newValue),
    []
  );
  const shopQuery = gql`
    query {
      shop {
        primaryDomain {
          id
          url
        }
      }
    }
  `;
  if (!merchantPrimaryDomain) {
    if (props.MyshopifyDomain) {
      fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: props.MyshopifyDomain,
          graphql: shopQuery
        })
      }).then(x => {
        return x.json()
      }).then(x => {
        merchantPrimaryDomainUpdate(x.shop.primaryDomain.url);
      });
    }
    return (
      <Page>
        <Layout>
          <br />
          <br />
          <Spinner />
        </Layout>
      </Page>
    );
  }

  if (!merchantPrimaryDomain || settingsLoading) {
    if (merchantPrimaryDomain && !checkedSettings) {
      getSettings();
    }
    return (
      <Page>
        <Layout>
          <br />
          <br />
          <Spinner />
        </Layout>
      </Page>
    );
  }
  // If the merchant has changed their Primary URL (the URL that customers see), then it needs to be updated
  if (merchantSettings.primaryDomain !== merchantPrimaryDomain) {
    const updateDomainfetchBody = {
      shop: props.MyshopifyDomain,
      primaryDomain: merchantPrimaryDomain
    };
    fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(updateDomainfetchBody),
    });
  }
  if (!trackingInstalled) {
    return (
      <Start
        shop={props.MyshopifyDomain}
        primaryDomain={merchantPrimaryDomain}
        handleMerchantIDTextFieldChange={handleMerchantIDTextFieldChange}
      />
    );
  } else {
    return (
      <Dashboard
        shop={props.MyshopifyDomain}
        merchantSettings={merchantSettings}
        primaryDomain={merchantPrimaryDomain}
        handleMerchantIDTextFieldChange={handleMerchantIDTextFieldChange}
      />
    );
  }
  async function getSettings() {
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: props.MyshopifyDomain }),
    });
    const resultsJSON = await results.json();
    checkedSettingsSwitch(true);
    merchantSettingsUpdate(resultsJSON);
    if (resultsJSON.merchantID) {
      trackingInstalledSwitch(true);
    }
    settingsLoadingSwitch(false);
  }
};

export default Index;
