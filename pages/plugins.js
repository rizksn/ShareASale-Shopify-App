import React, { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Link,
  Thumbnail,
  Button,
  Stack,
  Spinner,
  InlineError
} from "@shopify/polaris";
const os = require("os");


const Plugins = (props) => {
  const [settingsLoading, settingsLoadingSwitch] = useState(true);
  const [checkedSettings, checkedSettingsSwitch] = useState(false);
  const [merchantSettings, merchantSettingsUpdate] = useState({});
  if (!checkedSettings) {
    getSettings(props.MyshopifyDomain);
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
  const moreInfoMessage =
    merchantSettings.masterTagID != 19038
      ? `Good news! You're all set up and ready to activate any of the plugins below. Check out their websites to learn more about the services they provide. If you'd like to work with any of them, just hit the "Inquire" button to send us an email and we'll get the ball rolling!`
      : `If you'd like to work with any of the below services, click the "Inquire" button next to the one you're interested in. You do not currently have a custom Master Tag ID, so the ShareASale Integrations team will need to set one up for you. You can then enter the new Master Tag ID on the Dashboard page of this app.`;
  return (
    <Page
      title="Featured Plug-ins"
      subtitle="The Advertiser MasterTag gives you quick and easy access to innovative tools from the Awin Group and its technology partners. It works as a customizable container tag, so there's no need for any additional technical integration."
    >
      <style>
        {`
        .Polaris-Card {
            height: 100%
        }
        `}
      </style>
      <Layout>
        <Layout.Section>
          <p>{moreInfoMessage}</p>
        </Layout.Section>
        <div style={{ display: "flex" }}>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://singleview.media/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/singleview.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Singleview plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the SingleView plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://singleview.media/">
                <strong>SingleView</strong>
              </Link>
              <p>
                SingleView's multi-touch attribution SaaS platform provides
                data-driven performance metrics across all digital channels,
                supporting the optimization of digital spend and campaign
                activity both within and across channels. Consumable insights,
                delivered on a daily basis, drives action to maximize and
                accelerate results against business goals and objectives.
              </p>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://smarterclick.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/smarterclick.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in SmarterClick plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the SmarterClick plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://smarterclick.com/">
                <strong>SmarterClick</strong>
              </Link>
              <p>
                We turn unknown visitors into familiar faces, creating lasting,
                loyal relationships. By understanding buying habits, we’re able
                to preempt user behavior through our set of dynamic engagement
                tools, creating personalized experiences for your customers at
                all stages of their journeys.
              </p>
            </Card>
          </Layout.Section>
        </div>
        <div style={{ display: "flex" }}>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://www.uniqodo.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/uniqodo.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Uniqodo plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Uniqodo plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://www.uniqodo.com/">
                <strong>Uniqodo</strong>
              </Link>
              <p>
                Upgrade any e-commerce platform with Uniqodo’s Promotion Engine
                and advance the way you market and message to your audience
                using coupon codes.
              </p>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://www.revlifter.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/revlifter.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Revlifter plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Revlifter plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://www.revlifter.com/">
                <strong>Revlifter</strong>
              </Link>
              <p>
                Personalized incentivization has the potential to deliver
                amazing results. Mass, untargeted campaigns only add pressure to
                your margins while ignoring who your customers really are.
                RevLifter matches strong, enticing offers with your goals and
                customers. We are setting new benchmarks by personalizing every
                aspect of the user journey.
              </p>
            </Card>
          </Layout.Section>
        </div>
        <div style={{ display: "flex" }}>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://www.increasingly.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/increasingly.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Increasingly plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Increasingly plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://www.increasingly.com/">
                <strong>Increasingly</strong>
              </Link>
              <p>
                Increasingly is an AI-powered, cross-sell platform. Since 2016,
                we have been working to reinvent cross-selling. We've taken
                inspiration from Amazon bundling and built on that idea. Today
                we are the world's leading cross-selling technology that
                ambitious and intelligent retailers choose. As a team, we are an
                incredible mix of e-commerce experts, developers, data
                scientists and machine learning engineers.
              </p>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://us.upsellit.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/upsellit.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Upsellit plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Upsellit plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://us.upsellit.com/">
                <strong>Upsellit</strong>
              </Link>
              <p>
                We believe that every site visitor has the potential to become a
                customer. Each shopper has their own set of motivations,
                tendencies, and intentions that they demonstrate through
                different browsing patterns, product selections, and behaviors.
                We've made it our mission to use this ocean of data to create
                personalized solutions that resonate with shoppers to increase
                conversions, order value and customer retention.
              </p>
            </Card>
          </Layout.Section>
        </div>
        <div style={{ display: "flex" }}>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://envolvetech.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/envolve.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Envolve plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Envolve plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://envolvetech.com/">
                <strong>Envolve</strong>
              </Link>
              <p>
                Envolve has created the world's first performance marketing
                driven recommendation engine, driving increased conversions by
                offering a chat and product recommendation service within an
                affiliate marketing environment to retailers.
              </p>
            </Card>
          </Layout.Section>
          <Layout.Section oneHalf>
            <Card
              sectioned
              title={
                <Stack distribution="equalSpacing">
                  <Link external url="https://www.soreto.com/">
                    <Thumbnail source="https://amt-master-ui-logos.s3-eu-west-1.amazonaws.com/soreto.png" />
                  </Link>
                  <Link
                    external
                    url={`mailto:shareasale@shareasale.com,publishersuccess@awin.com?subject=Interest in Soreto plug-in on ShareASale Shopify App&body=Hello,%0D%0A %0D%0APlease get in touch with me about the Soreto plug-in. I'm using the ShareASale App on Shopify and my Merchant ID is ${merchantSettings.merchantID}. %0D%0A %0D%0AThank You %0D%0A%0D%0A%0D%0A`}
                  >
                    <Button>Inquire</Button>
                  </Link>
                </Stack>
              }
            >
              <Link external url="https://www.soreto.com/">
                <strong>Soreto</strong>
              </Link>
              <p>
                Harness the power of word of mouth with Soreto. Soreto is a
                referral marketing and social sharing technology that leverages
                the power of your existing customer to acquire new ones.
              </p>
            </Card>
          </Layout.Section>
        </div>
      </Layout>
    </Page>
  );
  async function getSettings(MyshopifyDomain) {
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: MyshopifyDomain }),
    });
    const resultsJSON = await results.json();
    checkedSettingsSwitch(true);
    merchantSettingsUpdate({
      merchantID: resultsJSON.merchantID,
      masterTagID: resultsJSON.masterTagID,
      trackingTagShopifyID: resultsJSON.trackingTagShopifyID,
      masterTagShopifyID: resultsJSON.masterTagShopifyID,
      storesConnectStoreID: resultsJSON.storesConnectStoreID,
      xtypeMode: resultsJSON.xtypeMode,
      xtypeValue: resultsJSON.xtypeValue,
      channelDeduplication: resultsJSON.channelDeduplication,
    });
    settingsLoadingSwitch(false);
  }
};
export default Plugins;
