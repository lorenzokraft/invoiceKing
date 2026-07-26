import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Select,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Collapsible,
  Box,
  Divider,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useCallback } from "react";
import { PrintIcon, ImportIcon, EmailIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const template = await db.template.findFirst({
    where: { shop, type: "INVOICE" },
  });

  const savedSettings = template?.config as any;

  return json({
    templateType: "invoice",
    logoUrl: savedSettings?.logoUrl || "",
    titleFontType: savedSettings?.titleFontType || "Bitter",
    titleFontSize: savedSettings?.titleFontSize || 14,
    titleColor: savedSettings?.titleColor || "#000000",
    labelFontType: savedSettings?.labelFontType || "Bitter",
    labelFontSize: savedSettings?.labelFontSize || 12,
    labelColor: savedSettings?.labelColor || "#6d6f80",
    documentTitleFontSize: savedSettings?.documentTitleFontSize || 36,
    productVariant: savedSettings?.productVariant || "Multiple Line",
    productWeight: savedSettings?.productWeight || "kg",
    productImage: savedSettings?.productImage || "Do not display",
    productSortType: savedSettings?.productSortType || "Default",
    facebookUrl: savedSettings?.facebookUrl || "",
    instagramUrl: savedSettings?.instagramUrl || "",
    xUrl: savedSettings?.xUrl || "",
    documentTitle: savedSettings?.documentTitle || "INVOICE",
    documentFilename: savedSettings?.documentFilename || "invoice-{{order.name}}",
    displayOrderNo: savedSettings?.displayOrderNo ?? true,
    displayInvoiceNo: savedSettings?.displayInvoiceNo ?? true,
    displayOrderDate: savedSettings?.displayOrderDate ?? true,
    footerMessage: savedSettings?.footerMessage || "Thanks for your business...",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();

  const templateSettings: any = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("display")) {
      templateSettings[key] = value === "true";
    } else if (key.includes("Size") || key.includes("Decimals")) {
      templateSettings[key] = parseInt(value as string, 10);
    } else {
      templateSettings[key] = value;
    }
  }

  const existing = await db.template.findFirst({
    where: { shop, type: "INVOICE" },
  });

  if (existing) {
    await db.template.update({
      where: { id: existing.id },
      data: { config: templateSettings },
    });
  } else {
    await db.template.create({
      data: {
        shop,
        type: "INVOICE",
        name: "Default Invoice Template",
        config: templateSettings,
      },
    });
  }

  return json({ success: true });
};

export default function TemplatesPage() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [templateType, setTemplateType] = useState(data.templateType);
  const [formData, setFormData] = useState(data);

  const [overviewOpen, setOverviewOpen] = useState(true);
  const [socialMediaOpen, setSocialMediaOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [numberingOpen, setNumberingOpen] = useState(false);
  const [barcodesOpen, setBarcodesOpen] = useState(false);

  const handleChange = useCallback(
    (field: string) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = () => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, String(value));
    });
    submit(form, { method: "post" });
    shopify.toast.show("Template saved");
  };

  const templateOptions = [
    { label: "Invoice", value: "invoice" },
    { label: "Draft", value: "draft" },
    { label: "Credit Note", value: "credit_note" },
    { label: "Packing Slip", value: "packing_slip" },
    { label: "Return Form", value: "return_form" },
  ];

  return (
    <Page fullWidth>
      <TitleBar title="Templates" />
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <div style={{ flex: 1 }}>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Slim
              </Text>

              <div
                onClick={() => setOverviewOpen(!overviewOpen)}
                style={{ cursor: "pointer", padding: "12px 0" }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ fontSize: "20px" }}>🔧</div>
                    <Text as="p" variant="bodyMd">
                      Overview
                    </Text>
                  </InlineStack>
                  <div style={{ fontSize: "20px" }}>{overviewOpen ? "▼" : "▶"}</div>
                </InlineStack>
              </div>
              <Collapsible open={overviewOpen} id="overview">
                <BlockStack gap="300">
                  <TextField
                    label="Logo"
                    value={formData.logoUrl}
                    onChange={handleChange("logoUrl")}
                    placeholder="Choose file"
                    autoComplete="off"
                    connectedRight={
                      <Button>Browse</Button>
                    }
                  />
                  <Select
                    label="Title Font Type"
                    options={[
                      { label: "Bitter", value: "Bitter" },
                      { label: "Arial", value: "Arial" },
                      { label: "Helvetica", value: "Helvetica" },
                    ]}
                    value={formData.titleFontType}
                    onChange={handleChange("titleFontType")}
                  />
                  <TextField
                    label="Title Font Size"
                    type="number"
                    value={String(formData.titleFontSize)}
                    onChange={handleChange("titleFontSize")}
                    suffix="px"
                    autoComplete="off"
                  />
                  <div>
                    <Text as="p" variant="bodyMd">
                      Title Color
                    </Text>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <TextField
                        value={formData.titleColor}
                        onChange={handleChange("titleColor")}
                        autoComplete="off"
                        labelHidden
                        label="Title Color"
                      />
                      <input
                        type="color"
                        value={formData.titleColor}
                        onChange={(e) => handleChange("titleColor")(e.target.value)}
                        style={{
                          width: "50px",
                          height: "36px",
                          border: "1px solid #c9cccf",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>
                  <Select
                    label="Label Font Type"
                    options={[
                      { label: "Bitter", value: "Bitter" },
                      { label: "Arial", value: "Arial" },
                      { label: "Helvetica", value: "Helvetica" },
                    ]}
                    value={formData.labelFontType}
                    onChange={handleChange("labelFontType")}
                  />
                  <TextField
                    label="Label Font Size"
                    type="number"
                    value={String(formData.labelFontSize)}
                    onChange={handleChange("labelFontSize")}
                    suffix="px"
                    autoComplete="off"
                  />
                  <div>
                    <Text as="p" variant="bodyMd">
                      Label Color
                    </Text>
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <TextField
                        value={formData.labelColor}
                        onChange={handleChange("labelColor")}
                        autoComplete="off"
                        labelHidden
                        label="Label Color"
                      />
                      <input
                        type="color"
                        value={formData.labelColor}
                        onChange={(e) => handleChange("labelColor")(e.target.value)}
                        style={{
                          width: "50px",
                          height: "36px",
                          border: "1px solid #c9cccf",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>
                  <TextField
                    label="Document Title Font Size"
                    type="number"
                    value={String(formData.documentTitleFontSize)}
                    onChange={handleChange("documentTitleFontSize")}
                    suffix="px"
                    autoComplete="off"
                  />
                  <Select
                    label="Product Variant"
                    options={[
                      { label: "Multiple Line", value: "Multiple Line" },
                      { label: "Single Line", value: "Single Line" },
                    ]}
                    value={formData.productVariant}
                    onChange={handleChange("productVariant")}
                  />
                  <Select
                    label="Product Weight"
                    options={[
                      { label: "kg", value: "kg" },
                      { label: "lb", value: "lb" },
                      { label: "oz", value: "oz" },
                    ]}
                    value={formData.productWeight}
                    onChange={handleChange("productWeight")}
                  />
                  <Select
                    label="Product Image"
                    options={[
                      { label: "Do not display", value: "Do not display" },
                      { label: "Display", value: "Display" },
                    ]}
                    value={formData.productImage}
                    onChange={handleChange("productImage")}
                  />
                  <Select
                    label="Product Sort Type"
                    options={[
                      { label: "Default", value: "Default" },
                      { label: "Alphabetical", value: "Alphabetical" },
                    ]}
                    value={formData.productSortType}
                    onChange={handleChange("productSortType")}
                  />
                </BlockStack>
              </Collapsible>

              <Divider />

              <div
                onClick={() => setSocialMediaOpen(!socialMediaOpen)}
                style={{ cursor: "pointer", padding: "12px 0" }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ fontSize: "20px" }}>👥</div>
                    <Text as="p" variant="bodyMd">
                      Social Media
                    </Text>
                  </InlineStack>
                  <div style={{ fontSize: "20px" }}>{socialMediaOpen ? "▼" : "▶"}</div>
                </InlineStack>
              </div>
              <Collapsible open={socialMediaOpen} id="social">
                <BlockStack gap="300">
                  <TextField
                    label="Display Facebook Icon"
                    value={formData.facebookUrl}
                    onChange={handleChange("facebookUrl")}
                    placeholder="Facebook URL"
                    autoComplete="off"
                  />
                  <TextField
                    label="Display Instagram Icon"
                    value={formData.instagramUrl}
                    onChange={handleChange("instagramUrl")}
                    placeholder="Instagram URL"
                    autoComplete="off"
                  />
                  <TextField
                    label="Display X Icon"
                    value={formData.xUrl}
                    onChange={handleChange("xUrl")}
                    placeholder="X URL"
                    autoComplete="off"
                  />
                </BlockStack>
              </Collapsible>

              <Divider />

              <div
                onClick={() => setDetailsOpen(!detailsOpen)}
                style={{ cursor: "pointer", padding: "12px 0" }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ fontSize: "20px" }}>📝</div>
                    <Text as="p" variant="bodyMd">
                      {templateType === "invoice" && "Invoice Details"}
                      {templateType === "draft" && "Draft Details"}
                      {templateType === "packing_slip" && "Packing Slip Details"}
                    </Text>
                  </InlineStack>
                  <div style={{ fontSize: "20px" }}>{detailsOpen ? "▼" : "▶"}</div>
                </InlineStack>
              </div>
              <Collapsible open={detailsOpen} id="details">
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">
                    Document Details
                  </Text>
                  <TextField
                    label="Document Title"
                    value={formData.documentTitle}
                    onChange={handleChange("documentTitle")}
                    autoComplete="off"
                  />
                  <TextField
                    label="Document Filename"
                    value={formData.documentFilename}
                    onChange={handleChange("documentFilename")}
                    autoComplete="off"
                    helpText="Use {{order.name}} for order number"
                  />
                  <Checkbox
                    label="Display Order No"
                    checked={formData.displayOrderNo}
                    onChange={(value) => setFormData((prev) => ({ ...prev, displayOrderNo: value }))}
                  />
                  <Checkbox
                    label="Display Invoice No"
                    checked={formData.displayInvoiceNo}
                    onChange={(value) => setFormData((prev) => ({ ...prev, displayInvoiceNo: value }))}
                  />
                  <Checkbox
                    label="Display Order Date"
                    checked={formData.displayOrderDate}
                    onChange={(value) => setFormData((prev) => ({ ...prev, displayOrderDate: value }))}
                  />
                  <TextField
                    label="Display Footer Message"
                    value={formData.footerMessage}
                    onChange={handleChange("footerMessage")}
                    multiline={3}
                    autoComplete="off"
                  />
                </BlockStack>
              </Collapsible>

              <Divider />

              <div
                onClick={() => setNumberingOpen(!numberingOpen)}
                style={{ cursor: "pointer", padding: "12px 0" }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ fontSize: "20px" }}>🔢</div>
                    <Text as="p" variant="bodyMd">
                      Invoice Numbering
                    </Text>
                  </InlineStack>
                  <div style={{ fontSize: "20px" }}>{numberingOpen ? "▼" : "▶"}</div>
                </InlineStack>
              </div>

              <Divider />

              <div
                onClick={() => setBarcodesOpen(!barcodesOpen)}
                style={{ cursor: "pointer", padding: "12px 0" }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <div style={{ fontSize: "20px" }}>📱</div>
                    <Text as="p" variant="bodyMd">
                      Barcodes & QR Codes
                    </Text>
                  </InlineStack>
                  <div style={{ fontSize: "20px" }}>{barcodesOpen ? "▼" : "▶"}</div>
                </InlineStack>
              </div>

              <Button variant="primary" onClick={handleSave} fullWidth>
                Save Template
              </Button>
            </BlockStack>
          </Card>
        </div>

        <div style={{ flex: "0 0 320px" }}>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <InlineStack gap="200">
                  <Button icon={PrintIcon}>Print</Button>
                  <Button icon={ImportIcon}>Download</Button>
                  <Button icon={EmailIcon}>Send</Button>
                </InlineStack>
                <Select
                  label="Template"
                  labelHidden
                  options={templateOptions}
                  value={templateType}
                  onChange={(value) => setTemplateType(value)}
                />
              </InlineStack>

              <div
                style={{
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  padding: "40px",
                  backgroundColor: "#fff",
                  minHeight: "800px",
                }}
              >
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "40px",
                    }}
                  >
                    <div
                      style={{
                        width: "120px",
                        height: "60px",
                        border: "2px dashed #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "#999",
                      }}
                    >
                      {formData.logoUrl ? "Logo" : "No Logo"}
                    </div>
                    <h1
                      style={{
                        fontSize: `${formData.documentTitleFontSize}px`,
                        fontFamily: formData.titleFontType,
                        color: formData.titleColor,
                        margin: 0,
                      }}
                    >
                      {formData.documentTitle || "INVOICE"}
                    </h1>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div
                        style={{
                          border: "2px solid #000",
                          padding: "8px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          ORDER NO
                        </div>
                        <div>INV-1024</div>
                      </div>
                      <div
                        style={{
                          border: "2px solid #000",
                          padding: "8px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                          }}
                        >
                          ORDER DATE
                        </div>
                        <div>26 July, 2026</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "20px",
                      marginBottom: "40px",
                      fontSize: `${formData.labelFontSize}px`,
                      fontFamily: formData.labelFontType,
                      color: formData.labelColor,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {templateType === "packing_slip"
                          ? "SHIP TO"
                          : "SHIPPING ADDRESS"}
                      </div>
                      <div>Benjamin Biermann</div>
                      <div>Leo Hoover GmbH</div>
                      <div>Brandenburgische Straße 54</div>
                      <div>Nikolassee</div>
                      <div>Berlin, 14129</div>
                      <div>Germany</div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "8px",
                        }}
                      >
                        {templateType === "packing_slip"
                          ? "BILL TO"
                          : "BILLING ADDRESS"}
                      </div>
                      <div>Benjamin Biermann</div>
                      <div>Leo Hoover GmbH</div>
                      <div>Brandenburgische Straße 54</div>
                      <div>Nikolassee</div>
                      <div>Berlin, 14129</div>
                      <div>Germany</div>
                    </div>
                    {templateType !== "packing_slip" && (
                      <div>
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "8px",
                          }}
                        >
                          CUSTOMER ADDRESS
                        </div>
                        <div>Benjamin Biermann</div>
                        <div>Leo Hoover GmbH</div>
                        <div>Brandenburgische Straße 54</div>
                        <div>Nikolassee</div>
                        <div>Berlin, 14129</div>
                        <div>Germany</div>
                      </div>
                    )}
                  </div>

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: `${formData.labelFontSize}px`,
                      fontFamily: formData.labelFontType,
                      marginBottom: "20px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid #000",
                          borderTop: "2px solid #000",
                        }}
                      >
                        <th
                          style={{
                            textAlign: "left",
                            padding: "8px 0",
                            fontWeight: "bold",
                          }}
                        >
                          TITLE
                        </th>
                        {templateType !== "packing_slip" && (
                          <>
                            <th style={{ textAlign: "center" }}>SKU</th>
                            <th style={{ textAlign: "center" }}>QTY</th>
                            <th style={{ textAlign: "center" }}>TAX</th>
                            <th style={{ textAlign: "right" }}>UNIT PRICE</th>
                            <th style={{ textAlign: "right" }}>TOTAL</th>
                          </>
                        )}
                        {templateType === "packing_slip" && (
                          <>
                            <th style={{ textAlign: "center" }}>QTY</th>
                            <th style={{ textAlign: "right" }}>UNIT PRICE</th>
                            <th style={{ textAlign: "right" }}>TOTAL</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px 0" }}>
                          Cuba Filter Coffee
                          <br />
                          <span style={{ color: "#999", fontSize: "11px" }}>
                            Dark / Bean
                          </span>
                        </td>
                        {templateType !== "packing_slip" && (
                          <>
                            <td style={{ textAlign: "center" }}>CUBCOF990</td>
                            <td style={{ textAlign: "center" }}>1</td>
                            <td style={{ textAlign: "center" }}>16%</td>
                            <td style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  textDecoration: "line-through",
                                  color: "red",
                                  fontSize: "10px",
                                }}
                              >
                                AED 24.95
                              </div>
                              <div>AED 22.45</div>
                            </td>
                            <td style={{ textAlign: "right" }}>AED 22.45</td>
                          </>
                        )}
                        {templateType === "packing_slip" && (
                          <>
                            <td style={{ textAlign: "center" }}>1</td>
                            <td style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  textDecoration: "line-through",
                                  color: "red",
                                  fontSize: "10px",
                                }}
                              >
                                AED 24.95
                              </div>
                              <div>AED 22.45</div>
                            </td>
                            <td style={{ textAlign: "right" }}>AED 22.45</td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>

                  {templateType !== "packing_slip" && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        fontSize: `${formData.labelFontSize}px`,
                        fontFamily: formData.labelFontType,
                      }}
                    >
                      <div style={{ width: "200px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <span>DISCOUNT:</span>
                          <span>- AED 7.48</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <span>SUB TOTAL:</span>
                          <span>AED 74.85</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <span>SHIPPING:</span>
                          <span>AED 2.00</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <span>TAX:</span>
                          <span>AED 11.09</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "4px 0",
                          }}
                        >
                          <span>REFUNDED:</span>
                          <span>AED -80.46</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderTop: "2px solid #000",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          <span>TOTAL:</span>
                          <span>AED 0.00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "40px",
                      fontSize: `${formData.labelFontSize}px`,
                      fontFamily: formData.labelFontType,
                    }}
                  >
                    {formData.footerMessage && (
                      <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                        {formData.footerMessage}
                      </p>
                    )}
                    <p style={{ color: "#666", marginTop: "8px" }}>
                      We truly appreciate your trust, and we'll do our best to
                      continue to give you the service you deserve. We look
                      forward to serving you again.
                    </p>
                    {(formData.facebookUrl || formData.instagramUrl || formData.xUrl) && (
                      <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center" }}>
                        {formData.facebookUrl && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                        {formData.instagramUrl && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )}
                        {formData.xUrl && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </BlockStack>
          </Card>
        </div>
      </div>
    </Page>
  );
}
