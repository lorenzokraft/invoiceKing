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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const FREE_PLAN_MONTHLY_LIMIT = 50;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Ensure settings exist for this shop on first load
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

  return {
    shop,
    planTier: settings.planTier,
    invoicesThisMonth: usage?.invoiceCount ?? 0,
  };
};

export default function Index() {
  const { planTier, invoicesThisMonth } = useLoaderData<typeof loader>();
  const isFree = planTier === "FREE";

  return (
    <Page>
      <TitleBar title="Invoice King" />
      <BlockStack gap="500">
        {isFree && (
          <Banner tone="info">
            You have used {invoicesThisMonth} of {FREE_PLAN_MONTHLY_LIMIT} free
            invoices on the Free plan this month.{" "}
            <Link to="/app/plans">Upgrade your plan</Link> for unlimited
            invoices.
          </Banner>
        )}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Welcome to Invoice King
                </Text>
                <Text as="p" variant="bodyMd">
                  Generate compliant invoices, packing slips, credit notes and
                  return forms for your orders. Send them automatically or
                  manually in multiple currencies and languages.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Invoices this month
                  </Text>
                  <Text as="p" variant="headingLg">
                    {invoicesThisMonth}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Current plan
                  </Text>
                  <Text as="p" variant="headingLg">
                    {planTier}
                  </Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Get started
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Set up your company details in{" "}
                    <Link to="/app/settings">Settings</Link>, then head to{" "}
                    <Link to="/app/orders">Orders</Link> to generate your first
                    invoice.
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
