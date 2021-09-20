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


const ExcludedSkus = (props) => {
    const { merchantSettings } = props;


    const [skuInput, setSkuInput] = useState('');
    const handleSkuChange = useCallback((value) => setSkuInput(value), []);

    const [infoOpen, setInfoOpen] = useState(false);
    const handleInfoToggle = useCallback(() => setInfoOpen((infoOpen) => !infoOpen), []);

    const [tableOpen, setTableOpen] = useState(false);
    const handleTableToggle = useCallback(() => setTableOpen((tableOpen) => !tableOpen), []);

    const [loading, loadingUpdate] = useState(false);

    const [skuList, skuListUpdate] = useState(merchantSettings.datafeedExcludedSkus);

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? (
        <Toast content="Exclusion List Updated" onDismiss={toggleActive} />
    ) : null;

    var exclusionList = [];
    for (let x of skuList) {
        exclusionList.push([x, <Link onClick={async () => {
            await removeSku(x.trim());
            return true;
        }}>Delete</Link>])
    }

    return (
        <Card
            sectioned
            title="Exclude Products From Datafeed"
            primaryFooterAction={{
                content: "Update",
                onAction: updateList,
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
                    <TextField id="excludedSku" value={skuInput} onChange={handleSkuChange} />
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
                                'text'
                            ]}
                            headings={[
                                'SKU',
                            ]}
                            rows={exclusionList}
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
                                If there are any products that you would like to have excluded from your datafeed, enter their SKUs above.
                            </p>
                            <p>
                                This simply prevents the product from appearing to your affiliates, and no link will be generated for it. It <strong>does not</strong> prevent that particular SKU
                                from tracking and awarding commissions. If you have products that are ineligible for commissions, you should instead assign commission rules in your ShareASale account
                                that set the rate for those SKUs to $0.
                            </p>
                        </TextContainer>
                    </Card.Section>
                </Collapsible>
            </Layout>
            {toastMarkup}
        </Card>
    );
    async function removeSku(sku) {
        var currentList = merchantSettings.datafeedExcludedSkus,
            index = 0,
            deletedCount = 0;
        for (let x of currentList) {
            if (x === sku) {
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
            datafeedExcludedSkus: currentList
        };
        await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
            method: "POST",
            body: JSON.stringify(fetchBody),
        });
        loadingUpdate(false);
        return { deletedCount: deletedCount }
    }
    async function updateList() {
        let sku = document.getElementById("excludedSku").value.trim(),
            currentList = merchantSettings.datafeedExcludedSkus;
        if (!sku) { return false }
        if (!currentList.includes(sku)) {
            loadingUpdate(true);
            currentList.push(sku);
            const fetchBody = {
                shop: props.shop,
                nextFtpRun: true,
                datafeedExcludedSkus: currentList
            };
            await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
                method: "POST",
                body: JSON.stringify(fetchBody),
            });
            setSkuInput('');
            loadingUpdate(false);
            setActive(true);
        }
    }
};

export default ExcludedSkus;
