import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function TemplatesPage() {
  return (
    <Page fullWidth>
      <TitleBar title="Templates" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Design your document templates"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Manage the look of your invoices, packing slips, credit notes
                and return forms here.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
