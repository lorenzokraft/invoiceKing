import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const { shop } = session;
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  if (!chargeId) {
    return redirect("/app/plans");
  }

  // Test charges by default. Set BILLING_TEST_MODE=false in Railway to enable real charges.
  const isTest = process.env.BILLING_TEST_MODE !== "false";

  try {
    const billingCheck = await billing.check({
      plans: ["Basic Plan", "Pro Plan", "Premium Plan"],
      isTest,
    });

    if (billingCheck.appSubscriptions.length > 0) {
      const subscription = billingCheck.appSubscriptions[0];
      let planTier: "BASIC" | "PRO" | "PREMIUM" = "BASIC";

      if (subscription.name === "Pro Plan") {
        planTier = "PRO";
      } else if (subscription.name === "Premium Plan") {
        planTier = "PREMIUM";
      }

      await db.shopSettings.update({
        where: { shop },
        data: {
          planTier,
          subscriptionId: subscription.id,
        },
      });
    }
  } catch (error) {
    console.error("Billing check error:", error);
  }

  return redirect("/app/plans");
};
