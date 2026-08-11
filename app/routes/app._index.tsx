import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
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

  // Real per-shop monthly stats from ActionLog
  const monthLogs = await db.actionLog.findMany({
    where: { shop, createdAt: { gte: periodStart } },
    orderBy: { createdAt: "desc" },
  });

  const monthlyStats = {
    printed: monthLogs.filter((l) => l.actionType === "PRINT").length,
    downloaded: monthLogs.filter((l) => l.actionType === "DOWNLOAD").length,
    sent: monthLogs.filter((l) => l.actionType === "SEND").length,
    uploaded: monthLogs.filter((l) => l.actionType === "UPLOAD").length,
  };

  // Daily printed counts for the bar chart (current month)
  const daysInMonth = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    0,
  ).getDate();
  const dailyPrinted: number[] = Array(daysInMonth).fill(0);
  const dailyDownloaded: number[] = Array(daysInMonth).fill(0);
  const dailySent: number[] = Array(daysInMonth).fill(0);
  for (const log of monthLogs) {
    const day = new Date(log.createdAt).getUTCDate() - 1;
    if (log.actionType === "PRINT") dailyPrinted[day]++;
    else if (log.actionType === "DOWNLOAD") dailyDownloaded[day]++;
    else if (log.actionType === "SEND") dailySent[day]++;
  }

  const recentLogs = await db.actionLog.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

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
    dailyPrinted,
    dailyDownloaded,
    dailySent,
    currentMonth: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      orderName: l.orderName || "—",
      actionType: l.actionType,
      documentType: l.documentType,
      createdAt: l.createdAt.toISOString(),
    })),
  };
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <BlockStack gap="300" align="center">
        <div
          style={{
            background: "#f6f6f7",
            border: "1px solid #e1e3e5",
            borderRadius: "8px",
            padding: "8px 16px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <Text as="h3" variant="headingSm">
            {label}
          </Text>
        </div>
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <Text as="p" variant="heading2xl">
            {value}
          </Text>
        </div>
      </BlockStack>
    </Card>
  );
}

function ActionBadge({ actionType, documentType }: { actionType: string; documentType: string }) {
  const docLabel = documentType === "PACKING_SLIP" ? "Packing Slip" : "Invoice";
  const colors: Record<string, { bg: string; ink: string }> = {
    PRINT: { bg: "#fcf1cd", ink: "#5e4200" },
    DOWNLOAD: { bg: "#cce7f5", ink: "#00527c" },
    SEND: { bg: "#cdefd9", ink: "#0e5c33" },
    UPLOAD: { bg: "#e4dbf7", ink: "#4a2e8f" },
  };
  const c = colors[actionType] || colors.PRINT;
  const verb =
    actionType === "PRINT"
      ? "Print"
      : actionType === "DOWNLOAD"
        ? "Download"
        : actionType === "SEND"
          ? "Send"
          : "Upload";
  return (
    <span
      style={{
        background: c.bg,
        color: c.ink,
        padding: "2px 10px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {verb} {docLabel}
    </span>
  );
}

function BarChart({
  data,
  label,
  month,
}: {
  data: number[];
  label: string;
  month: string;
}) {
  const max = Math.max(...data, 5);
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ width: "14px", height: "14px", background: "#8a9bab", borderRadius: "2px" }} />
        <Text as="span" variant="bodySm" tone="subdued">
          {label} — {month}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "4px",
          height: "220px",
          padding: "0 8px",
        }}
      >
        {data.map((count, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "100%",
            }}
            title={`Day ${i + 1}: ${count}`}
          >
            {count > 0 && (
              <span style={{ fontSize: "10px", color: "#6d7175", marginBottom: "2px" }}>
                {count}
              </span>
            )}
            <div
              style={{
                width: "100%",
                maxWidth: "22px",
                height: `${Math.max((count / max) * 180, count > 0 ? 4 : 2)}px`,
                background: count > 0 ? "#8a9bab" : "#e1e3e5",
                borderRadius: "2px 2px 0 0",
                transition: "height 0.2s",
              }}
            />
            <span style={{ fontSize: "9px", color: "#8c9196", marginTop: "4px" }}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const {
    planTier,
    invoicesThisMonth,
    installDate,
    trialEndDate,
    monthlyStats,
    dailyPrinted,
    dailyDownloaded,
    dailySent,
    currentMonth,
    recentLogs,
  } = useLoaderData<typeof loader>();
  const isFree = planTier === "FREE";
  const [selectedTab, setSelectedTab] = useState(0);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const chartTabs = [
    { label: "Print Statistics", data: dailyPrinted, legend: "Daily Printed Count" },
    { label: "Download Statistics", data: dailyDownloaded, legend: "Daily Downloaded Count" },
    { label: "Sent Statistics", data: dailySent, legend: "Daily Sent Count" },
  ];

  return (
    <Page fullWidth>
      <TitleBar title="Dashboard" />
      <div style={{ padding: "0 48px" }}>
        <BlockStack gap="500">
        {isFree && (
          <Banner tone="info">
            You've used {invoicesThisMonth} of {FREE_PLAN_MONTHLY_LIMIT} free
            invoices on the Free plan for this month. Your monthly limit will
            reset on {formatDate(trialEndDate)}.
          </Banner>
        )}

        <InlineGrid columns={4} gap="400">
          <StatCard label="Monthly Printed" value={monthlyStats.printed} />
          <StatCard label="Monthly Downloaded" value={monthlyStats.downloaded} />
          <StatCard label="Monthly Sent" value={monthlyStats.sent} />
          <StatCard label="Monthly Uploaded" value={monthlyStats.uploaded} />
        </InlineGrid>

        <Card>
          <BlockStack gap="400">
            <div style={{ display: "flex", borderBottom: "1px solid #e1e3e5" }}>
              {chartTabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setSelectedTab(i)}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: selectedTab === i ? "2px solid #1a1a1a" : "2px solid transparent",
                    padding: "12px 24px",
                    cursor: "pointer",
                    fontWeight: selectedTab === i ? 600 : 400,
                    color: selectedTab === i ? "#1a1a1a" : "#6d7175",
                    fontSize: "14px",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <BarChart
              data={chartTabs[selectedTab].data}
              label={chartTabs[selectedTab].legend}
              month={currentMonth}
            />
          </BlockStack>
        </Card>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Action Logs
                </Text>
                {recentLogs.length > 0 ? (
                  <>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e1e3e5", textAlign: "left" }}>
                          <th style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600 }}>Order Name</th>
                          <th style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600 }}>Log Type</th>
                          <th style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600 }}>Log Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: "1px solid #f1f2f4" }}>
                            <td style={{ padding: "10px 12px", fontSize: "13px" }}>
                              <Link to="/app/orders" style={{ color: "#2c6ecb", textDecoration: "none" }}>
                                {log.orderName}
                              </Link>
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <ActionBadge actionType={log.actionType} documentType={log.documentType} />
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: "13px", color: "#6d7175" }}>
                              {formatDateTime(log.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div>
                      <Button url="/app/orders">View all logs</Button>
                    </div>
                  </>
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No actions yet. Print or download your first invoice from
                    the <Link to="/app/orders">Orders</Link> page.
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

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
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {getPlanFee(planTier)}
                  </Text>
                  <Button url="/app/plans" variant="primary">
                    Manage Plan
                  </Button>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Installation Date
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(installDate)}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="500">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Current Period Resets
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {formatDate(trialEndDate)}
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
      </div>
    </Page>
  );
}
