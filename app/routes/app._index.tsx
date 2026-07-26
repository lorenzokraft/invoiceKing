import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Banner,
  DataTable,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const FREE_PLAN_MONTHLY_LIMIT = 50;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.shopSettings.upsert({
    where: { shop },
    update: {},
    create: { shop },
  });

  const now = new Date();
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const usage = await db.monthlyUsage.findUnique({
    where: { shop_periodStart: { shop, periodStart } },
  });

  const recentDocuments = await db.document.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const monthlyStats = {
    printed: recentDocuments.filter((d) => d.status === "COMPLETED").length,
    downloaded: recentDocuments.filter((d) => d.pdfUrl).length,
    sent: recentDocuments.filter((d) => d.sentAt).length,
    uploaded: 0,
  };

  const nextPeriodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return {
    shop,
    planTier: settings.planTier,
    invoicesThisMonth: usage?.invoiceCount ?? 0,
    installDate: settings.createdAt.toISOString(),
    trialEndDate: nextPeriodStart.toISOString(),
    monthlyStats,
    recentDocuments: recentDocuments.map((d) => ({
      id: d.id,
      orderName: d.orderName || "—",
      type: d.type,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    })),
  };
};

export default function Index() {
  const {
    planTier,
    invoicesThisMonth,
    installDate,
    trialEndDate,
    monthlyStats,
    recentDocuments,
  } = useLoaderData<typeof loader>();
  const isFree = planTier === "FREE";

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanFee = (tier: string) => {
    switch (tier) {
      case "FREE":
        return "Free";
      case "BASIC":
        return "$9.00/mo";
      case "PRO":
        return "$19.00/mo";
      case "PREMIUM":
        return "$49.00/mo";
      default:
        return "—";
    }
  };

  const eventRows = recentDocuments.map((doc) => [
    doc.orderName,
    doc.type === "INVOICE" ? "Invoice" : doc.type === "PACKING_SLIP" ? "Packing Slip" : doc.type,
    doc.status === "SENT" ? `Sent ${doc.type.toLowerCase()}` : `Generated ${doc.type.toLowerCase()}`,
    formatDateTime(doc.createdAt),
  ]);

  return (
    <Page fullWidth>
      <TitleBar title="Dashboard" />
      <BlockStack gap="500">
        {isFree && (
          <Banner tone="info">
            You've used {invoicesThisMonth} of {FREE_PLAN_MONTHLY_LIMIT} free
            invoices on the Free plan for this month. Your monthly limit will
            reset on {formatDate(trialEndDate)}.
          </Banner>
        )}

        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Your Current Plan
                  </Text>
                  <Text as="p" variant="headingLg">
                    {planTier.charAt(0) + planTier.slice(1).toLowerCase()}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Date of Your Installation
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(installDate)}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Monthly Fee of Your Plan
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {getPlanFee(planTier)}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Trial Period Expiration Date
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(trialEndDate)}
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section>
            <BlockStack gap="400">
              <InlineGrid columns={4} gap="400">
                <Card>
                  <BlockStack gap="400" align="center">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Monthly Printed
                    </Text>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        border: "3px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="p" variant="heading2xl">
                        {monthlyStats.printed}
                      </Text>
                    </div>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="400" align="center">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Monthly Downloaded
                    </Text>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        border: "3px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="p" variant="heading2xl">
                        {monthlyStats.downloaded}
                      </Text>
                    </div>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="400" align="center">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Monthly Sent
                    </Text>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        border: "3px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="p" variant="heading2xl">
                        {monthlyStats.sent}
                      </Text>
                    </div>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="400" align="center">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Monthly Uploaded
                    </Text>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        border: "3px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="p" variant="heading2xl">
                        {monthlyStats.uploaded}
                      </Text>
                    </div>
                  </BlockStack>
                </Card>
              </InlineGrid>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Event Logs
                  </Text>
                  {eventRows.length > 0 ? (
                    <>
                      <DataTable
                        columnContentTypes={["text", "text", "text", "text"]}
                        headings={["Order ID", "Process Type", "Description", "Log Date"]}
                        rows={eventRows}
                      />
                      <div style={{ marginTop: "12px" }}>
                        <Button>View All</Button>
                      </div>
                    </>
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No events yet. Generate your first invoice from the{" "}
                      <Link to="/app/orders">Orders</Link> page.
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
