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
} from "@shopify/polaris";
import {
  PrintIcon,
  ImportIcon,
  EmailIcon,
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { DRAFT_ORDERS_QUERY } from "../graphql/draft-orders.query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const searchQuery = url.searchParams.get("q") || "";

  try {
    const response = await admin.graphql(DRAFT_ORDERS_QUERY, {
      variables: {
        first: 50,
        after: cursor,
        query: searchQuery,
      },
    });

    const data = await response.json();
    const drafts = data.data?.draftOrders?.edges || [];
    const pageInfo = data.data?.draftOrders?.pageInfo || {
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return json({ drafts, pageInfo, searchQuery, error: null });
  } catch (error: any) {
    const message: string = error?.message || "Failed to load draft orders";
    console.error("Drafts loader error:", message);

    return json({
      drafts: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      searchQuery,
      error: message.includes("not approved to access")
        ? "This app needs Protected Customer Data access approval to read draft orders. Enable it in the Shopify dev dashboard under API access."
        : message,
    });
  }
};

const statusTone = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "INVOICE_SENT":
      return "info" as const;
    case "OPEN":
      return "attention" as const;
    default:
      return undefined;
  }
};

export default function DraftsPage() {
  const { drafts, pageInfo, error } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const resourceName = {
    singular: "draft order",
    plural: "draft orders",
  };

  const rowMarkup = drafts.map(({ node }: any, index: number) => (
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
        <Badge tone={statusTone(node.status)}>{node.status || "—"}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {node.totalPriceSet?.shopMoney?.currencyCode}{" "}
        {parseFloat(node.totalPriceSet?.shopMoney?.amount || "0").toFixed(2)}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <ButtonGroup>
          <Button
            size="slim"
            icon={PrintIcon}
            onClick={() => {
              const url = `/api/documents/print?type=invoice&orderId=${encodeURIComponent(node.id)}`;
              window.open(url, "_blank");
            }}
          >
            Print
          </Button>
          <Button
            size="slim"
            icon={ImportIcon}
            onClick={() => {
              const url = `/api/documents/download?type=invoice&orderId=${encodeURIComponent(node.id)}`;
              window.open(url, "_blank");
            }}
          >
            Download
          </Button>
          <Button
            size="slim"
            icon={EmailIcon}
            onClick={async () => {
              const url = `/api/documents/send?type=invoice&orderId=${encodeURIComponent(node.id)}`;
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
            }}
          >
            Send
          </Button>
        </ButtonGroup>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page fullWidth>
      <TitleBar title="Drafts" />
      {error && (
        <div style={{ marginBottom: "16px" }}>
          <Banner tone="critical" title="Unable to load draft orders">
            <p>{error}</p>
          </Banner>
        </div>
      )}
      <Card padding="0">
        <div style={{ padding: "16px 16px 0" }}>
          <TextField
            label=""
            placeholder="Search draft orders"
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
        {drafts.length === 0 ? (
          <EmptyState
            heading="No draft orders found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Draft orders will appear here with actions to print, download and
              send draft documents.
            </p>
          </EmptyState>
        ) : (
          <>
            <IndexTable
              resourceName={resourceName}
              itemCount={drafts.length}
              headings={[
                { title: "Draft" },
                { title: "Date" },
                { title: "Customer" },
                { title: "Status" },
                { title: "Total" },
                { title: "Actions" },
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
            <div
              style={{
                padding: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination
                hasPrevious={pageInfo.hasPreviousPage}
                onPrevious={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete("cursor");
                  setSearchParams(params);
                }}
                hasNext={pageInfo.hasNextPage}
                onNext={() => {
                  if (drafts.length > 0) {
                    const lastCursor = drafts[drafts.length - 1].cursor;
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
