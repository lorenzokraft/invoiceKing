import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, EmptyState, BlockStack, Text, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  return json({
    planTier: settings?.planTier || "FREE",
  });
};

export default function QuotesPage() {
  const { planTier } = useLoaderData<typeof loader>();
  const hasAccess = planTier === "PRO" || planTier === "PREMIUM";

  if (!hasAccess) {
    return (
      <Page fullWidth>
        <TitleBar title="Quotes" />
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: "60px 40px", textAlign: "center" }}>
                <BlockStack gap="500" inlineAlign="center">
                  <div style={{ maxWidth: "400px" }}>
                    <img
                      src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                      alt="Quotes"
                      style={{ width: "100%", maxWidth: "300px" }}
                    />
                  </div>
                  <BlockStack gap="300" inlineAlign="center">
                    <Text as="h2" variant="headingXl">
                      CREATE QUOTES & GET PAID FASTER
                    </Text>
                    <div style={{ maxWidth: "600px" }}>
                      <Text as="p" variant="bodyLg" tone="subdued">
                        Increase your revenue with quotes. A quote is an agreement between you and your customer to
                        provide a service or product at an agreed-upon price and within a specific time-frame. The
                        quote shows a breakdown of the individual charges that are added together to create the total
                        cost. You can create quotes and get paid by your customers instantly.
                      </Text>
                    </div>
                    <Button variant="primary" size="large" url="/app/plans">
                      Upgrade to Pro Plan
                    </Button>
                  </BlockStack>
                </BlockStack>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page fullWidth>
      <TitleBar title="Quotes" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Create quotes and get paid faster"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Quotes you create for your customers will appear here.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
