import React, { useCallback, useState } from "react";
import {
  Card,
  TextField,
  Collapsible,
  TextContainer,
  Layout,
  Select,
  Link,
  Toast,
  DataTable
} from "@shopify/polaris";


const Commissions = (props) => {
  const { merchantSettings } = props;

  const [selectedMode, selectedModeUpdate] = useState("percent");
  const handleModeChange = useCallback(
    (value) => selectedModeUpdate(value),
    []
  );


  const [skuInput, setSkuInput] = useState('');
  const handleSkuChange = useCallback((value) => setSkuInput(value), []);

  const [rateInput, setRateInput] = useState('');
  const handleRateChange = useCallback((value) => setRateInput(value), []);

  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfoToggle = useCallback(() => setInfoOpen((infoOpen) => !infoOpen), []);

  const [tableOpen, setTableOpen] = useState(false);
  const handleTableToggle = useCallback(() => setTableOpen((tableOpen) => !tableOpen), []);

  const [loading, loadingUpdate] = useState(false);

  const [skuList, skuListUpdate] = useState(merchantSettings.datafeedCustomCommissions);

  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const toastMarkup = active ? (
    <Toast content="SKU Commissions Updated" onDismiss={toggleActive} />
  ) : null;

  var ratesList = [];
  for (let x of skuList) {
    ratesList.push([x.sku, x.rate, x.isFlatRate == "1" ? 'Flat Rate' : 'Percent', <Link onClick={async () => {
      await removeSku(x.sku.trim());
      return true;
    }}>Delete</Link>])
  }

  const options = [
    { label: "Percent", value: "percent" },
    { label: "Flat Rate", value: "flat" }
  ];

  return (
    <Card
      sectioned
      title="Product-level Commissions"
      primaryFooterAction={{
        content: "Update",
        onAction: updateCommissions,
        loading: loading,
      }}
      secondaryFooterActions={[
        {
          content: "Learn More",
          onAction: handleInfoToggle,
        },
      ]}
    >
      <Layout>
        <Layout.Section oneThird>
          SKU:
          <TextField id="sku" value={skuInput} onChange={handleSkuChange} />
        </Layout.Section>
        <Layout.Section oneThird>
          Rate:
          <TextField id="rate" value={rateInput} onChange={handleRateChange} />
        </Layout.Section>
        <Layout.Section oneThird>
          <Select
            id="commissionMode"
            options={options}
            value={selectedMode}
            onChange={handleModeChange}
          />
        </Layout.Section>
        <Layout.Section>
          <Link onClick={handleTableToggle}>Show/Hide Table</Link>
          <Collapsible
            open={tableOpen}
            id="table-collapsible"
            transition={{ duration: "350ms", timingFunction: "ease-in-out" }}
            expandOnPrint
          >
            <DataTable
              columnContentTypes={[
                'text',
                'numeric',
                'text'
              ]}
              headings={[
                'SKU',
                'Rate',
                'Percent or Flat Rate'
              ]}
              rows={ratesList}
            />
          </Collapsible>
        </Layout.Section>

        <Collapsible
          open={infoOpen}
          id="info-collapsible"
          transition={{ duration: "350ms", timingFunction: "ease-in-out" }}
          expandOnPrint
        >
          <Card.Section>
            <TextContainer>
              <p>
                <em>
                  Note: Please <a target="_blank" href={`mailto:shareasale@shareasale.com?subject=Shopify Plugin - MID: ${merchantSettings.merchantID} - Product-level Commissions&body=Hello,%0D%0A %0D%0AI'm using ShareASale's Shopify plugin and would like to activate Product-level commissions.`}>reach out to ShareASale</a> to enable this
                  feature.
                </em>
              </p>
              <p>
                If you have any products that you would like to assign a specific commission rate for,
                you can set these here. This rate can either be a <strong>percentage</strong> or a <strong>flat rate</strong>,
                depending on what you choose from the drop menu.
              </p>
              <p>
                The rate you set here will override the base rate in your ShareASale account. <strong>However, </strong>
                if you set any <strong>commission rules</strong> in your ShareASale account, those rules will override the
                rates that you set here. If you're setting up a complex commission structure, please reach out to our
                client services team to discuss the best way to configure the rates.
              </p>
              <p>
                In order for these rates to take effect, ShareASale must activate this feature. Then, visit the Datafeed tab above and download your datafeed.
                After downloading the file, you may then upload it to your ShareASale account.
              </p>
            </TextContainer>
          </Card.Section>
        </Collapsible>
      </Layout>
      {toastMarkup}
    </Card>
  );
  async function removeSku(sku) {
    var currentList = merchantSettings.datafeedCustomCommissions,
      index = 0,
      deletedCount = 0;
    for (let x of currentList) {
      if (x.sku === sku) {
        currentList.splice(index, 1);
        deletedCount++;
      } else {
        index++;
      }
    }
    if (index > currentList.length) {
      return { deletedCount: deletedCount }
    }
    loadingUpdate(true);
    const fetchBody = {
      shop: props.shop,
      nextFtpRun: true,
      datafeedCustomCommissions: currentList
    };
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    loadingUpdate(false);
    return { deletedCount: deletedCount }
  }
  async function updateCommissions() {
    let commissionMode = document.getElementById("commissionMode").value,
      commissionRate = document.getElementById("rate").value.trim(),
      sku = document.getElementById("sku").value.trim(),
      currentList = merchantSettings.datafeedCustomCommissions;
    if (!sku) { return false }
    await removeSku(sku);
    if (commissionRate) {
      currentList.push({
        sku: sku,
        rate: commissionRate,
        isFlatRate: commissionMode === "flat" ? "1" : "0"
      })
    }
    loadingUpdate(true);
    const fetchBody = {
      shop: props.shop,
      nextFtpRun: true,
      datafeedCustomCommissions: currentList
    };
    await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(fetchBody),
    });
    setSkuInput('');
    setRateInput('');
    loadingUpdate(false);
    setActive(true);
  }
};

export default Commissions;
