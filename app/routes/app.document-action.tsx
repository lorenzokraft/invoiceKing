import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState, useCallback } from "react";
import { Page, Card, BlockStack, InlineStack, Text, Button, Spinner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id") || "";
  const type = url.searchParams.get("type") || "invoice";
  const mode = url.searchParams.get("mode") || "print";

  if (mode === "print" && orderId) {
    const gid = orderId.startsWith("gid://")
      ? orderId
      : `gid://shopify/Order/${orderId}`;
    const redirectParams = new URLSearchParams(url.searchParams);
    redirectParams.delete("mode");
    redirectParams.delete("id");
    redirectParams.set("print", "true");
    const invoiceUrl = `/app/invoice/${encodeURIComponent(gid)}?${redirectParams.toString()}`;
    const numericOrderId = orderId.replace(/^gid:\/\/shopify\/Order\//, "");
    const storeHandle = session.shop.replace(".myshopify.com", "");
    const orderAdminUrl = `https://admin.shopify.com/store/${storeHandle}/orders/${numericOrderId}`;
    
    return json({
      shop: session.shop,
      orderId,
      type,
      mode: "print-redirect",
      invoiceUrl,
      orderAdminUrl,
    });
  }

  return json({
    shop: session.shop,
    orderId,
    type,
    mode,
  });
};

export default function DocumentActionPage() {
  const data = useLoaderData<typeof loader>();
  const { shop, orderId, type, mode } = data;
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const storeHandle = shop.replace(".myshopify.com", "");
  const numericOrderId = orderId.replace(/^gid:\/\/shopify\/Order\//, "");
  const orderAdminUrl = `https://admin.shopify.com/store/${storeHandle}/orders/${numericOrderId}`;

  const typeLabel = type === "invoice" ? "Invoice" : type === "packing-slip" ? "Packing Slip" : type === "receipt" ? "Receipt" : "Document";

  const goBackToOrder = useCallback(() => {
    window.open(orderAdminUrl, "_top");
  }, [orderAdminUrl]);

  useEffect(() => {
    if (mode === "print-redirect") {
      const invoiceUrl = (data as any).invoiceUrl;
      const orderUrl = (data as any).orderAdminUrl;
      window.open(invoiceUrl, "_blank");
      setTimeout(() => {
        window.open(orderUrl, "_top");
      }, 500);
    }
  }, [mode, data]);

  const runAction = useCallback(async () => {
    try {
      const docType = type === "packing-slip" ? "packing-slip" : type === "receipt" ? "receipt" : "invoice";
      const apiUrl = `/api/documents/${mode}?type=${encodeURIComponent(docType)}&orderId=${encodeURIComponent(orderId)}&shop=${encodeURIComponent(shop)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to generate document (${response.status})`);
      }

      if (mode === "download") {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${type}-${numericOrderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          throw new Error(
            "Popup blocked. Please allow popups for this app, then click the button below.",
          );
        }
        printWindow.document.write(html);
        printWindow.document.close();
      }

      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Something went wrong");
    }
  }, [mode, type, orderId, shop, numericOrderId]);

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setErrorMessage("Missing order ID");
      return;
    }
    if (mode === "download") {
      runAction();
    }
  }, [orderId, mode, runAction]);

  return (
    <Page narrowWidth>
      <Card>
        <BlockStack gap="400" align="center">
          {mode === "print" && status === "loading" && (
            <BlockStack gap="400" align="center">
              <Text as="h2" variant="headingMd" alignment="center">
                Print {typeLabel}
              </Text>
              <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
                Click below to open the {typeLabel.toLowerCase()} in a new tab
                with the print dialog.
              </Text>
              <InlineStack align="center" gap="300">
                <Button variant="primary" onClick={runAction}>
                  Open Print View
                </Button>
                <Button onClick={goBackToOrder}>Back to Order</Button>
              </InlineStack>
            </BlockStack>
          )}

          {mode === "download" && status === "loading" && (
            <BlockStack gap="400" align="center">
              <InlineStack align="center">
                <Spinner size="large" />
              </InlineStack>
              <Text as="p" variant="bodyMd" alignment="center">
                Preparing your {typeLabel.toLowerCase()} download...
              </Text>
            </BlockStack>
          )}

          {status === "done" && (
            <BlockStack gap="400" align="center">
              <Text as="h2" variant="headingMd" alignment="center">
                {mode === "download"
                  ? `${typeLabel} downloaded`
                  : `${typeLabel} opened in a new tab`}
              </Text>
              <InlineStack align="center" gap="300">
                <Button variant="primary" onClick={goBackToOrder}>
                  Back to Order
                </Button>
                <Button onClick={runAction}>
                  {mode === "download" ? "Download Again" : "Open Again"}
                </Button>
              </InlineStack>
            </BlockStack>
          )}

          {status === "error" && (
            <BlockStack gap="400" align="center">
              <Text as="h2" variant="headingMd" alignment="center" tone="critical">
                Unable to complete action
              </Text>
              <Text as="p" variant="bodyMd" alignment="center" tone="subdued">
                {errorMessage}
              </Text>
              <InlineStack align="center" gap="300">
                <Button variant="primary" onClick={runAction}>
                  Try Again
                </Button>
                <Button onClick={goBackToOrder}>Back to Order</Button>
              </InlineStack>
            </BlockStack>
          )}
        </BlockStack>
      </Card>
    </Page>
  );
}
