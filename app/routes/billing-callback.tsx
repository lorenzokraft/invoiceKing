import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { sessionStorage } from "../shopify.server";
import db from "../db.server";

// This route is intentionally OUTSIDE the /app prefix so it does not
// trigger the embedded-app authentication in the app.tsx parent loader.
// Shopify redirects here top-level after subscription approval.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  const shop = url.searchParams.get("shop");

  if (!chargeId || !shop) {
    return redirect("/auth/login");
  }

  // Verify the subscription and update the DB directly here, without
  // going through the /app parent route which requires embedded auth.
  const isTest = process.env.BILLING_TEST_MODE !== "false";

  try {
    // Get the offline session from storage
    const sessionId = `offline_${shop}`;
    const session = await sessionStorage.loadSession(sessionId);

    if (session?.accessToken) {
      // Query the GraphQL Admin API directly to check active subscriptions
      const query = `
        {
          currentAppInstallation {
            activeSubscriptions {
              id
              name
              status
              test
            }
          }
        }
      `;

      const response = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken,
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      const subscriptions = result?.data?.currentAppInstallation?.activeSubscriptions || [];

      // Filter by test mode
      const activeSubscriptions = subscriptions.filter((sub: any) => sub.test === isTest && sub.status === "ACTIVE");

      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0];
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
    }
  } catch (error) {
    console.error("Billing verification error:", error);
  }

  // Redirect back into the embedded admin app at the plans page
  const storeHandle = shop.replace(".myshopify.com", "");
  const embeddedAppUrl = `https://admin.shopify.com/store/${storeHandle}/apps/${process.env.SHOPIFY_APP_HANDLE || "invoiceking-1"}/app/plans`;

  return redirect(embeddedAppUrl);
};
