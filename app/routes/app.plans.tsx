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
    pendingPlan: settings.pendingPlanTier,
    invoicesThisMonth: usage?.invoiceCount ?? 0,
    resetDate: resetDate.toISOString(),
  });
};

const PLAN_HIERARCHY = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const tier = String(formData.get("tier"));

  if (!["FREE", "BASIC", "PRO", "PREMIUM"].includes(tier)) {
    return json({ error: "Invalid plan" }, { status: 400 });
  }

  const settings = await db.shopSettings.findUnique({ where: { shop } });
  const currentTier = settings?.planTier || "FREE";
  const currentSubscriptionId = settings?.subscriptionId;

  // Downgrading to FREE - cancel current subscription immediately
  if (tier === "FREE") {
    if (currentSubscriptionId) {
      const isTest = process.env.BILLING_TEST_MODE !== "false";
      try {
        await billing.cancel({
          subscriptionId: currentSubscriptionId,
          isTest,
          prorate: true,
        });
      } catch (error) {
        console.error("Subscription cancellation error:", error);
      }
    }
    await db.shopSettings.update({
      where: { shop },
      data: { planTier: "FREE", subscriptionId: null, pendingPlanTier: null },
    });
    return json({ success: true, message: "Downgraded to Free plan" });
  }

  const planName =
    tier === "BASIC"
      ? "Basic Plan"
      : tier === "PRO"
        ? "Pro Plan"
        : "Premium Plan";

  // Test charges by default. Set BILLING_TEST_MODE=false in Railway to enable real charges.
  const isTest = process.env.BILLING_TEST_MODE !== "false";

  // Check if user already has this exact plan active
  const billingCheck = await billing.check({
    plans: [planName],
    isTest,
  });

  if (billingCheck.appSubscriptions.length > 0) {
    await db.shopSettings.update({
      where: { shop },
      data: {
        planTier: tier as "BASIC" | "PRO" | "PREMIUM",
        subscriptionId: billingCheck.appSubscriptions[0].id,
        pendingPlanTier: null,
      },
    });
    return json({ success: true, message: "Plan already active" });
  }

  // Determine if this is an upgrade or downgrade
  const isUpgrade = PLAN_HIERARCHY[tier as keyof typeof PLAN_HIERARCHY] > PLAN_HIERARCHY[currentTier as keyof typeof PLAN_HIERARCHY];

  // DOWNGRADE: Schedule for next billing cycle, don't lose paid days
  if (!isUpgrade && currentSubscriptionId) {
    await db.shopSettings.update({
      where: { shop },
      data: { pendingPlanTier: tier as "BASIC" | "PRO" | "PREMIUM" },
    });
    return json({ 
      success: true, 
      message: `Downgrade to ${planName} scheduled. Your current plan will remain active until the end of your billing period, then automatically switch to ${planName}.`,
      isPending: true,
    });
  }

  // UPGRADE: Apply immediately with proration
  // Cancel existing subscription if any
  if (currentSubscriptionId) {
    try {
      await billing.cancel({
        subscriptionId: currentSubscriptionId,
        isTest,
        prorate: true,
      });
    } catch (error) {
      console.error("Subscription cancellation error:", error);
    }
  }

  const appUrl = process.env.SHOPIFY_APP_URL || "";
  // Must be OUTSIDE /app so the embedded auth does not run on the
  // top-level redirect coming back from Shopify's approval page.
  const returnUrl = `${appUrl}/billing-callback?shop=${shop}`;

  // billing.request throws a redirect Response to Shopify's
  // subscription approval page. It never returns.
  await billing.request({
    plan: planName,
    isTest,
    returnUrl,
  });

  return json({ success: true });
};

export default function PlansPage() {
  const { currentPlan, pendingPlan, invoicesThisMonth, resetDate } =
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
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 5%" }}>
      <BlockStack gap="500">
        {currentPlan === "FREE" && (
          <Banner tone="info">
            You have used {invoicesThisMonth} of {FREE_PLAN_MONTHLY_LIMIT} free
            invoices on the Free plan this month. Your monthly limit will reset
            on {formattedReset}.
          </Banner>
        )}

        {pendingPlan && (
          <Banner tone="warning">
            You have a scheduled downgrade to {pendingPlan} plan. Your current plan will remain active until the end of your billing period, then automatically switch to {pendingPlan}.
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
            const isPending = plan.tier === pendingPlan;
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
                      disabled={isCurrent || isPending || isSubmitting}
                      onClick={() => handleSelect(plan.tier)}
                    >
                      {isCurrent ? "Current Plan" : isPending ? "Scheduled" : "Select"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            );
          })}
        </InlineGrid>
      </BlockStack>
      </div>
    </Page>
  );
}
