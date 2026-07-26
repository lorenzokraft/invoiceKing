import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Checkbox,
  BlockStack,
  InlineGrid,
  Tabs,
  Button,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const settings = await db.shopSettings.upsert({
    where: { shop },
    update: {},
    create: { shop },
  });

  return json({
    storeName: settings.storeName || "",
    storeUrl: settings.storeUrl || "",
    email: settings.email || "",
    phone: settings.phone || "",
    taxNumber: settings.taxNumber || "",
    address: settings.address || "",
    addressFormat: settings.addressFormat,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
    currencyFormat: settings.currencyFormat,
    priceDecimals: settings.priceDecimals,
    primaryLocale: settings.primaryLocale,
    additionalLocales: settings.additionalLocales,
    useCustomerCurrency: settings.useCustomerCurrency,
    creditNoteOnCancel: settings.creditNoteOnCancel,
    creditNoteOnFullRefund: settings.creditNoteOnFullRefund,
    creditNoteOnPartialRefund: settings.creditNoteOnPartialRefund,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const updateData: any = {};
  for (const [key, value] of formData.entries()) {
    if (key === "additionalLocales") {
      updateData[key] = value ? (value as string).split(",") : [];
    } else if (
      key === "useCustomerCurrency" ||
      key === "creditNoteOnCancel" ||
      key === "creditNoteOnFullRefund" ||
      key === "creditNoteOnPartialRefund"
    ) {
      updateData[key] = value === "true";
    } else if (key === "priceDecimals") {
      updateData[key] = parseInt(value as string, 10);
    } else {
      updateData[key] = value;
    }
  }

  await db.shopSettings.update({
    where: { shop },
    data: updateData,
  });

  return json({ success: true });
};

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [selected, setSelected] = useState(0);

  const [formData, setFormData] = useState(data);

  const handleChange = useCallback(
    (field: string) => (value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = () => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        form.append(key, value.join(","));
      } else {
        form.append(key, String(value));
      }
    });
    submit(form, { method: "post" });
    shopify.toast.show("Settings saved");
  };

  const tabs = [
    { id: "store", content: "Store Settings" },
    { id: "mail", content: "Mail Settings" },
    { id: "upload", content: "Upload Settings" },
    { id: "links", content: "Shopify Email Links" },
  ];

  return (
    <Page>
      <TitleBar title="Settings" />
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
        <Layout>
          {selected === 0 && (
            <>
              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Company Details
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      You can view and change the company information fields seen
                      on your documents.
                    </Text>
                    <InlineGrid columns={2} gap="400">
                      <TextField
                        label="Store Name"
                        value={formData.storeName}
                        onChange={handleChange("storeName")}
                        autoComplete="off"
                      />
                      <TextField
                        label="Store URL"
                        value={formData.storeUrl}
                        onChange={handleChange("storeUrl")}
                        autoComplete="off"
                      />
                      <TextField
                        label="E-mail"
                        value={formData.email}
                        onChange={handleChange("email")}
                        autoComplete="email"
                      />
                      <TextField
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        autoComplete="tel"
                      />
                      <TextField
                        label="Company Tax Number"
                        value={formData.taxNumber}
                        onChange={handleChange("taxNumber")}
                        autoComplete="off"
                      />
                    </InlineGrid>
                    <TextField
                      label="Address"
                      value={formData.address}
                      onChange={handleChange("address")}
                      multiline={4}
                      autoComplete="off"
                    />
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Unit Settings
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      You can view and change the unit settings in your documents.
                    </Text>
                    <InlineGrid columns={2} gap="400">
                      <Select
                        label="Address Formatting Standard"
                        options={[
                          { label: "United Arab Emirates", value: "United Arab Emirates" },
                          { label: "Nigeria", value: "Nigeria" },
                          { label: "United States", value: "United States" },
                          { label: "United Kingdom", value: "United Kingdom" },
                        ]}
                        value={formData.addressFormat}
                        onChange={handleChange("addressFormat")}
                      />
                      <TextField
                        label="Date"
                        value={formData.dateFormat}
                        onChange={handleChange("dateFormat")}
                        autoComplete="off"
                        helpText="e.g., d MMMM, yyyy"
                      />
                      <Select
                        label="Time"
                        options={[
                          { label: "Do not display", value: "none" },
                          { label: "12-hour", value: "12h" },
                          { label: "24-hour", value: "24h" },
                        ]}
                        value={formData.timeFormat}
                        onChange={handleChange("timeFormat")}
                      />
                      <TextField
                        label="Currency Formatting"
                        value={formData.currencyFormat}
                        onChange={handleChange("currencyFormat")}
                        autoComplete="off"
                        helpText="e.g., {currency_symbol} {price_with_dot}"
                      />
                      <Select
                        label="Digits After Price Separator"
                        options={[
                          { label: "0", value: "0" },
                          { label: "2", value: "2" },
                          { label: "3", value: "3" },
                        ]}
                        value={String(formData.priceDecimals)}
                        onChange={handleChange("priceDecimals")}
                      />
                    </InlineGrid>
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Multi Language
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Invoice Wizard allows you to craft and dispatch documents in
                      various languages. Please specify the languages in which you
                      wish to generate documents.
                    </Text>
                    <TextField
                      label="Additional Languages"
                      value={formData.additionalLocales.join(", ")}
                      onChange={(value) =>
                        handleChange("additionalLocales")(value)
                      }
                      placeholder="Click here to select."
                      autoComplete="off"
                      helpText="Comma-separated language codes (e.g., ar, fr, es)"
                    />
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Multi Currency
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Invoice Wizard allows you to craft and dispatch documents in
                      different currencies. Please specify the currency combination in
                      which you wish to generate documents.
                    </Text>
                    <BlockStack gap="300">
                      <Checkbox
                        label="Shopify Store Currency"
                        checked={!formData.useCustomerCurrency}
                        onChange={(value) =>
                          handleChange("useCustomerCurrency")(!value)
                        }
                        helpText="Invoice Wizard will generate your documents in the currency of your store. Store currency can be changed from your Shopify store settings."
                      />
                      <Checkbox
                        label="Customer's Currency"
                        checked={formData.useCustomerCurrency}
                        onChange={handleChange("useCustomerCurrency")}
                        helpText="If you are using Shopify's currency conversion method in your store, Invoice Wizard can generate documents in different currencies."
                      />
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Credit Note Conditions
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      In this section, you can change the settings for when and how
                      credit notes are automatically created.
                    </Text>
                    <BlockStack gap="300">
                      <Checkbox
                        label="Create a credit note when you cancel an order."
                        checked={formData.creditNoteOnCancel}
                        onChange={handleChange("creditNoteOnCancel")}
                      />
                      <Checkbox
                        label="Create a credit note when you fully refund an order."
                        checked={formData.creditNoteOnFullRefund}
                        onChange={handleChange("creditNoteOnFullRefund")}
                      />
                      <Checkbox
                        label="Create a credit note when you partially refund an order."
                        checked={formData.creditNoteOnPartialRefund}
                        onChange={handleChange("creditNoteOnPartialRefund")}
                      />
                    </BlockStack>
                  </BlockStack>
                </Card>
              </Layout.Section>

              <Layout.Section>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="primary" onClick={handleSave}>
                    Save Settings
                  </Button>
                </div>
              </Layout.Section>
            </>
          )}

          {selected === 1 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Mail Settings
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Email configuration and automation settings will be available in
                    a future update.
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}

          {selected === 2 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Upload Settings
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Document upload and storage settings will be available in a
                    future update.
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}

          {selected === 3 && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Shopify Email Links
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Shopify notification email integration will be available in a
                    future update.
                  </Text>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </Tabs>
    </Page>
  );
}
