import React, { useState } from "react";
import {
  Page,
  Layout,
  EmptyState,
  Card,
  Spinner,
  InlineError,
} from "@shopify/polaris";
import { CSVLink } from "react-csv";
const os = require("os");

function Datafeed(props) {
  const [data, setData] = useState([{ dataProducts: [] }]);
  const [feedSuccess, feedSuccessUpdate] = useState(false);
  const [feedReady, feedReadyUpdate] = useState(false);
  const [feedRequested, feedRequestedUpdate] = useState(false);
  const [merchantSettings, merchantSettingsUpdate] = useState({});
  const download = "Download Datafeed";
  const csvData = [
    [
      "SKU",
      "Name",
      "URL to product",
      "Price",
      "Retail Price",
      "URL to image",
      "URL to thumbnail image",
      "Commission",
      "Category",
      "SubCategory",
      "Description",
      "Search Terms",
      "Status",
      "Merchant ID",
      "Custom 1",
      "Custom 2",
      "Custom 3",
      "Custom 4",
      "Custom 5",
      "Manufacturer",
      "PartNumber",
      "MerchantCategory",
      "MerchantSubcategory",
      "ShortDescription",
      "ISBN",
      "UPC",
      "CrossSell",
      "MerchantGroup",
      "MerchantSubgroup",
      "CompatibleWith",
      "CompareTo",
      "QuantityDiscount",
      "Bestseller",
      "AddToCartURL",
      "ReviewsRSSURL",
      "Option1",
      "Option2",
      "Option3",
      "Option4",
      "Option5",
      "customCommissions",
      "customCommissionIsFlatRate",
      "customCommissionNewCustomerMultiplier",
      "mobileURL",
      "mobileImage",
      "mobileThumbnail",
      "ReservedForFutureUse",
      "ReservedForFutureUse",
      "ReservedForFutureUse",
      "ReservedForFutureUse",
    ],
  ];

  if (!feedReady) {
    if (!feedRequested) {
      getProducts();
    }
    return (
      <Page>
        <Layout>
          <Spinner />
        </Layout>
      </Page>
    );
  }

  if (!feedSuccess) {
    return (
      <Page title="Product Datafeed">
        <Layout>
          <br />
          <Card sectioned>
            <InlineError
              message="Error downloading datafeed"
              fieldID="datafeed"
            ></InlineError>
            <br />
            <p>
              Unfortunately, we had some trouble retrieving your products. This
              usually happens if your store isn't live yet, or if a password is
              required to view your site. If this doesn't apply in your case,
              please reach out to ShareASale.
            </p>
            <br />
            <p>
              Note that a datafeed is recommended, but not mandatory. Its
              purpose is to provide your affiliates with links to your products.
              You can learn more about datafeeds on{" "}
              <a
                target="_blank"
                href="https://shareasale.atlassian.net/wiki/spaces/SAS/pages/395542579/Datafeeds"
              >
                our wiki.
              </a>
            </p>
          </Card>
        </Layout>
      </Page>
    );
  }
  return (
    <Page title="Product Datafeed" narrowWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <EmptyState
              heading="ShareASale Datafeed"
              secondaryAction={{
                content: "Learn more",
                external: true,
                url:
                  "https://shareasale.atlassian.net/wiki/spaces/SAS/pages/395542579/Datafeeds",
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                The datafeed provides your affiliates with links to your
                products.
              </p>
              <br />
              <br />
              <CSVLink
                id="CSVLink"
                data={data}
                filename={`${merchantSettings.merchantID}_shareasale_datafeed.csv`}
                style={{
                  background: "linear-gradient(to bottom, #6371c7, #5563c1)",
                  height: "100%",
                  width: "100%",
                  textDecoration: "none",
                  color: "#fff",
                  backgroundColor: "#5c6ac4",
                  position: "relative",
                  minHeight: "4.6rem",
                  minWidth: "12rem",
                  maxWidth: "18rem",
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 0,
                  padding: "0.7rem 1.6rem",
                  borderRadius: "3px",
                  boxShadow:
                    "inset 0 1px 0 0 #6774c8, 0 1px 0 0 rgb(22 29 37 / 5%), 0 0 0 0 transparent",
                }}
              >
                {download}
              </CSVLink>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
  async function getProducts() {
    try {
      const getShopData = await fetch(
        `https://daedalus.shareasale.com/api/settings/`,
        {
          method: "POST",
          body: JSON.stringify({ shop: props.MyshopifyDomain }),
        }
      );
      const shopData = await getShopData.json();
      const {
        merchantID,
        datafeedExcludedSkus,
        datafeedCustomCommissions,
        datafeedDefaultCategory,
        datafeedDefaultSubcategory,
        storesConnectStoreID,
        primaryDomain,
      } = shopData;
      if (storesConnectStoreID) {
        csvData[0].splice(19, 0, "storeID");
      }

      merchantSettingsUpdate(shopData);
      feedRequestedUpdate(true);
      const getProductData = await fetch(`${primaryDomain}/products.json`);
      const productData = await getProductData.json();
      for (let i = 0; i < productData.products.length; i++) {
        for (let j = 0; j < productData.products[i].variants.length; j++) {
          // Check to see if the merchant has opted this SKU out of feeds
          if (
            datafeedExcludedSkus.includes(
              productData.products[i].variants[j].sku
            )
          ) {
            continue;
          }
          var array = [],
            productHasCustomComission = false,
            customComissionRate = "",
            customCommissionIsFlatRate = "";
          // Check to see if there are any custom commissions to be assigned
          if (datafeedCustomCommissions) {
            // Loop through merchant's custom rates and check for a match against the current product's SKU
            for (let x of datafeedCustomCommissions) {
              // If there's a match, assign the rates to the variables
              if (x.sku === productData.products[i].variants[j].sku) {
                productHasCustomComission = true;
                customComissionRate = x.rate;
                customCommissionIsFlatRate = x.isFlatRate;
              }
            }
          }
          // SKU
          array.push(productData.products[i].variants[j].sku);
          // Name
          array.push(
            productData.products[i].title.replace(
              /\u24C7|\u2122|\u00AE|\u00A9/g,
              ""
            )
          );
          // URL to Product
          array.push(
            `${primaryDomain}/products/${productData.products[i].handle}`
          );
          // Price
          array.push(productData.products[i].variants[j].price);
          // Retail Price
          array.push("");
          // URL to Image
          productData.products[i].variants[j].featured_image == null
            ? array.push(productData.products[i].images[0]?.src) || ""
            : array.push(
                productData.products[i].variants[j].featured_image.src
              );
          // URL to Thumbnail Image
          productData.products[i].variants[j].featured_image == null
            ? array.push(productData.products[i].images[1]?.src) || ""
            : array.push(
                productData.products[i].variants[j].featured_image.src
              );
          // Commission
          array.push("");
          // Category
          array.push(datafeedDefaultCategory);
          // SubCategory
          array.push(datafeedDefaultSubcategory);
          // Description
          // Remove all HTML tags and non-accepted characters
          let productDescription =
            productData.products[i].body_html?.replace(
              /(<.*?>)|(<\/.*?>)|\u24C7|\u2122|\u00AE|\u00A9/g,
              ""
            ) || "";
          // Replace line breaks with a space
          productDescription = productDescription
            ? productDescription.replace(/\n|\r|\r\n/g, " ")
            : "";
          // Escape double quotes
          productDescription = productDescription
            ? productDescription.replace(/"/g, '""')
            : "";
          array.push(productDescription);
          // Search Terms
          array.push("");
          // Status
          array.push("");
          // MerchantID
          array.push(merchantID);
          // Custom 1
          array.push("");
          // Custom 2
          array.push("");
          // Custom 3
          array.push("");
          // Custom 4
          array.push("");
          // Custom 5
          array.push("");
          /**
           * For all items below, the first item is if the merchant has StoresConnect
           * After the "or" is the field if there is no StoresConnect ID
           */
          // Store ID or Manufacturer
          storesConnectStoreID
            ? array.push(storesConnectStoreID)
            : array.push("");
          // Manufacturer or Part Number
          array.push("");
          // Part Number or Merchant Category
          if (storesConnectStoreID || !productData.products[i].product_type) {
            array.push("");
          } else {
            array.push(productData.products[i].product_type);
          }
          // Merchant Category or Merchant Subcategory
          if (!storesConnectStoreID || !productData.products[i].product_type) {
            array.push("");
          } else {
            array.push(productData.products[i].product_type);
          }
          // Merchant Subcategory or Short Description
          array.push("");
          // Short Description or ISBN
          array.push("");
          // ISBN or UPC
          array.push("");
          // UPC or Cross Sell
          array.push("");
          // Cross Sell or Merchant Group
          array.push("");
          // Merchant Group or Merchant Sub group
          array.push("");
          // Merchant Sub group or Compatible with
          array.push("");
          // Compatible with or Compare to
          array.push("");
          // Compare to or Quantity Discount
          array.push("");
          // Quantity Discount or Best Seller
          array.push("");
          // Best Seller or Add to cart URL
          array.push("");
          // Add to cart URL or Reviews RSS URL
          array.push("");
          // Reviews RSS URL or Option 1
          if (
            storesConnectStoreID ||
            !productData.products[i].variants[j].option1
          ) {
            array.push("");
          } else {
            array.push(productData.products[i].variants[j].option1);
          }
          // Option 1 or  Option 2
          if (
            !productData.products[i].variants[j].option1 ||
            !storesConnectStoreID
          ) {
            array.push("");
          } else {
            productData.products[i].variants[j].option1
              ? array.push(productData.products[i].variants[j].option1)
              : array.push("");
          }
          // Option 2 or  Option 3
          array.push("");
          // Option 3 or  Option 4
          array.push("");
          // Option 4 or  Option 5
          array.push("");
          // Option 5 or Custom Commission
          if (storesConnectStoreID || !productHasCustomComission) {
            array.push("");
          } else {
            array.push(customComissionRate);
          }
          // Custom Commission or Custom Commission is Flat Rate
          if (!productHasCustomComission) {
            array.push("");
          } else {
            storesConnectStoreID
              ? array.push(customComissionRate)
              : array.push(customCommissionIsFlatRate);
          }
          // Custom Commission is Flat Rate or New Customer Multiplier
          if (!productHasCustomComission || !storesConnectStoreID) {
            array.push("");
          } else {
            array.push(customCommissionIsFlatRate);
          }
          // New Customer Multiplier or Mobile URL
          array.push("");
          // Mobile URL or Mobile Image
          array.push("");
          // Mobile Image or Mobile Thumbnail
          array.push("");
          // Mobile Thumbnail or RFFU 1
          array.push("");
          // RFFU 1 or RFFU 2
          array.push("");
          // RFFU 2 or RFFU 3
          array.push("");
          // RFFU 3 or RFFU 4
          array.push("");
          // RFFU 4 or RFFU 5
          array.push("");
          // RFFU 5 or nothing
          if (storesConnectStoreID) {
            array.push("");
          }
          csvData.push(array);
        }
      }
      setData(csvData);
      feedSuccessUpdate(true);
    } catch (error) {
      console.log(error);
      feedSuccessUpdate(false);
    } finally {
      feedReadyUpdate(true);
    }
  }
}

export default Datafeed;
