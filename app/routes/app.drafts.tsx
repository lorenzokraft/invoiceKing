import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function DraftsPage() {
  return (
    <Page fullWidth>
      <TitleBar title="Drafts" />
      <Layout>
        <Layout.Section>
          <Card>
            <EmptyState
              heading="Send quotes and drafts before checkout"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Draft orders will appear here with actions to print, download,
                send and upload draft documents.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
