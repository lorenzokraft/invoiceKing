import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineGrid, Text, Button, Badge } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { TemplatePreview } from "../components/TemplatePreview";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function TemplateGallery() {
  const navigate = useNavigate();

  const templates = [
    {
      id: "pure",
      name: "Pure",
      tier: "Free",
      description: "Clean and minimal design with elegant typography",
    },
    {
      id: "agile",
      name: "Agile",
      tier: "Premium",
      description: "Modern layout with structured information blocks",
    },
    {
      id: "aqua",
      name: "Aqua",
      tier: "Premium",
      description: "Fresh design with clear visual hierarchy",
    },
    {
      id: "aurora",
      name: "Aurora",
      tier: "Premium",
      description: "Professional layout with bold accents",
    },
    {
      id: "epoch",
      name: "Epoch",
      tier: "Premium",
      description: "Contemporary design with strong contrast",
    },
    {
      id: "leo",
      name: "Leo",
      tier: "Premium",
      description: "Stylish template with custom branding elements",
    },
    {
      id: "ocean",
      name: "Ocean",
      tier: "Premium",
      description: "Modern dark theme with elegant spacing",
    },
    {
      id: "retro",
      name: "Retro",
      tier: "Premium",
      description: "Classic black design with timeless appeal",
    },
    {
      id: "rhythm",
      name: "Rhythm",
      tier: "Premium",
      description: "Balanced layout with structured sections",
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
                    <div style={{ position: "relative" }}>
                      <TemplatePreview templateId={template.id} />
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                        }}
                      >
                        <Badge
                          tone={template.tier === "Free" ? "success" : "info"}
                        >
                          {template.tier}
                        </Badge>
                      </div>
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
