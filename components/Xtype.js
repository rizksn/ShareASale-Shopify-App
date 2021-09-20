import React, { useCallback, useState } from "react";
import {
  Card,
  TextField,
  Collapsible,
  TextContainer,
  Layout,
  Select,
  List,
} from "@shopify/polaris";
import gql from "graphql-tag";
import updateTrackingTagURL from "../functions/updateTrackingTagURL";

const Xtype = (props) => {
  const { merchantSettings } = props;
  const shop = props.shop;
  const initialMode = merchantSettings.xtypeMode
    ? merchantSettings.xtypeMode
    : "disabled";

  const [selectedMode, selectedModeUpdate] = useState(initialMode);
  const handleModeChange = useCallback(
    (value) => selectedModeUpdate(value),
    []
  );

  const [xtype, setXtype] = useState(merchantSettings.xtypeValue);
  const handleXtypeChange = useCallback((value) => setXtype(value), []);

  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const [loading, loadingUpdate] = useState(false);

  const options = [
    { label: "Disabled", value: "disabled" },
    { label: "Static", value: "static" },
    { label: "Dynamic", value: "dynamic" },
  ];

  return (
    <Card
      sectioned
      title="Xtype Tracking"
      primaryFooterAction={{
        content: "Save",
        onAction: updateXtype,
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
          <TextField id="xtype" value={xtype} onChange={handleXtypeChange} />
        </Layout.Section>
        <Layout.Section oneThird>
          <Select
            id="xtypeMode"
            options={options}
            value={selectedMode}
            onChange={handleModeChange}
          />
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
                Any additional information that you want to add to your tracking
                pixel can be appended to ShareASale's <em>&xtype=</em>{" "}
                parameter. This value will show in your ShareASale Transaction
                Details Report, and you can create custom Commission Rules
                around the xtype value.
              </p>
              <p>
                The value you enter can either be <strong>static</strong> or
                <strong> dynamic</strong>.
              </p>
              <List type="bullet">
                <List.Item>
                  <strong>Static:</strong> the value you enter above will be
                  added to the pixel.
                </List.Item>
                <List.Item>
                  <strong>Dynamic:</strong> your programmer can define a
                  variable on the Thank You page. Enter the variable above and
                  we will add its value to the xtype parameter.
                </List.Item>
              </List>
              <p>
                How/why would this be used? Let's say you have a US site
                (www.mywebsite.com) and a European site (eu.mywebsite.com). To
                differentiate the sales that track in ShareASale, you could
                enter 'usa' or 'eu' above. This would be a <em>static</em> xtype
                value.
              </p>
              <p>
                If you wanted to award a higher commission when a V.I.P.
                customer makes a purchase, you would set up a <em>dynamic</em>{" "}
                xtype value. ShareASale wouldn't know how you, the merchant,
                define a V.I.P. customer, but your programmer could write a
                script that determines this and passes it to your xtype value.
              </p>
            </TextContainer>
          </Card.Section>
        </Collapsible>
      </Layout>
    </Card>
  );
  async function updateXtype() {
    let xtypeMode = document.getElementById("xtypeMode").value;
    loadingUpdate(true);
    // Refresh merchant's settings in case others were adjusted
    const results = await fetch(`https://daedalus.shareasale.com/api/settings/`, {
      method: "POST",
      body: JSON.stringify({ shop: shop }),
    });
    const refreshedSettings = await results.json();
    const newTrackingUrl = updateTrackingTagURL(
      refreshedSettings,
      "xtype",
      xtypeMode,
      xtype
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
      xtypeValue: xtype,
      xtypeMode: xtypeMode,
    };
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    loadingUpdate(false);
  }
};

export default Xtype;
