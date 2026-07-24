import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
} from "@shopify/ui-extensions-react/admin";

const TARGET = "admin.order-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  const { close, data } = useApi<typeof TARGET>();
  const orderId = data.selected[0]?.id;

  if (!orderId) {
    return null;
  }

  const appUrl = "https://invoice-king-production.up.railway.app";

  const handleAction = (action: string, docType: string) => {
    const url = `${appUrl}/api/documents/${action}?orderId=${encodeURIComponent(orderId)}&type=${docType}`;
    
    if (action === "print" || action === "download") {
      window.open(url, "_blank");
    } else if (action === "send") {
      // Send action - will trigger email
      fetch(url, { method: "POST" })
        .then(() => {
          close();
        })
        .catch((err) => console.error("Send failed:", err));
    }
  };

  return (
    <BlockStack>
      <AdminAction
        title="Print Invoice"
        onAction={() => handleAction("print", "invoice")}
      />
      <AdminAction
        title="Print Packing Slip"
        onAction={() => handleAction("print", "packing-slip")}
      />
      <AdminAction
        title="Download Invoice"
        onAction={() => handleAction("download", "invoice")}
      />
      <AdminAction
        title="Download Packing Slip"
        onAction={() => handleAction("download", "packing-slip")}
      />
      <AdminAction
        title="Send Invoice"
        onAction={() => handleAction("send", "invoice")}
      />
    </BlockStack>
  );
}
