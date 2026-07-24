import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function OrdersPage() {
  return (
    <Page fullWidth>
      <TitleBar title="Orders" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Generate documents from your orders"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Orders will appear here with actions to print, download, send
                and upload invoices, packing slips, credit notes and return
                forms.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
