import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Button, InlineStack, BlockStack, Text } from "@shopify/polaris";
import { PrintIcon, ImportIcon, EmailIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

const ORDER_QUERY = `#graphql
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      name
      createdAt
      totalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      subtotalPriceSet {
        shopMoney {
          amount
        }
      }
      totalTaxSet {
        shopMoney {
          amount
        }
      }
      totalShippingPriceSet {
        shopMoney {
          amount
        }
      }
      customer {
        displayName
        email
      }
      shippingAddress {
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      billingAddress {
        address1
        address2
        city
        province
        zip
        country
      }
      lineItems(first: 100) {
        edges {
          node {
            title
            quantity
            sku
            originalUnitPriceSet {
              shopMoney {
                amount
              }
            }
            originalTotalSet {
              shopMoney {
                amount
              }
            }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const orderId = params.orderId;

  if (!orderId) {
    throw new Response("Order ID required", { status: 400 });
  }

  const response = await admin.graphql(ORDER_QUERY, {
    variables: { id: orderId },
  });

  const data = await response.json();
  const order = data.data?.order;

  if (!order) {
    throw new Response("Order not found", { status: 404 });
  }

  return json({
    order,
    shop: session.shop,
  });
};

export default function InvoiceViewPage() {
  const { order, shop } = useLoaderData<typeof loader>();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const url = `/api/documents/download?type=invoice&orderId=${encodeURIComponent(order.id)}&shop=${encodeURIComponent(shop)}`;
    window.open(url, "_blank");
  };

  const handleSend = async () => {
    const url = `/api/documents/send?type=invoice&orderId=${encodeURIComponent(order.id)}&shop=${encodeURIComponent(shop)}`;
    try {
      const response = await fetch(url, { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        shopify.toast.show("Invoice sent successfully");
      } else {
        shopify.toast.show(data.error || "Failed to send invoice");
      }
    } catch (err) {
      shopify.toast.show("Failed to send invoice");
    }
  };

  const lineItems = order.lineItems.edges.map(({ node }: any) => ({
    title: node.title,
    quantity: node.quantity,
    sku: node.sku || "—",
    price: parseFloat(node.originalUnitPriceSet.shopMoney.amount).toFixed(2),
    total: parseFloat(node.originalTotalSet.shopMoney.amount).toFixed(2),
  }));

  const subtotal = parseFloat(order.subtotalPriceSet.shopMoney.amount).toFixed(2);
  const tax = parseFloat(order.totalTaxSet.shopMoney.amount).toFixed(2);
  const shipping = parseFloat(order.totalShippingPriceSet.shopMoney.amount).toFixed(2);
  const total = parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(2);
  const currency = order.totalPriceSet.shopMoney.currencyCode;

  return (
    <Page fullWidth>
      <TitleBar title={`Invoice - ${order.name}`} />
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200">
              <Button icon={PrintIcon} onClick={handlePrint}>
                Print
              </Button>
              <Button icon={ImportIcon} onClick={handleDownload}>
                Download
              </Button>
              <Button icon={EmailIcon} onClick={handleSend}>
                Send
              </Button>
            </InlineStack>
          </InlineStack>

          <div
            style={{
              border: "1px solid #e1e3e5",
              borderRadius: "8px",
              padding: "40px",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "40px",
                }}
              >
                <div>
                  <Text as="h1" variant="heading2xl">
                    INVOICE
                  </Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      border: "2px solid #000",
                      padding: "8px 16px",
                      marginBottom: "8px",
                    }}
                  >
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      ORDER NO
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {order.name}
                    </Text>
                  </div>
                  <div style={{ border: "2px solid #000", padding: "8px 16px" }}>
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      ORDER DATE
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "20px",
                  marginBottom: "40px",
                }}
              >
                <div>
                  <Text as="p" variant="headingSm" fontWeight="bold">
                    SHIPPING ADDRESS
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {order.customer?.displayName || "Guest"}
                  </Text>
                  {order.shippingAddress && (
                    <>
                      <Text as="p" variant="bodyMd">
                        {order.shippingAddress.address1}
                      </Text>
                      {order.shippingAddress.address2 && (
                        <Text as="p" variant="bodyMd">
                          {order.shippingAddress.address2}
                        </Text>
                      )}
                      <Text as="p" variant="bodyMd">
                        {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                        {order.shippingAddress.zip}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {order.shippingAddress.country}
                      </Text>
                    </>
                  )}
                </div>

                <div>
                  <Text as="p" variant="headingSm" fontWeight="bold">
                    BILLING ADDRESS
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {order.customer?.displayName || "Guest"}
                  </Text>
                  {order.billingAddress && (
                    <>
                      <Text as="p" variant="bodyMd">
                        {order.billingAddress.address1}
                      </Text>
                      {order.billingAddress.address2 && (
                        <Text as="p" variant="bodyMd">
                          {order.billingAddress.address2}
                        </Text>
                      )}
                      <Text as="p" variant="bodyMd">
                        {order.billingAddress.city}, {order.billingAddress.province}{" "}
                        {order.billingAddress.zip}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {order.billingAddress.country}
                      </Text>
                    </>
                  )}
                </div>

                <div>
                  <Text as="p" variant="headingSm" fontWeight="bold">
                    CUSTOMER ADDRESS
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {order.customer?.displayName || "Guest"}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {order.customer?.email || ""}
                  </Text>
                </div>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>TITLE</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>SKU</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>QTY</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>UNIT PRICE</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item: any, index: number) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e1e3e5" }}>
                      <td style={{ padding: "12px" }}>{item.title}</td>
                      <td style={{ padding: "12px" }}>{item.sku}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {currency} {item.price}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {currency} {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: "right", marginBottom: "40px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    SUB TOTAL :{" "}
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {currency} {subtotal}
                  </Text>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    SHIPPING :{" "}
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {currency} {shipping}
                  </Text>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    TAX :{" "}
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {currency} {tax}
                  </Text>
                </div>
                <div
                  style={{
                    borderTop: "2px solid #000",
                    paddingTop: "8px",
                    marginTop: "8px",
                  }}
                >
                  <Text as="span" variant="headingMd" fontWeight="bold">
                    TOTAL :{" "}
                  </Text>
                  <Text as="span" variant="headingMd" fontWeight="bold">
                    {currency} {total}
                  </Text>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Text as="p" variant="headingSm" fontWeight="bold">
                  Thanks for your business...
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  We truly appreciate your trust, and we'll do our best to continue to give you
                  the service you deserve. We look forward to serving you again.
                </Text>
              </div>
            </div>
          </div>
        </BlockStack>
      </Card>
    </Page>
  );
}
