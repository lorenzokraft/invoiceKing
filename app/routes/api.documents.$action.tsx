import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { renderToStream } from "@react-pdf/renderer";
import { authenticate } from "../shopify.server";
import { InvoiceTemplate, PackingSlipTemplate } from "../lib/pdf-templates";

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
      }
      lineItems(first: 100) {
        edges {
          node {
            title
            quantity
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

async function fetchOrderData(admin: any, orderId: string) {
  const response = await admin.graphql(ORDER_QUERY, {
    variables: { id: orderId },
  });

  const data = await response.json();
  const order = data.data?.order;

  if (!order) {
    throw new Error("Order not found");
  }

  return {
    orderNumber: order.name,
    createdAt: order.createdAt,
    customer: {
      name: order.customer?.displayName || "Guest",
      email: order.customer?.email || "",
      shippingAddress: order.shippingAddress,
    },
    lineItems: order.lineItems.edges.map(({ node }: any) => ({
      title: node.title,
      quantity: node.quantity,
      price: parseFloat(node.originalUnitPriceSet.shopMoney.amount).toFixed(2),
      total: parseFloat(node.originalTotalSet.shopMoney.amount).toFixed(2),
    })),
    subtotal: parseFloat(order.subtotalPriceSet.shopMoney.amount).toFixed(2),
    tax: parseFloat(order.totalTaxSet.shopMoney.amount).toFixed(2),
    total: parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(2),
    currency: order.totalPriceSet.shopMoney.currencyCode,
    storeName: "Your Store",
  };
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const action = params.action;
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const type = url.searchParams.get("type");

  if (!orderId || !type || !action) {
    return new Response("Missing parameters", { status: 400 });
  }

  const orderData = await fetchOrderData(admin, orderId);

  const Template =
    type === "invoice" ? InvoiceTemplate : PackingSlipTemplate;
  const filename =
    type === "invoice"
      ? `invoice-${orderData.orderNumber}.pdf`
      : `packing-slip-${orderData.orderNumber}.pdf`;

  const stream = await renderToStream(<Template data={orderData} />);

  const disposition =
    action === "download"
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`;

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
    },
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const actionType = params.action;
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const type = url.searchParams.get("type");

  if (actionType !== "send" || !orderId || type !== "invoice") {
    return new Response("Invalid action", { status: 400 });
  }

  const orderData = await fetchOrderData(admin, orderId);

  // TODO: Send email with invoice PDF attached
  // For now, just return success
  console.log(`Sending invoice for order ${orderData.orderNumber} to ${orderData.customer.email}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
