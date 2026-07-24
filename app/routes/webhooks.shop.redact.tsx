import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Erase all data stored for this shop.
  await db.document.deleteMany({ where: { shop } });
  await db.template.deleteMany({ where: { shop } });
  await db.monthlyUsage.deleteMany({ where: { shop } });
  await db.shopSettings.deleteMany({ where: { shop } });

  return new Response();
};
