import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);

    // TODO: erase stored personal data for the specified customer.

    return new Response();
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
};
