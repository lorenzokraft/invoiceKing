import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineGrid, Text, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function TemplateGallery() {
  const navigate = useNavigate();

  const templates = [
    {
      id: "slim",
      name: "Slim",
      description: "Clean and minimal design with elegant typography",
      preview: "/templates/slim-preview.png",
    },
    {
      id: "nice",
      name: "Nice",
      description: "Modern layout with bold headers and clear sections",
      preview: "/templates/nice-preview.png",
    },
    {
      id: "coffee",
      name: "Coffee",
      description: "Stylish design with custom branding elements",
      preview: "/templates/coffee-preview.png",
    },
    {
      id: "liner",
      name: "Liner",
      description: "Professional layout with structured information",
      preview: "/templates/liner-preview.png",
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional invoice format with timeless appeal",
      preview: "/templates/classic-preview.png",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Contemporary design with bold typography",
      preview: "/templates/modern-preview.png",
    },
  ];

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/app/templates?style=${templateId}`);
  };

  return (
    <Page fullWidth>
      <TitleBar title="Choose Your Template" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            <Text as="h1" variant="headingLg">
              Select a template to customize for your invoices
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
              {templates.map((template) => (
                <Card key={template.id}>
                  <BlockStack gap="400">
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        backgroundColor: "#f6f6f7",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e1e3e5",
                      }}
                    >
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {template.name} Template Preview
                      </Text>
                    </div>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd">
                        {template.name}
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {template.description}
                      </Text>
                    </BlockStack>
                    <Button
                      variant="primary"
                      onClick={() => handleSelectTemplate(template.id)}
                      fullWidth
                    >
                      Use This Template
                    </Button>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
