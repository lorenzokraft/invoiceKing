import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const { type, orderId } = params;
  
  const printUrl = `/app/print/${type}/${orderId}`;
  
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Opening Print Window...</title>
      </head>
      <body>
        <script>
          window.open('${printUrl}', '_blank', 'width=1024,height=768');
          window.history.back();
        </script>
        <p>Opening print window...</p>
      </body>
    </html>`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
};

export default function PrintRedirect() {
  return null;
}
