import React, { useState } from "react";
import { Page, Layout, Spinner, Card, InlineError } from "@shopify/polaris";
import APICenter from "../components/APICenter";
import StoreID from "../components/StoreID";
import Xtype from "../components/Xtype";
import Commissions from "../components/Commissions";
import ExcludedSkus from "../components/ExcludedSkus";
import FTP from "../components/FTP";
import Deduplication from "../components/Deduplication";


const Settings = (props) => {
  const [merchantSettings, merchantSettingsUpdate] = useState({});
  const [settingsLoading, settingsLoadingSwitch] = useState(true);
  const [checkedSettings, checkedSettingsSwitch] = useState(false);


  if (settingsLoading) {
    if (!checkedSettings) {
      getSettings();
    }
    return (
      <Page>
        <Layout>
          <Spinner />
        </Layout>
      </Page>
    );
  }
  if (!merchantSettings.merchantID) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <InlineError message="You must enter a merchant ID in the Dashboard tab before you can edit your settings." fieldID="mid" />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    )
  }
  return (
    <Page title="Settings" narrowWidth>
      <Layout>
        <Layout.Section>
          <APICenter shop={props.MyshopifyDomain} />
        </Layout.Section>
        <Layout.Section>
          <StoreID
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
            merchantSettingsUpdate={merchantSettingsUpdate}
          />
          <Xtype
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
            merchantSettingsUpdate={merchantSettingsUpdate}
          />
          <Deduplication
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
          />
          <FTP
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
          />
          <Commissions
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
          />
          <ExcludedSkus
            shop={props.MyshopifyDomain}
            merchantSettings={merchantSettings}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );

  async function getSettings() {
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: props.MyshopifyDomain }),
    });
    const resultsJSON = await results.json();
    checkedSettingsSwitch(true);
    merchantSettingsUpdate(resultsJSON);
    settingsLoadingSwitch(false);
  }
};

export default Settings;
