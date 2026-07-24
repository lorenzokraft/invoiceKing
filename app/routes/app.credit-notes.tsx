import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function CreditNotesPage() {
  return (
    <Page fullWidth>
      <TitleBar title="Credit Notes" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Credit notes for refunds and cancellations"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Credit notes created manually or automatically from refunds and
                cancellations will appear here.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
