import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Page,
  Card,
  EmptyState,
  IndexTable,
  Badge,
  Text,
  Button,
  ButtonGroup,
  TextField,
  Pagination,
  Banner,
  Icon,
} from "@shopify/polaris";
import {
  PrintIcon,
  ImportIcon,
  EmailIcon,
  UploadIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ORDERS_QUERY } from "../graphql/orders.query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const searchQuery = url.searchParams.get("q") || "";

  try {
    const response = await admin.graphql(ORDERS_QUERY, {
      variables: {
        first: 50,
        after: cursor,
        query: searchQuery,
      },
    });

    const data = await response.json();
    const orders = data.data?.orders?.edges || [];
    const pageInfo = data.data?.orders?.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return json({ orders, pageInfo, searchQuery, error: null });
  } catch (error: any) {
    const message: string = error?.message || "Failed to load orders";
    console.error("Orders loader error:", message);

    return json({
      orders: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      searchQuery,
      error: message.includes("not approved to access")
        ? "This app needs Protected Customer Data access approval to read orders. Enable it in the Shopify dev dashboard under API access."
        : message,
    });
  }
};

export default function OrdersPage() {
  const { orders, pageInfo, error } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const rowMarkup = orders.map(
    ({ node }: any, index: number) => (
      <IndexTable.Row id={node.id} key={node.id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {node.name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {new Date(node.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div>
            <Text as="p" variant="bodyMd">
              {node.customer?.displayName || "—"}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {node.customer?.email || ""}
            </Text>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={
              node.displayFinancialStatus === "PAID"
                ? "success"
                : node.displayFinancialStatus === "PENDING"
                  ? "info"
                  : undefined
            }
          >
            {node.displayFinancialStatus || "—"}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={
              node.displayFulfillmentStatus === "FULFILLED"
                ? "success"
                : node.displayFulfillmentStatus === "UNFULFILLED"
                  ? "attention"
                  : undefined
            }
          >
            {node.displayFulfillmentStatus || "—"}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {node.totalPriceSet?.shopMoney?.currencyCode}{" "}
          {parseFloat(node.totalPriceSet?.shopMoney?.amount || "0").toFixed(2)}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Button size="slim" icon={PrintIcon}>Print</Button>
            <Button size="slim" icon={ImportIcon}>Download</Button>
            <Button size="slim" icon={EmailIcon}>Send</Button>
            <Button size="slim" icon={UploadIcon}>Upload</Button>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page fullWidth>
      <TitleBar title="Orders" />
      {error && (
        <div style={{ marginBottom: "16px" }}>
          <Banner tone="critical" title="Unable to load orders">
            <p>{error}</p>
          </Banner>
        </div>
      )}
      <Card padding="0">
        <div style={{ padding: "16px 16px 0" }}>
          <TextField
            label=""
            placeholder="Search orders"
            value={searchQuery}
            onChange={(value) => {
              const params = new URLSearchParams(searchParams);
              if (value) {
                params.set("q", value);
              } else {
                params.delete("q");
              }
              params.delete("cursor");
              setSearchParams(params);
            }}
            autoComplete="off"
            clearButton
            onClearButtonClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete("q");
              params.delete("cursor");
              setSearchParams(params);
            }}
          />
        </div>
        {orders.length === 0 ? (
          <EmptyState
            heading="No orders found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Orders will appear here with actions to print, download, send and
              upload invoices, packing slips, credit notes and return forms.
            </p>
          </EmptyState>
        ) : (
          <>
            <IndexTable
              resourceName={resourceName}
              itemCount={orders.length}
              headings={[
                { title: "Order" },
                { title: "Date" },
                { title: "Customer" },
                { title: "Payment" },
                { title: "Fulfillment" },
                { title: "Total" },
                { title: "Actions" },
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
            <div style={{ padding: "16px", display: "flex", justifyContent: "center" }}>
              <Pagination
                hasPrevious={pageInfo.hasPreviousPage}
                onPrevious={() => {
                  // Previous page logic would go here
                }}
                hasNext={pageInfo.hasNextPage}
                onNext={() => {
                  if (orders.length > 0) {
                    const lastCursor = orders[orders.length - 1].cursor;
                    const params = new URLSearchParams(searchParams);
                    params.set("cursor", lastCursor);
                    setSearchParams(params);
                  }
                }}
              />
            </div>
          </>
        )}
      </Card>
    </Page>
  );
}
