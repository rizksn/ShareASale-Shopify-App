import React, { useCallback, useState } from "react";
import {
    Card,
    TextField,
    Collapsible,
    TextContainer,
    Layout
} from "@shopify/polaris";
const os = require("os");
import registerFtpWebhooks from "../functions/registerFtpWebhooks";

const ftpSettings = (props) => {
    const { merchantSettings } = props;

    const [ftpUsername, ftpUsernameUpdate] = merchantSettings.shareasaleFTPUsername ? useState(merchantSettings.shareasaleFTPUsername) : useState('');
    const handleFtpUsernameChange = useCallback((value) => ftpUsernameUpdate(value), []);

    const [ftpPassword, ftpPasswordUpdate] = merchantSettings.shareasaleFTPPassword ? useState(merchantSettings.shareasaleFTPPassword) : useState('');
    const handleFtpPasswordChange = useCallback((value) => ftpPasswordUpdate(value), []);
    const [open, setOpen] = useState(false);
    const handleToggle = useCallback(() => setOpen((open) => !open), []);

    const [loading, loadingUpdate] = useState(false);

    const [ftpActive, ftpActiveUpdate] = useState(
        merchantSettings.ftpEnabled
    );

    const ftpContentStatus = ftpActive ? "Deactivate" : "Activate";

    const collapsibleContent = <Collapsible
        open={open}
        id="ftp-collapsible"
        transition={{ duration: "350ms", timingFunction: "ease-in-out" }}
        expandOnPrint
    >
        <Card.Section>
            <TextContainer>
                <p>
                    <em>
                        Note: Please <a target="_blank" href={`mailto:shareasale@shareasale.com?subject=Shopify Plugin - MID: ${merchantSettings.merchantID} - FTP Upload Account&body=Hello,%0D%0A %0D%0AI'm using ShareASale's Shopify plugin and would like to set up FTP credentials.`}>reach out to ShareASale</a> to enable this
                        feature.
                    </em>
                </p>
                <p>
                    With an FTP Upload Account, your product datafeed will automatically upload to your ShareASale account once per day, usually overnight. This is useful if your product inventory changes frequently.
                </p>
                <p>
                    The FTP username is the same as your ShareASale login, but the FTP password <strong>will be different</strong> and has to be set up by ShareASale. You can use the link above to submit the request.
                </p>
            </TextContainer>
        </Card.Section>
    </Collapsible>

    const content = ftpActive ? <TextContainer>FTP is currently <strong>active</strong> for your account</TextContainer> :
        <Layout>
            <Layout.Section oneThird>
                FTP Username:
                <TextField id="ftpUsername" value={ftpUsername} onChange={handleFtpUsernameChange} />
            </Layout.Section>
            <Layout.Section oneThird>
                FTP Password:
                <TextField id="ftpPassword" value={ftpPassword} onChange={handleFtpPasswordChange} />
            </Layout.Section>

        </Layout>;


    return (
        <Card
            sectioned
            title="FTP Account for Datafeed"
            primaryFooterAction={{
                content: ftpContentStatus,
                onAction: updateFtp,
                loading: loading,
            }}
            secondaryFooterActions={[
                {
                    content: "Learn More",
                    onAction: handleToggle,
                },
            ]}
        >
            {content}
            {collapsibleContent}
        </Card>
    );
    async function updateFtp() {
        loadingUpdate(true);
        var fetchBody = {
            shop: props.shop
        };
        if (!ftpActive) {
            fetchBody.shareasaleFTPUsername = document.getElementById("ftpUsername").value.trim() ? document.getElementById("ftpUsername").value.trim() : null;
            fetchBody.shareasaleFTPPassword = document.getElementById("ftpPassword").value.trim() ? document.getElementById("ftpPassword").value.trim() : null;
            if (fetchBody.shareasaleFTPUsername === null || fetchBody.shareasaleFTPPassword === null) {
                fetchBody.ftpEnabled = false;
                fetchBody.nextFtpRun = false;
                ftpActiveUpdate(false);
            } else {
                fetchBody.ftpEnabled = true;
                fetchBody.nextFtpRun = true;
                ftpActiveUpdate(true);
                if (!merchantSettings.ftpWebhooksRegistered) {
                    registerFtpWebhooks(props.shop);
                    fetchBody.ftpWebhooksRegistered = true
                }
            }
        } else {
            fetchBody.ftpEnabled = false;
            fetchBody.nextFtpRun = false;
            ftpActiveUpdate(false);
        }
        await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
            method: "POST",
            body: JSON.stringify(fetchBody),
        });
        loadingUpdate(false);
    }
};

export default ftpSettings;
