import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function PlansPage() {
  return (
    <Page>
      <TitleBar title="Select a Plan" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Choose the plan that fits your store"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Free, Basic, Pro and Premium plans with a 7 day free trial on
                paid tiers will be available here.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
