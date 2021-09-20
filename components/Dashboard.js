import React from "react";
import { Page, Layout, Card, Link, Stack, Icon } from "@shopify/polaris";
import MerchantID from "../components/MerchantID";
import MasterTagID from "../components/MasterTagID";
import { CircleTickMajor } from "@shopify/polaris-icons";

const Dashboard = (props) => {
  return (
    <Page title="Home" narrowWidth>
      <Layout>
        <Layout.Section>
          <Card title="Tracking Code Status" sectioned>
            <Stack>
              <p>
                Your tracking is currently <strong>live.</strong>
              </p>
              <Icon source={CircleTickMajor} color="success" />
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card title="ShareASale Account" sectioned>
            <Stack>
              <Link url="https://account.shareasale.com/m-main.cfm" external>
                ShareASale Login
              </Link>

              <Link
                url="https://shareasale.atlassian.net/wiki/spaces/SAS/overview"
                external
              >
                Wiki
              </Link>
              <Link
                url={`mailto:shareasale@shareasale.com?subject=ShareASale Merchant Support - MID: ${props.merchantSettings.merchantID}`}
                external
              >
                Contact Us
              </Link>
            </Stack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <MerchantID
            shop={props.shop}
            merchantSettings={props.merchantSettings}
          />
        </Layout.Section>
        <Layout.Section>
          <MasterTagID
            shop={props.shop}
            merchantSettings={props.merchantSettings}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Dashboard;
