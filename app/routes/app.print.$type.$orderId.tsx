import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { Page, Card, Button, InlineStack, BlockStack } from "@shopify/polaris";
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
  const type = params.type || "invoice";

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
    type,
  });
};

export default function PrintPage() {
  const { order, type } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
      <style>{`
        @media print {
          .print-toolbar { display: none !important; }
          .Polaris-Page { padding: 0 !important; }
        }
      `}</style>
      
      <div className="print-toolbar">
        <Card>
          <InlineStack gap="200">
            <Button onClick={() => window.print()}>🖨️ Print Again</Button>
            <Button onClick={() => window.close()}>Close Window</Button>
          </InlineStack>
        </Card>
      </div>

      <Card>
        <div
          style={{
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
                <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: 0 }}>
                  {type === "packing-slip" ? "PACKING SLIP" : "INVOICE"}
                </h1>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    border: "2px solid #000",
                    padding: "8px 16px",
                    marginBottom: "8px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "bold" }}>ORDER NO</p>
                  <p style={{ margin: 0 }}>{order.name}</p>
                </div>
                <div style={{ border: "2px solid #000", padding: "8px 16px" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>ORDER DATE</p>
                  <p style={{ margin: 0 }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
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
                <p style={{ fontWeight: "bold", marginBottom: "8px" }}>SHIPPING ADDRESS</p>
                <p style={{ margin: "4px 0" }}>{order.customer?.displayName || "Guest"}</p>
                {order.shippingAddress && (
                  <>
                    <p style={{ margin: "4px 0" }}>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p style={{ margin: "4px 0" }}>{order.shippingAddress.address2}</p>
                    )}
                    <p style={{ margin: "4px 0" }}>
                      {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                      {order.shippingAddress.zip}
                    </p>
                    <p style={{ margin: "4px 0" }}>{order.shippingAddress.country}</p>
                  </>
                )}
              </div>

              <div>
                <p style={{ fontWeight: "bold", marginBottom: "8px" }}>BILLING ADDRESS</p>
                <p style={{ margin: "4px 0" }}>{order.customer?.displayName || "Guest"}</p>
                {order.billingAddress && (
                  <>
                    <p style={{ margin: "4px 0" }}>{order.billingAddress.address1}</p>
                    {order.billingAddress.address2 && (
                      <p style={{ margin: "4px 0" }}>{order.billingAddress.address2}</p>
                    )}
                    <p style={{ margin: "4px 0" }}>
                      {order.billingAddress.city}, {order.billingAddress.province}{" "}
                      {order.billingAddress.zip}
                    </p>
                    <p style={{ margin: "4px 0" }}>{order.billingAddress.country}</p>
                  </>
                )}
              </div>

              <div>
                <p style={{ fontWeight: "bold", marginBottom: "8px" }}>CUSTOMER</p>
                <p style={{ margin: "4px 0" }}>{order.customer?.displayName || "Guest"}</p>
                <p style={{ margin: "4px 0" }}>{order.customer?.email || ""}</p>
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
                <span style={{ fontWeight: "bold" }}>SUB TOTAL : </span>
                <span>
                  {currency} {subtotal}
                </span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "bold" }}>SHIPPING : </span>
                <span>
                  {currency} {shipping}
                </span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "bold" }}>TAX : </span>
                <span>
                  {currency} {tax}
                </span>
              </div>
              <div
                style={{
                  borderTop: "2px solid #000",
                  paddingTop: "8px",
                  marginTop: "8px",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "18px" }}>TOTAL : </span>
                <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                  {currency} {total}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                Thanks for your business...
              </p>
              <p style={{ color: "#6d7175", margin: 0 }}>
                We truly appreciate your trust, and we'll do our best to continue to give you the
                service you deserve. We look forward to serving you again.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Page>
  );
}
