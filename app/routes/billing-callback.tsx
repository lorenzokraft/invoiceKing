import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

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

  // Redirect back into the embedded Shopify admin app context so the
  // session is valid when we verify the subscription.
  const host = url.searchParams.get("host");
  const storeHandle = shop.replace(".myshopify.com", "");
  const embeddedAppUrl = `https://admin.shopify.com/store/${storeHandle}/apps/${process.env.SHOPIFY_APP_HANDLE || "invoiceking-1"}/app/billing/confirm?charge_id=${chargeId}&shop=${shop}${host ? `&host=${host}` : ""}`;

  return redirect(embeddedAppUrl);
};
