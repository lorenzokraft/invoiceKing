import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate, useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineGrid, Text, Button, Badge, Modal, InlineStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { TemplatePreview } from "../components/TemplatePreview";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });
  return json({ planTier: settings?.planTier || "FREE" });
};

export default function TemplateGallery() {
  const navigate = useNavigate();
  const { planTier } = useLoaderData<typeof loader>();
  const [viewing, setViewing] = useState<{ id: string; name: string; tier: string } | null>(null);

  const hasPremiumAccess = planTier === "PRO" || planTier === "PREMIUM";

  const templates = [
    {
      id: "slim",
      name: "Slim",
      tier: "Free",
      description: "Simple and clean invoice layout with QR code support",
    },
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

  const canUse = (tier: string) => tier === "Free" || hasPremiumAccess;

  return (
    <Page fullWidth>
      <TitleBar title="Choose Your Template" />
      <style>{`
        .tpl-preview-wrap .tpl-overlay {
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
        }
        .tpl-preview-wrap:hover .tpl-overlay {
          opacity: 1;
        }
      `}</style>
      <Layout>
        <Layout.Section>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 5%" }}>
          <BlockStack gap="600">
            <BlockStack gap="200">
              <Text as="h1" variant="headingLg">
                Beautiful Templates for Beautiful Brands
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Select one of the beautifully crafted templates with one click. Customize it as much as you need
                with the visual editor and match it with your brand.
              </Text>
            </BlockStack>
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
              {templates.map((template) => (
                <Card key={template.id}>
                  <BlockStack gap="400">
                    <div className="tpl-preview-wrap" style={{ position: "relative" }}>
                      <TemplatePreview templateId={template.id} />
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          zIndex: 2,
                        }}
                      >
                        <Badge
                          tone={template.tier === "Free" ? "success" : "info"}
                        >
                          {template.tier}
                        </Badge>
                      </div>
                      <div
                        className="tpl-overlay"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.45)",
                          borderRadius: "8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          zIndex: 1,
                        }}
                      >
                        <Button onClick={() => setViewing(template)}>View Template</Button>
                        {!canUse(template.tier) && (
                          <Button variant="primary" url="/app/plans">
                            Upgrade to Use
                          </Button>
                        )}
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
                    {canUse(template.tier) ? (
                      <Button
                        variant="primary"
                        onClick={() => handleSelectTemplate(template.id)}
                        fullWidth
                      >
                        Use This Template
                      </Button>
                    ) : (
                      <Button url="/app/plans" fullWidth>
                        Upgrade to Use This Template
                      </Button>
                    )}
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
          </div>
        </Layout.Section>
      </Layout>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.name} Template` : ""}
        size="large"
        primaryAction={
          viewing && canUse(viewing.tier)
            ? {
                content: "Use This Template",
                onAction: () => {
                  setViewing(null);
                  handleSelectTemplate(viewing.id);
                },
              }
            : {
                content: "Upgrade to Use",
                onAction: () => navigate("/app/plans"),
              }
        }
        secondaryActions={[{ content: "Close", onAction: () => setViewing(null) }]}
      >
        <Modal.Section>
          {viewing && (
            <InlineStack align="center">
              <div style={{ width: "100%", maxWidth: "620px" }}>
                <TemplatePreview templateId={viewing.id} height={900} />
              </div>
            </InlineStack>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
