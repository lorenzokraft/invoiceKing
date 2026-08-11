import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { renderToStream } from "@react-pdf/renderer";
import { authenticate } from "../shopify.server";
import { InvoiceTemplate, PackingSlipTemplate } from "../lib/pdf-templates";
import type { TemplateSettings } from "../lib/pdf-templates";
import db from "../db.server";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { logAction } from "../lib/action-log.server";

const FREE_PLAN_MONTHLY_LIMIT = 50;

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
      billingAddress: order.billingAddress,
    },
    lineItems: order.lineItems.edges.map(({ node }: any) => ({
      title: node.title,
      quantity: node.quantity,
      sku: node.sku || "",
      price: parseFloat(node.originalUnitPriceSet.shopMoney.amount).toFixed(2),
      total: parseFloat(node.originalTotalSet.shopMoney.amount).toFixed(2),
    })),
    subtotal: parseFloat(order.subtotalPriceSet.shopMoney.amount).toFixed(2),
    tax: parseFloat(order.totalTaxSet.shopMoney.amount).toFixed(2),
    shipping: parseFloat(
      order.totalShippingPriceSet?.shopMoney?.amount || "0",
    ).toFixed(2),
    paid: parseFloat(
      order.totalReceivedSet?.shopMoney?.amount || "0",
    ).toFixed(2),
    amountDue: parseFloat(
      order.totalOutstandingSet?.shopMoney?.amount || "0",
    ).toFixed(2),
    total: parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(2),
    currency: order.totalPriceSet.shopMoney.currencyCode,
    storeName: "Your Store",
  };
}

async function loadTemplateSettings(
  shop: string,
  type: string,
): Promise<TemplateSettings> {
  const template = await db.template.findFirst({
    where: { shop, type: "INVOICE" },
  });

  const config = (template?.config as any) || {};

  const defaultTitle = type === "invoice" ? "INVOICE" : "PACKING SLIP";
  const documentTitle =
    type === "invoice"
      ? config.documentTitle || defaultTitle
      : defaultTitle;

  return {
    documentTitle,
    titleColor: config.titleColor,
    documentTitleFontSize: config.documentTitleFontSize
      ? Math.min(Number(config.documentTitleFontSize), 40)
      : undefined,
    labelColor: config.labelColor,
    labelFontSize: config.labelFontSize
      ? Number(config.labelFontSize)
      : undefined,
    footerMessage: config.footerMessage,
    additionalFooterText:
      config.additionalFooterText ||
      "We truly appreciate your trust, and we'll do our best to continue to give you the service you deserve. We look forward to serving you again.",
    logoUrl: config.logoUrl || undefined,
    logoWidth: config.logoWidth ? Number(config.logoWidth) : 60,
    logoHeight: config.logoHeight ? Number(config.logoHeight) : 60,
    headerFontSize: config.headerFontSize ? Number(config.headerFontSize) : 13,
    displayOrderNo: config.displayOrderNo ?? true,
    displayOrderDate: config.displayOrderDate ?? true,
    templateStyle: config.templateStyle || "slim",
  };
}

async function checkUsageLimit(shop: string) {
  const settings = await db.shopSettings.findUnique({ where: { shop } });
  if (!settings || settings.planTier !== "FREE") {
    return { allowed: true, usage: 0, limit: 0 };
  }

  const now = new Date();
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const usage = await db.monthlyUsage.upsert({
    where: { shop_periodStart: { shop, periodStart } },
    update: {},
    create: { shop, periodStart, invoiceCount: 0 },
  });

  return {
    allowed: usage.invoiceCount < FREE_PLAN_MONTHLY_LIMIT,
    usage: usage.invoiceCount,
    limit: FREE_PLAN_MONTHLY_LIMIT,
  };
}

async function trackDocument(
  shop: string,
  orderId: string,
  orderName: string,
  type: DocumentType,
  status: DocumentStatus,
  customerName: string,
  customerEmail: string,
  currency: string,
  totalAmount: string,
) {
  const settings = await db.shopSettings.findUnique({ where: { shop } });
  const nextNumber = settings?.nextInvoiceNumber || 1;
  const prefix = settings?.invoicePrefix || "INV-";
  const documentNumber = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

  await db.document.create({
    data: {
      shop,
      type,
      status,
      number: documentNumber,
      orderId,
      orderName,
      customerName,
      customerEmail,
      currency,
      totalAmount,
      payload: {},
      sentAt: status === "SENT" ? new Date() : null,
    },
  });

  await db.shopSettings.update({
    where: { shop },
    data: { nextInvoiceNumber: nextNumber + 1 },
  });

  const now = new Date();
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  await db.monthlyUsage.upsert({
    where: { shop_periodStart: { shop, periodStart } },
    update: { invoiceCount: { increment: 1 } },
    create: { shop, periodStart, invoiceCount: 1 },
  });
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const action = params.action;
  const url = new URL(request.url);
  let orderId = url.searchParams.get("id") || url.searchParams.get("orderId");
  const type = url.searchParams.get("type");
  const shop = url.searchParams.get("shop") || session.shop;

  if (!orderId || !type || !action) {
    return new Response("Missing parameters", { status: 400 });
  }

  const usageCheck = await checkUsageLimit(shop);
  if (!usageCheck.allowed) {
    return new Response(
      `<html><body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1>Monthly Limit Reached</h1>
        <p>You've used ${usageCheck.usage} of ${usageCheck.limit} free invoices this month.</p>
        <p><a href="/app/plans" style="color: #008060; text-decoration: none; font-weight: bold;">Upgrade your plan</a> for unlimited invoices.</p>
      </body></html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  if (!orderId.startsWith("gid://")) {
    orderId = `gid://shopify/Order/${orderId}`;
  }

  const orderData = await fetchOrderData(admin, orderId);

  const documentType: DocumentType =
    type === "invoice" ? "INVOICE" : "PACKING_SLIP";
  const documentStatus: DocumentStatus =
    action === "print" ? "COMPLETED" : "OPEN";

  await trackDocument(
    shop,
    orderId,
    orderData.orderNumber,
    documentType,
    documentStatus,
    orderData.customer.name,
    orderData.customer.email,
    orderData.currency,
    orderData.total,
  );

  await logAction({
    shop,
    actionType: action === "print" ? "PRINT" : action === "send" ? "SEND" : "DOWNLOAD",
    documentType,
    orderId,
    orderName: orderData.orderNumber,
  });

  const Template =
    type === "invoice" ? InvoiceTemplate : PackingSlipTemplate;
  const filename =
    type === "invoice"
      ? `invoice-${orderData.orderNumber}.pdf`
      : `packing-slip-${orderData.orderNumber}.pdf`;

  const templateSettings = await loadTemplateSettings(shop, type);
  
  console.log('[PDF Generation]', {
    shop,
    type,
    templateStyle: templateSettings.templateStyle,
    documentTitle: templateSettings.documentTitle,
    orderNumber: orderData.orderNumber,
  });

  const stream = await renderToStream(
    <Template data={orderData} settings={templateSettings} />,
  );

  if (action === "print") {
    const chunks: any[] = [];
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    const base64Pdf = pdfBuffer.toString('base64');
    
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Print ${type === "invoice" ? "Invoice" : "Packing Slip"}</title>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            #toolbar { position: fixed; top: 0; left: 0; right: 0; background: #f6f6f7; border-bottom: 1px solid #e1e3e5; padding: 12px 20px; z-index: 1000; display: flex; gap: 12px; }
            button { background: #008060; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; }
            button:hover { background: #006e52; }
            button.secondary { background: #f6f6f7; color: #202223; border: 1px solid #c9cccf; }
            button.secondary:hover { background: #e1e3e5; }
            #pdfFrame { margin-top: 60px; width: 100%; height: calc(100vh - 60px); border: none; }
            @media print {
              #toolbar { display: none; }
              #pdfFrame { margin-top: 0; height: 100vh; }
            }
          </style>
        </head>
        <body>
          <div id="toolbar">
            <button onclick="window.print()">🖨️ Print</button>
            <button class="secondary" onclick="window.history.back()">← Back to Order</button>
          </div>
          <iframe
            id="pdfFrame"
            src="data:application/pdf;base64,${base64Pdf}"
          ></iframe>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }

  const disposition = `attachment; filename="${filename}"`;

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
  let orderId = url.searchParams.get("id") || url.searchParams.get("orderId");
  const type = url.searchParams.get("type");
  const shop = url.searchParams.get("shop") || session.shop;

  if (actionType !== "send" || !orderId || type !== "invoice") {
    return new Response("Invalid action", { status: 400 });
  }

  const usageCheck = await checkUsageLimit(shop);
  if (!usageCheck.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Monthly limit reached (${usageCheck.usage}/${usageCheck.limit}). Upgrade your plan for unlimited invoices.`,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!orderId.startsWith("gid://")) {
    orderId = `gid://shopify/Order/${orderId}`;
  }

  const orderData = await fetchOrderData(admin, orderId);

  await trackDocument(
    shop,
    orderId,
    orderData.orderNumber,
    "INVOICE",
    "SENT",
    orderData.customer.name,
    orderData.customer.email,
    orderData.currency,
    orderData.total,
  );

  console.log(`Sending invoice for order ${orderData.orderNumber} to ${orderData.customer.email}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
