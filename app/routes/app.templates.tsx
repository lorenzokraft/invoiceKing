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

  const settings = await db.shopSettings.findUnique({ where: { shop } });

  return json({
    templateType: "invoice",
    logoUrl: settings?.logoUrl || "",
    titleFontType: "Bitter",
    titleFontSize: 14,
    titleColor: "#000000",
    labelFontType: "Bitter",
    labelFontSize: 12,
    labelColor: "#6d6f80",
    documentTitleFontSize: 36,
    productVariant: "Multiple Line",
    productWeight: "kg",
    productImage: "Do not display",
    productSortType: "Default",
    facebookUrl: "",
    instagramUrl: "",
    xUrl: "",
    documentTitle: "INVOICE",
    documentFilename: "invoice-{{order.name}}",
    displayOrderNo: true,
    displayInvoiceNo: true,
    displayOrderDate: true,
    footerMessage: "Thanks for your business...",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const logoUrl = formData.get("logoUrl") as string;

  await db.shopSettings.update({
    where: { shop },
    data: { logoUrl },
  });

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
        <div style={{ flex: "0 0 280px" }}>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Slim
              </Text>

              <div
                onClick={() => setOverviewOpen(!overviewOpen)}
                style={{ cursor: "pointer" }}
              >
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    Overview
                  </Text>
                  <Text as="span">{overviewOpen ? "−" : "+"}</Text>
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
                  <TextField
                    label="Title Color"
                    value={formData.titleColor}
                    onChange={handleChange("titleColor")}
                    autoComplete="off"
                    placeholder="#000000"
                  />
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
                  <TextField
                    label="Label Color"
                    value={formData.labelColor}
                    onChange={handleChange("labelColor")}
                    autoComplete="off"
                    placeholder="#6d6f80"
                  />
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
                style={{ cursor: "pointer" }}
              >
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    Social Media
                  </Text>
                  <Text as="span">{socialMediaOpen ? "−" : "+"}</Text>
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
                style={{ cursor: "pointer" }}
              >
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    {templateType === "invoice" && "Invoice Details"}
                    {templateType === "draft" && "Draft Details"}
                    {templateType === "packing_slip" && "Packing Slip Details"}
                  </Text>
                  <Text as="span">{detailsOpen ? "−" : "+"}</Text>
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
                style={{ cursor: "pointer" }}
              >
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    Invoice Numbering
                  </Text>
                  <Text as="span">{numberingOpen ? "−" : "+"}</Text>
                </InlineStack>
              </div>

              <Divider />

              <div
                onClick={() => setBarcodesOpen(!barcodesOpen)}
                style={{ cursor: "pointer" }}
              >
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    Barcodes & QR Codes
                  </Text>
                  <Text as="span">{barcodesOpen ? "−" : "+"}</Text>
                </InlineStack>
              </div>

              <Button variant="primary" onClick={handleSave} fullWidth>
                Save Template
              </Button>
            </BlockStack>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
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
                          <span style={{ fontSize: "16px" }}>📘</span>
                        )}
                        {formData.instagramUrl && (
                          <span style={{ fontSize: "16px" }}>📷</span>
                        )}
                        {formData.xUrl && (
                          <span style={{ fontSize: "16px" }}>✖️</span>
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
