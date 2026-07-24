import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Card,
  Text,
  Button,
  ButtonGroup,
  Banner,
  BlockStack,
  InlineGrid,
  InlineStack,
  Box,
  Divider,
  List,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const FREE_PLAN_MONTHLY_LIMIT = 50;

const PLANS = [
  {
    tier: "FREE",
    name: "Free",
    tagline: "Start invoicing without spending a penny.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "50 invoices per month",
      "Compliant invoices",
      "Multi currency support",
      "Bulk process",
      "Draft orders",
      "Packing slips",
      "Credit notes",
      "Return forms",
      "Standard customer support",
    ],
  },
  {
    tier: "BASIC",
    name: "Basic",
    tagline: "Necessary features for a growing business.",
    monthlyPrice: 9.9,
    yearlyPrice: 99,
    features: [
      "Everything in Free",
      "Automatic and unlimited invoices",
      "Receipts",
      "Multi language templates",
      "Sequential invoice numbers",
      "Secondary page attachments",
      "Priority support",
    ],
  },
  {
    tier: "PRO",
    name: "Pro",
    tagline: "Advanced tools for professional stores.",
    monthlyPrice: 19.9,
    yearlyPrice: 199,
    features: [
      "Everything in Basic",
      "Quotes",
      "Custom invoice templates",
      "Premium templates",
    ],
  },
  {
    tier: "PREMIUM",
    name: "Premium",
    tagline: "High-end features for high volume stores.",
    monthlyPrice: 79.9,
    yearlyPrice: 799,
    features: [
      "Everything in Pro",
      "Recommended for high volume stores",
      "Custom template created for your brand",
      "Code customizations for simple logics",
      "Exclusive setup coordinator",
    ],
  },
] as const;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

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

  const resetDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  return json({
    currentPlan: settings.planTier,
    invoicesThisMonth: usage?.invoiceCount ?? 0,
    resetDate: resetDate.toISOString(),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const tier = String(formData.get("tier"));

  if (!["FREE", "BASIC", "PRO", "PREMIUM"].includes(tier)) {
    return json({ error: "Invalid plan" }, { status: 400 });
  }

  // TODO: integrate Shopify Billing API with 7 day trial before switching paid plans.
  await db.shopSettings.update({
    where: { shop },
    data: { planTier: tier as "FREE" | "BASIC" | "PRO" | "PREMIUM" },
  });

  return json({ success: true });
};

export default function PlansPage() {
  const { currentPlan, invoicesThisMonth, resetDate } =
    useLoaderData<typeof loader>();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formattedReset = new Date(resetDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleSelect = (tier: string) => {
    submit({ tier }, { method: "post" });
  };

  return (
    <Page fullWidth>
      <TitleBar title="Select a Plan" />
      <BlockStack gap="500">
        {currentPlan === "FREE" && (
          <Banner tone="info">
            You have used {invoicesThisMonth} of {FREE_PLAN_MONTHLY_LIMIT} free
            invoices on the Free plan this month. Your monthly limit will reset
            on {formattedReset}.
          </Banner>
        )}

        <InlineStack align="center">
          <ButtonGroup variant="segmented">
            <Button
              pressed={billingCycle === "monthly"}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              pressed={billingCycle === "yearly"}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </Button>
          </ButtonGroup>
        </InlineStack>

        <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
          {PLANS.map((plan) => {
            const isCurrent = plan.tier === currentPlan;
            const price =
              billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const suffix = billingCycle === "monthly" ? "/month" : "/year";

            return (
              <Card key={plan.tier}>
                <BlockStack gap="400">
                  <BlockStack gap="200" inlineAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h2" variant="headingLg">
                        {plan.name}
                      </Text>
                      {plan.tier !== "FREE" && (
                        <Badge tone="attention">7 day free trial</Badge>
                      )}
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                      {plan.tagline}
                    </Text>
                    <InlineStack blockAlign="end" gap="100">
                      <Text as="p" variant="heading2xl">
                        ${price}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {suffix}
                      </Text>
                    </InlineStack>
                  </BlockStack>

                  <Divider />

                  <Box minHeight="220px">
                    <List type="bullet">
                      {plan.features.map((feature) => (
                        <List.Item key={feature}>{feature}</List.Item>
                      ))}
                    </List>
                  </Box>

                  <InlineStack align="center">
                    <Button
                      variant={isCurrent ? "secondary" : "primary"}
                      disabled={isCurrent || isSubmitting}
                      onClick={() => handleSelect(plan.tier)}
                    >
                      {isCurrent ? "Selected" : "Select"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            );
          })}
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
