import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Layout,
  InlineError,
  TextStyle,
  Collapsible,
  TextContainer,
} from "@shopify/polaris";
import gql from "graphql-tag";


const APISettings = (props) => {
  const [open, setOpen] = useState(false);
  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  const [open2, setOpen2] = useState(false);
  const handleToggle2 = useCallback(() => setOpen2((open2) => !open2), []);

  // Reconciliation states
  const [voidsButtonSpinner, setVoidsButtonSpinner] = useState(false);

  const voidsContentStatus = props.voidsActive ? "Deactivate" : "Activate";
  const voidsTextStatus = props.voidsActive ? "activated" : "deactivated";
  // Recurring commission states
  const [recurringButtonSpinner, setRecurringButtonSpinner] = useState(false);

  const recurringContentStatus = props.recurringActive
    ? "Deactivate"
    : "Activate";
  const recurringTextStatus = props.recurringActive
    ? "activated"
    : "deactivated";

  const [errorValue, setErrorValue] = useState("");
  const handleErrorChange = useCallback(
    (newValue) => setErrorValue(newValue),
    []
  );
  useEffect(() => {
    if (errorValue) {
      const breakTag = document.createElement("br");
      breakTag.id = "errorBreakTag";
      document.getElementById("errorSpace").prepend(breakTag);
    } else if (document.getElementById("errorBreakTag")) {
      document.getElementById("errorBreakTag").remove();
    }
  }, [errorValue]);

  return (
    <>
      <Card
        sectioned
        title="Automatic Voiding/Editing"
        primaryFooterAction={{
          content: voidsContentStatus,
          onAction: voidsButtonClicked,
          loading: voidsButtonSpinner,
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
            Automatic commission voiding is{" "}
            <TextStyle variation="strong">{voidsTextStatus}</TextStyle>
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
                  When a customer refunds or cancels an order, you may void the
                  commission in your ShareASale account and have the money
                  returned to your balance. Activating this feature will handle
                  this process for you automatically.
                </p>
                <p>
                  Any order that is fully refunded will be voided. If an order
                  is only partially refunded, then the sale amount will be
                  edited accordingly.
                </p>
                <p>
                  Do note that all transactions lock on the 20th of the month
                  <em> following</em> when they occured. If a transaction is
                  locked, it can no longer be voided or edited. By default, you
                  will always have at least 20 days to allow for voids and
                  edits. If your return policy allows for a longer window for
                  refunds, you can reach out to ShareASale to have your lock
                  date adjusted.
                </p>
              </TextContainer>
            </Card.Section>
          </Collapsible>
        </Layout>
      </Card>

      <Card
        sectioned
        title="Recurring Commissions"
        primaryFooterAction={{
          content: recurringContentStatus,
          onAction: recurringButtonClicked,
          loading: recurringButtonSpinner,
        }}
        secondaryFooterActions={[
          {
            content: "Learn More",
            onAction: handleToggle2,
          },
        ]}
      >
        <Layout>
          <Layout.Section oneThird>
            Recurring commissions for subscription renewals is{" "}
            <TextStyle variation="strong">{recurringTextStatus}</TextStyle>
          </Layout.Section>
          <Collapsible
            open={open2}
            id="basic-collapsible2"
            transition={{ duration: "350ms", timingFunction: "ease-in-out" }}
            expandOnPrint
          >
            <Card.Section>
              <TextContainer>
                <p>
                  <strong>Note:</strong> This feature is only available for
                  Shopify merchants who installed ReCharge{" "}
                  <strong>after November 2nd, 2020</strong>, and are using
                  <strong> Recurring Billing by Recharge</strong>. If you are
                  using <em>Recharge Checkout</em> or any other subscription
                  billing platform, this feature will not function correctly.
                </p>
                <p>
                  If you are using <em>Recurring Billing by Recharge</em>, you
                  can opt to award affiliates with a commission every time a
                  subscription is renewed. A new transaction will be entered in
                  ShareASale, awarding a commission to the same affiliate that
                  drove the first transaction.
                </p>
                <p>
                  Before activating this feature, please reach out to
                  ShareASale, confirm with us that you are using the correct
                  version of Recharge, and ask to have recurring commissions
                  enabled.
                </p>
              </TextContainer>
            </Card.Section>
          </Collapsible>
        </Layout>
        <div id="errorSpace">
          <InlineError message={errorValue} fieldID="referenceError" />
        </div>
      </Card>
    </>
  );
  async function recurringButtonClicked() {
    setRecurringButtonSpinner(true);
    if (!props.recurringActive) {
      let prefetchBody = {
        shop: props.shop,
        apiToken: null,
        apiSecret: null,
        useDBCredentials: true,
        action: "reference",
      };
      var response = await fetch(`https://daedalus.shareasale.com/api/validate/`, {
          method: "POST",
          body: JSON.stringify(prefetchBody),
        }),
        responseText = await response.text();
      if (responseText === "Transaction Not Found") {
        let subscriptionID = await addWebhook("ORDERS_CREATE");
        if (subscriptionID) {
          props.setRecurringActive((recurringActive) => !recurringActive), [];
        } else {
          alert("Something went wrong");
        }
        // Open the settings check again so that the webhook subscription ID
        // can be pulled again
        props.checkedSettingsSwitch(false);
        setErrorValue("");
      } else if (responseText.includes("Error Code 4010")) {
        setErrorValue(
          "Please reach out to ShareASale before activating this feature"
        );
      }
    } else if (props.recurringActive) {
      let subscriptionID = await deleteWebhook("ORDERS_CREATE");

      if (subscriptionID) {
        props.setRecurringActive((recurringActive) => !recurringActive), [];
      } else {
        alert("Something went wrong");
      }
    }
    setRecurringButtonSpinner(false);
  }
  async function voidsButtonClicked() {
    setVoidsButtonSpinner(true);
    if (!props.voidsActive) {
      let subscriptionID = await addWebhook("ORDERS_UPDATED");
      if (subscriptionID) {
        props.setVoidsActive((voidsActive) => !voidsActive), [];
      } else {
        alert("Something went wrong");
      }
      // Open the settings check again so that the webhook subscription ID
      // can be pulled again
      props.checkedSettingsSwitch(false);
    } else if (props.voidsActive) {
      let subscriptionID = await deleteWebhook("ORDERS_UPDATED");

      if (subscriptionID) {
        props.setVoidsActive((voidsActive) => !voidsActive), [];
      } else {
        alert("Something went wrong");
      }
    }
    setVoidsButtonSpinner(false);
  }
  /**
   * Adds information to the shop listing in Mongo
   * @param {object} body Input for the shop edit
   */
  async function editShop(body) {
    const result = await fetch(`https://daedalus.shareasale.com/api/editshop/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return result;
  }
  async function addWebhook(topic) {
    const subscription = await fetch('https://daedalus.shareasale.com/api/graphql/', {
      method: 'POST',
      body: JSON.stringify({
        shop: props.shop,
        graphql: gql`mutation {
          webhookSubscriptionCreate(
            topic: ${topic}
            webhookSubscription: {
              callbackUrl: "https://daedalus.shareasale.com/api/webhooks/"
              format: JSON
            }
          ) {
            userErrors {
              field
              message
            }
            webhookSubscription {
              id
            }
          }
        }`
      })
    });
    const subscriptionResult = await subscription.json();
    if (subscriptionResult.webhookSubscriptionCreate.webhookSubscription) {
      let addSubscriptionBody = {
        shop: props.shop,
      };
      if (topic === "ORDERS_UPDATED") {
        addSubscriptionBody.autoReconciliationWebhookID =
        subscriptionResult.webhookSubscriptionCreate.webhookSubscription.id;
      }
      if (topic === "ORDERS_CREATE") {
        addSubscriptionBody.recurringCommissionsWebhookID =
        subscriptionResult.webhookSubscriptionCreate.webhookSubscription.id;
      }
      await editShop(addSubscriptionBody);
    }
    return subscriptionResult.webhookSubscriptionCreate.webhookSubscription?.id;
  }

  async function deleteWebhook(topic) {
    let deleteSubscriptionBody = {
        shop: props.shop,
      },
      webhookId = topic === "ORDERS_UPDATED" ? props.voidsSubscriptionID : props.recurringSubscriptionID;
      const subscription = await fetch('https://daedalus.shareasale.com/api/graphql/', {
        method: 'POST',
        body: JSON.stringify({
          shop: props.shop,
          graphql: gql`mutation {
            webhookSubscriptionDelete(id: "${webhookId}") {
              userErrors {
                field
                message
              }
              deletedWebhookSubscriptionId
            }
          }`
        })
      });
      const subscriptionResult = await subscription.json()
    if (topic === "ORDERS_UPDATED") {
      deleteSubscriptionBody.autoReconciliationWebhookID = null;
    }
    if (topic === "ORDERS_CREATE") {
      deleteSubscriptionBody.recurringCommissionsWebhookID = null;
    }
    if (
      subscriptionResult.webhookSubscriptionDelete.deletedWebhookSubscriptionId
    ) {
      await editShop(deleteSubscriptionBody);
    }
    return subscriptionResult.webhookSubscriptionDelete
      .deletedWebhookSubscriptionId;
  }
};

export default APISettings;
