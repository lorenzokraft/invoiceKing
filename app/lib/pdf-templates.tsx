import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

export interface TemplateSettings {
  documentTitle?: string;
  titleColor?: string;
  documentTitleFontSize?: number;
  labelColor?: string;
  labelFontSize?: number;
  footerMessage?: string;
  additionalFooterText?: string;
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  headerFontSize?: number;
  displayOrderNo?: boolean;
  displayOrderDate?: boolean;
  templateStyle?: string;
}

const DEFAULT_SETTINGS: Required<TemplateSettings> = {
  documentTitle: "INVOICE",
  titleColor: "#000000",
  documentTitleFontSize: 24,
  labelColor: "#6d6f80",
  labelFontSize: 10,
  footerMessage: "Thanks for your business...",
  additionalFooterText: "We truly appreciate your trust, and we'll do our best to continue to give you the service you deserve. We look forward to serving you again.",
  logoUrl: "",
  logoWidth: 60,
  logoHeight: 60,
  headerFontSize: 13,
  displayOrderNo: true,
  displayOrderDate: true,
  templateStyle: "slim",
};

// Theme colors matching template-themes.ts
const THEMES: Record<string, { bannerBg: string; bannerInk: string; headBg: string; headInk: string; accent: string; isBanner: boolean }> = {
  slim: { bannerBg: "#ffffff", bannerInk: "#1a1a1a", headBg: "#ffffff", headInk: "#1a1a1a", accent: "#1a1a1a", isBanner: false },
  pure: { bannerBg: "#ffffff", bannerInk: "#1a1a1a", headBg: "#f4f4f4", headInk: "#1a1a1a", accent: "#1a1a1a", isBanner: false },
  agile: { bannerBg: "#ffffff", bannerInk: "#1a1a1a", headBg: "#2f6f4f", headInk: "#ffffff", accent: "#2f6f4f", isBanner: false },
  aqua: { bannerBg: "#ffffff", bannerInk: "#0e7c86", headBg: "#e6f4f5", headInk: "#0e7c86", accent: "#0e7c86", isBanner: false },
  aurora: { bannerBg: "#26413c", bannerInk: "#ffffff", headBg: "#26413c", headInk: "#ffffff", accent: "#26413c", isBanner: true },
  epoch: { bannerBg: "#111111", bannerInk: "#ffffff", headBg: "#111111", headInk: "#ffffff", accent: "#111111", isBanner: true },
  leo: { bannerBg: "#1a1a1a", bannerInk: "#ffffff", headBg: "#1a1a1a", headInk: "#ffffff", accent: "#8a5a2b", isBanner: true },
  ocean: { bannerBg: "#0d1b2a", bannerInk: "#ffffff", headBg: "#0d1b2a", headInk: "#ffffff", accent: "#0d5c75", isBanner: true },
  retro: { bannerBg: "#191919", bannerInk: "#f5e9d6", headBg: "#191919", headInk: "#f5e9d6", accent: "#c0392b", isBanner: true },
  rhythm: { bannerBg: "#ffffff", bannerInk: "#5b3ea6", headBg: "#f0ecfa", headInk: "#5b3ea6", accent: "#5b3ea6", isBanner: false },
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  metaBox: {
    borderWidth: 2,
    borderColor: "#1a1a1a",
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
    alignItems: "flex-end",
    minWidth: 100,
  },
  metaLabel: {
    fontWeight: 700,
    marginBottom: 2,
  },
  metaValue: {},
  addressRow: {
    flexDirection: "row",
    marginBottom: 25,
  },
  addressCol: {
    width: "33%",
    paddingRight: 10,
  },
  addressLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  addressText: {
    fontSize: 9,
    marginBottom: 2,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e3e5",
  },
  colImage: { width: "50px" },
  colTitle: { width: "28%" },
  colSku: { width: "14%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "19%", textAlign: "right" },
  colTotal: { width: "19%", textAlign: "right" },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    marginLeft: 6,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  grandTotalText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  logo: {
    objectFit: "contain",
    marginRight: 12,
  },
  paymentBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#c4c6c8",
    borderStyle: "dashed",
    marginTop: 20,
    marginBottom: 20,
  },
  paymentCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#c4c6c8",
    borderRightStyle: "dashed",
  },
  paymentCellLast: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  paymentValue: {
    fontSize: 11,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  footerText: {
    fontSize: 9,
    color: "#6d6f80",
    textAlign: "center",
    maxWidth: 400,
  },
});

interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

interface OrderData {
  orderNumber: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    shippingAddress?: Address;
    billingAddress?: Address;
  };
  lineItems: Array<{
    title: string;
    quantity: number;
    sku?: string;
    image?: string;
    price: string;
    total: string;
  }>;
  subtotal: string;
  tax: string;
  shipping?: string;
  paid?: string;
  amountDue?: string;
  total: string;
  currency: string;
  storeName: string;
}

const AddressBlock: React.FC<{
  label: string;
  name: string;
  address?: Address;
  email?: string;
}> = ({ label, name, address, email }) => (
  <View style={styles.addressCol}>
    <Text style={styles.addressLabel}>{label}</Text>
    <Text style={styles.addressText}>{name}</Text>
    {email ? <Text style={styles.addressText}>{email}</Text> : null}
    {address?.address1 ? (
      <Text style={styles.addressText}>{address.address1}</Text>
    ) : null}
    {address?.address2 ? (
      <Text style={styles.addressText}>{address.address2}</Text>
    ) : null}
    {address?.city ? (
      <Text style={styles.addressText}>
        {address.city}
        {address.province ? `, ${address.province}` : ""}
        {address.zip ? ` ${address.zip}` : ""}
      </Text>
    ) : null}
    {address?.country ? (
      <Text style={styles.addressText}>{address.country}</Text>
    ) : null}
  </View>
);

export const InvoiceTemplate: React.FC<{
  data: OrderData;
  settings?: TemplateSettings;
}> = ({ data, settings }) => {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const theme = THEMES[s.templateStyle] || THEMES.slim;
  const inkColor = theme.isBanner ? theme.bannerInk : s.titleColor;
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[
        styles.header,
        theme.isBanner ? {
          backgroundColor: theme.bannerBg,
          padding: 20,
          borderRadius: 6,
        } : {}
      ]}>
        <View style={styles.headerLeft}>
          {s.logoUrl ? <Image style={[styles.logo, { width: s.logoWidth, height: s.logoHeight }]} src={s.logoUrl} /> : null}
          <Text
            style={[
              styles.title,
              { color: inkColor, fontSize: Math.min(s.documentTitleFontSize, 24) },
            ]}
          >
            {s.documentTitle}
          </Text>
        </View>
        {(s.displayOrderNo || s.displayOrderDate) && (
          <View style={styles.headerRight}>
            {s.displayOrderNo ? (
              <View style={[styles.metaBox, { borderColor: inkColor }]}>
                <Text style={[styles.metaLabel, { color: inkColor, fontSize: s.headerFontSize }]}>ORDER NO</Text>
                <Text style={[styles.metaValue, { color: inkColor, fontSize: s.headerFontSize }]}>{data.orderNumber}</Text>
              </View>
            ) : null}
            {s.displayOrderDate ? (
              <View style={[styles.metaBox, { borderColor: inkColor }]}>
                <Text style={[styles.metaLabel, { color: inkColor, fontSize: s.headerFontSize }]}>ORDER DATE</Text>
                <Text style={[styles.metaValue, { color: inkColor, fontSize: s.headerFontSize }]}>
                  {new Date(data.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.addressRow}>
        <AddressBlock
          label="SHIPPING ADDRESS"
          name={data.customer.name}
          address={data.customer.shippingAddress}
        />
        <AddressBlock
          label="BILLING ADDRESS"
          name={data.customer.name}
          address={data.customer.billingAddress || data.customer.shippingAddress}
        />
        <AddressBlock
          label="CUSTOMER DETAILS"
          name={data.customer.name}
          email={data.customer.email}
        />
      </View>

      <View style={styles.table}>
        <View style={[
          styles.tableHeader,
          { backgroundColor: theme.headBg },
          theme.headBg === "#ffffff"
            ? { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" }
            : {},
        ]}>
          <View style={styles.colImage} />
          <Text style={[styles.colTitle, { color: theme.headInk }]}>TITLE</Text>
          <Text style={[styles.colSku, { color: theme.headInk }]}>SKU</Text>
          <Text style={[styles.colQty, { color: theme.headInk }]}>QTY</Text>
          <Text style={[styles.colPrice, { color: theme.headInk }]}>UNIT PRICE</Text>
          <Text style={[styles.colTotal, { color: theme.headInk }]}>TOTAL</Text>
        </View>
        {data.lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colImage}>
              {item.image && <Image src={item.image} style={{ width: 40, height: 40, objectFit: "cover" }} />}
            </View>
            <Text style={styles.colTitle}>{item.title}</Text>
            <Text style={styles.colSku}>{item.sku || "—"}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {data.currency} {item.price}
            </Text>
            <Text style={styles.colTotal}>
              {data.currency} {item.total}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>SUB TOTAL :</Text>
          <Text style={styles.totalValue}>
            {data.currency} {data.subtotal}
          </Text>
        </View>
        {data.shipping !== undefined ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SHIPPING :</Text>
            <Text style={styles.totalValue}>
              {data.currency} {data.shipping}
            </Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TAX :</Text>
          <Text style={styles.totalValue}>
            {data.currency} {data.tax}
          </Text>
        </View>
        <View style={[
          styles.grandTotalRow,
          theme.isBanner
            ? {
                backgroundColor: theme.headBg,
                borderRadius: 4,
              }
            : {
                borderTopWidth: 2,
                borderTopColor: theme.accent,
                paddingHorizontal: 0,
              },
        ]}>
          <Text style={[
            styles.grandTotalText,
            { color: theme.isBanner ? theme.headInk : theme.accent },
          ]}>
            TOTAL :
          </Text>
          <Text style={[
            styles.grandTotalText,
            { color: theme.isBanner ? theme.headInk : theme.accent },
          ]}>
            {data.currency} {data.total}
          </Text>
        </View>
      </View>

      {s.footerMessage ? (
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>{s.footerMessage}</Text>
          <Text style={styles.footerText}>
            {s.additionalFooterText.replace(/<br\s*\/?>/gi, '\n')}
          </Text>
        </View>
      ) : null}
    </Page>
  </Document>
  );
};

export const PackingSlipTemplate: React.FC<{
  data: OrderData;
  settings?: TemplateSettings;
}> = ({ data, settings }) => {
  const s = {
    ...DEFAULT_SETTINGS,
    ...settings,
    documentTitle: "PACKING SLIP",
  };
  const theme = THEMES[s.templateStyle] || THEMES.slim;
  const inkColor = theme.isBanner ? theme.bannerInk : s.titleColor;
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={[
        styles.header,
        theme.isBanner ? {
          backgroundColor: theme.bannerBg,
          padding: 20,
          borderRadius: 6,
        } : {}
      ]}>
        <View style={styles.headerLeft}>
          {s.logoUrl ? <Image style={[styles.logo, { width: s.logoWidth, height: s.logoHeight }]} src={s.logoUrl} /> : null}
          <Text
            style={[
              styles.title,
              { color: inkColor, fontSize: Math.min(s.documentTitleFontSize, 24) },
            ]}
          >
            {s.documentTitle}
          </Text>
        </View>
        {(s.displayOrderNo || s.displayOrderDate) && (
          <View style={styles.headerRight}>
            {s.displayOrderNo ? (
              <View style={[styles.metaBox, { borderColor: inkColor }]}>
                <Text style={[styles.metaLabel, { color: inkColor, fontSize: s.headerFontSize }]}>ORDER NO</Text>
                <Text style={[styles.metaValue, { color: inkColor, fontSize: s.headerFontSize }]}>{data.orderNumber}</Text>
              </View>
            ) : null}
            {s.displayOrderDate ? (
              <View style={[styles.metaBox, { borderColor: inkColor }]}>
                <Text style={[styles.metaLabel, { color: inkColor, fontSize: s.headerFontSize }]}>ORDER DATE</Text>
                <Text style={[styles.metaValue, { color: inkColor, fontSize: s.headerFontSize }]}>
                  {new Date(data.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.addressRow}>
        <AddressBlock
          label="SHIPPING ADDRESS"
          name={data.customer.name}
          address={data.customer.shippingAddress}
        />
        <AddressBlock
          label="BILLING ADDRESS"
          name={data.customer.name}
          address={data.customer.billingAddress || data.customer.shippingAddress}
        />
        <AddressBlock
          label="CUSTOMER DETAILS"
          name={data.customer.name}
          email={data.customer.email}
        />
      </View>

      <View style={styles.table}>
        <View style={[
          styles.tableHeader,
          { backgroundColor: theme.headBg },
          theme.headBg === "#ffffff"
            ? { borderBottomWidth: 1, borderBottomColor: "#1a1a1a" }
            : {},
        ]}>
          <View style={styles.colImage} />
          <Text style={[styles.colTitle, { color: theme.headInk }]}>TITLE</Text>
          <Text style={[styles.colSku, { color: theme.headInk }]}>SKU</Text>
          <Text style={[styles.colQty, { color: theme.headInk }]}>QTY</Text>
          <Text style={[styles.colPrice, { color: theme.headInk }]}>UNIT PRICE</Text>
          <Text style={[styles.colTotal, { color: theme.headInk }]}>TOTAL</Text>
        </View>
        {data.lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colImage}>
              {item.image && <Image src={item.image} style={{ width: 40, height: 40, objectFit: "cover" }} />}
            </View>
            <Text style={styles.colTitle}>{item.title}</Text>
            <Text style={styles.colSku}>{item.sku || "—"}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>
              {data.currency} {item.price}
            </Text>
            <Text style={styles.colTotal}>
              {data.currency} {item.total}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>SUB TOTAL :</Text>
          <Text style={styles.totalValue}>
            {data.currency} {data.subtotal}
          </Text>
        </View>
        {data.shipping !== undefined ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>SHIPPING :</Text>
            <Text style={styles.totalValue}>
              {data.currency} {data.shipping}
            </Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TAX :</Text>
          <Text style={styles.totalValue}>
            {data.currency} {data.tax}
          </Text>
        </View>
        <View style={[
          styles.grandTotalRow,
          theme.isBanner
            ? {
                backgroundColor: theme.headBg,
                borderRadius: 4,
              }
            : {
                borderTopWidth: 2,
                borderTopColor: theme.accent,
                paddingHorizontal: 0,
              },
        ]}>
          <Text style={[
            styles.grandTotalText,
            { color: theme.isBanner ? theme.headInk : theme.accent },
          ]}>
            TOTAL :
          </Text>
          <Text style={[
            styles.grandTotalText,
            { color: theme.isBanner ? theme.headInk : theme.accent },
          ]}>
            {data.currency} {data.total}
          </Text>
        </View>
      </View>

      <View style={styles.paymentBox}>
        <View style={styles.paymentCell}>
          <Text style={styles.paymentLabel}>PAID</Text>
        </View>
        <View style={styles.paymentCell}>
          <Text style={styles.paymentValue}>
            {data.currency} {data.paid || "0.00"}
          </Text>
        </View>
        <View style={styles.paymentCell}>
          <Text style={styles.paymentLabel}>AMOUNT DUE</Text>
        </View>
        <View style={styles.paymentCellLast}>
          <Text style={styles.paymentValue}>
            {data.currency} {data.amountDue || "0.00"}
          </Text>
        </View>
      </View>

      {s.footerMessage ? (
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>{s.footerMessage}</Text>
          <Text style={styles.footerText}>
            {s.additionalFooterText.replace(/<br\s*\/?>/gi, '\n')}
          </Text>
        </View>
      ) : null}
    </Page>
  </Document>
  );
};
