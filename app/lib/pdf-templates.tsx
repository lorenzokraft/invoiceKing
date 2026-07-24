import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  col1: { width: "50%" },
  col2: { width: "15%", textAlign: "right" },
  col3: { width: "15%", textAlign: "right" },
  col4: { width: "20%", textAlign: "right" },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
});

interface OrderData {
  orderNumber: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    shippingAddress?: {
      address1?: string;
      address2?: string;
      city?: string;
      province?: string;
      zip?: string;
      country?: string;
    };
  };
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
    total: string;
  }>;
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  storeName: string;
}

export const InvoiceTemplate: React.FC<{ data: OrderData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text>Invoice #{data.orderNumber}</Text>
        <Text>Date: {new Date(data.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>From:</Text>
        <Text>{data.storeName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Bill To:</Text>
        <Text>{data.customer.name}</Text>
        <Text>{data.customer.email}</Text>
        {data.customer.shippingAddress && (
          <>
            <Text>{data.customer.shippingAddress.address1}</Text>
            {data.customer.shippingAddress.address2 && (
              <Text>{data.customer.shippingAddress.address2}</Text>
            )}
            <Text>
              {data.customer.shippingAddress.city},{" "}
              {data.customer.shippingAddress.province}{" "}
              {data.customer.shippingAddress.zip}
            </Text>
            <Text>{data.customer.shippingAddress.country}</Text>
          </>
        )}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Item</Text>
          <Text style={styles.col2}>Qty</Text>
          <Text style={styles.col3}>Price</Text>
          <Text style={styles.col4}>Total</Text>
        </View>
        {data.lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{item.title}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
            <Text style={styles.col3}>
              {data.currency} {item.price}
            </Text>
            <Text style={styles.col4}>
              {data.currency} {item.total}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text>Subtotal:</Text>
          <Text>
            {data.currency} {data.subtotal}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text>Tax:</Text>
          <Text>
            {data.currency} {data.tax}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.bold]}>
          <Text>Total:</Text>
          <Text>
            {data.currency} {data.total}
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export const PackingSlipTemplate: React.FC<{ data: OrderData }> = ({
  data,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PACKING SLIP</Text>
        <Text>Order #{data.orderNumber}</Text>
        <Text>Date: {new Date(data.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>From:</Text>
        <Text>{data.storeName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Ship To:</Text>
        <Text>{data.customer.name}</Text>
        {data.customer.shippingAddress && (
          <>
            <Text>{data.customer.shippingAddress.address1}</Text>
            {data.customer.shippingAddress.address2 && (
              <Text>{data.customer.shippingAddress.address2}</Text>
            )}
            <Text>
              {data.customer.shippingAddress.city},{" "}
              {data.customer.shippingAddress.province}{" "}
              {data.customer.shippingAddress.zip}
            </Text>
            <Text>{data.customer.shippingAddress.country}</Text>
          </>
        )}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Item</Text>
          <Text style={styles.col2}>Qty</Text>
        </View>
        {data.lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{item.title}</Text>
            <Text style={styles.col2}>{item.quantity}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
