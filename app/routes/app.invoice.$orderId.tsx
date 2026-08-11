import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { Page, Card, Button, InlineStack, BlockStack, Text } from "@shopify/polaris";
import { PrintIcon, ImportIcon, EmailIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getTemplateTheme } from "../lib/template-themes";

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
      totalReceivedSet {
        shopMoney {
          amount
        }
      }
      totalOutstandingSet {
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

  const template = await db.template.findFirst({
    where: { shop: session.shop, type: "INVOICE" },
  });

  return json({
    order,
    shop: session.shop,
    templateConfig: (template?.config as any) || {},
  });
};

export default function InvoiceViewPage() {
  const { order, shop, templateConfig } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const docType = searchParams.get("type") || "invoice";
  const documentTitle =
    docType === "packing-slip"
      ? "PACKING SLIP"
      : templateConfig?.documentTitle || "INVOICE";
  const theme = getTemplateTheme(templateConfig?.templateStyle);
  const isBanner = theme.layout === "banner" || theme.layout === "centered";
  const titleColor = templateConfig?.titleColor || theme.ink;
  const footerMessage =
    templateConfig?.footerMessage || "Thanks for your business...";
  const additionalFooterText =
    templateConfig?.additionalFooterText ||
    "We truly appreciate your trust, and we'll do our best to continue to give you the service you deserve. We look forward to serving you again.";
  const logoUrl = templateConfig?.logoUrl || "";
  const displayOrderNo = templateConfig?.displayOrderNo ?? true;
  const displayOrderDate = templateConfig?.displayOrderDate ?? true;

  useEffect(() => {
    if (searchParams.get("print") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const url = `/api/documents/download?type=invoice&orderId=${encodeURIComponent(order.id)}&shop=${encodeURIComponent(shop)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `invoice-${order.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      shopify.toast.show('Failed to download invoice');
    }
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
  const paid = parseFloat(
    order.totalReceivedSet?.shopMoney?.amount || "0",
  ).toFixed(2);
  const amountDue = parseFloat(
    order.totalOutstandingSet?.shopMoney?.amount || "0",
  ).toFixed(2);

  return (
    <Page fullWidth>
      <TitleBar title={`Invoice - ${order.name}`} />
      <Card>
        <BlockStack gap="400">
          <div className="no-print">
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
          </div>

          <div
            style={{
              padding: "40px",
              backgroundColor: "#fff",
            }}
          >
            <style>{`
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              @media print {
                .no-print { display: none !important; }
              }
            `}</style>
            <div className="invoice-print-area" style={{ maxWidth: "800px", margin: "0 auto", fontFamily: theme.fontFamily }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "40px",
                  ...(isBanner
                    ? {
                        background: theme.bannerBg,
                        color: theme.bannerInk,
                        padding: "24px 32px",
                        borderRadius: "6px",
                      }
                    : {}),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Store logo"
                      style={{
                        maxWidth: "80px",
                        maxHeight: "80px",
                        objectFit: "contain",
                        display: "block",
                        ...(isBanner ? { filter: "brightness(0) invert(1)" } : {}),
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      letterSpacing: isBanner ? "2px" : undefined,
                      color: isBanner ? theme.bannerInk : titleColor,
                    }}
                  >
                    {documentTitle}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {displayOrderNo && (
                    <div
                      style={{
                        border: `2px solid ${isBanner ? theme.bannerInk : theme.ink}`,
                        padding: "8px 16px",
                        textAlign: "right",
                        color: isBanner ? theme.bannerInk : theme.ink,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px" }}>ORDER NO</div>
                      <div style={{ fontSize: "13px" }}>{order.name}</div>
                    </div>
                  )}
                  {displayOrderDate && (
                    <div
                      style={{
                        border: `2px solid ${isBanner ? theme.bannerInk : theme.ink}`,
                        padding: "8px 16px",
                        textAlign: "right",
                        color: isBanner ? theme.bannerInk : theme.ink,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "13px" }}>ORDER DATE</div>
                      <div style={{ fontSize: "13px" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
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
                    CUSTOMER DETAILS
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
                  <tr
                    style={{
                      background: theme.headBg,
                      color: theme.headInk,
                      borderTop: theme.headBg === "#ffffff" ? `2px solid ${theme.ink}` : "none",
                      borderBottom: theme.headBg === "#ffffff" ? `2px solid ${theme.ink}` : "none",
                    }}
                  >
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
                    padding: "12px 16px",
                    marginTop: "8px",
                    ...(isBanner
                      ? {
                          background: theme.headBg,
                          color: theme.headInk,
                          borderRadius: "4px",
                        }
                      : {
                          borderTop: `2px solid ${theme.accent}`,
                          paddingTop: "8px",
                          paddingLeft: 0,
                          paddingRight: 0,
                          color: theme.accent,
                        }),
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: "18px",
                  }}
                >
                  <span>TOTAL :</span>
                  <span>{currency} {total}</span>
                </div>
              </div>

              {docType === "packing-slip" && (
                <div
                  style={{
                    display: "flex",
                    border: "1px dashed #c4c6c8",
                    marginBottom: "40px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: "14px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px dashed #c4c6c8",
                    }}
                  >
                    PAID
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "15px",
                      borderRight: "1px dashed #c4c6c8",
                    }}
                  >
                    {currency} {paid}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "14px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRight: "1px dashed #c4c6c8",
                    }}
                  >
                    AMOUNT DUE
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "15px",
                    }}
                  >
                    {currency} {amountDue}
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <Text as="p" variant="headingSm" fontWeight="bold">
                  {footerMessage}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {additionalFooterText}
                </Text>
              </div>
            </div>
          </div>
        </BlockStack>
      </Card>
    </Page>
  );
}
