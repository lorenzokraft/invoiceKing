import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  const shop = url.searchParams.get("shop");

  if (!chargeId || !shop) {
    return redirect("/app/plans");
  }

  // After billing approval, Shopify redirects here with charge_id and shop.
  // We need to redirect back into the embedded admin app context.
  const host = url.searchParams.get("host");
  const storeHandle = shop.replace(".myshopify.com", "");
  const embeddedAppUrl = `https://admin.shopify.com/store/${storeHandle}/apps/${process.env.SHOPIFY_APP_HANDLE || "invoiceking-1"}/app/billing/confirm?charge_id=${chargeId}&shop=${shop}${host ? `&host=${host}` : ""}`;

  return redirect(embeddedAppUrl);
};
