export function TemplatePreview({ templateId }: { templateId: string }) {
  const getTemplatePreview = () => {
    const baseStyles = {
      width: "100%",
      height: "400px",
      background: "#fff",
      borderRadius: "8px",
      border: "1px solid #e1e3e5",
      padding: "20px",
      fontSize: "8px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    };

    const commonHeader = (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ fontWeight: "bold", fontSize: "10px" }}>SWEET CAKES</div>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>INVOICE</div>
        </div>
        <div style={{ borderBottom: "1px solid #e1e3e5", marginBottom: "10px" }} />
      </>
    );

    switch (templateId) {
      case "pure":
        return (
          <div style={baseStyles}>
            {commonHeader}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "7px", color: "#666", marginBottom: "2px" }}>BILL TO</div>
                <div style={{ fontSize: "8px" }}>Customer Name</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "7px", color: "#666" }}>Invoice #: INV-001</div>
                <div style={{ fontSize: "7px", color: "#666" }}>Date: Jan 1, 2026</div>
              </div>
            </div>
            <div style={{ background: "#f9f9f9", padding: "8px", borderRadius: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", fontWeight: "bold", marginBottom: "6px" }}>
                <div>ITEM</div>
                <div>QTY</div>
                <div>PRICE</div>
                <div style={{ textAlign: "right" }}>TOTAL</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", padding: "4px 0", borderTop: "1px solid #e1e3e5" }}>
                  <div>Product {i}</div>
                  <div>1</div>
                  <div>$10.00</div>
                  <div style={{ textAlign: "right" }}>$10.00</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>Total: $30.00</div>
            </div>
          </div>
        );

      case "ocean":
      case "retro":
        return (
          <div style={{ ...baseStyles, background: "#000", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontWeight: "bold", fontSize: "10px", color: "#fff" }}>SWEET CAKES</div>
              <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>INVOICE</div>
            </div>
            <div style={{ borderBottom: "1px solid #333", marginBottom: "10px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "7px", color: "#999", marginBottom: "2px" }}>BILL TO</div>
                <div style={{ fontSize: "8px", color: "#fff" }}>Customer Name</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "7px", color: "#999" }}>Invoice #: INV-001</div>
              </div>
            </div>
            <div style={{ background: "#1a1a1a", padding: "8px", borderRadius: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", fontWeight: "bold", marginBottom: "6px", color: "#fff" }}>
                <div>ITEM</div>
                <div>QTY</div>
                <div>PRICE</div>
                <div style={{ textAlign: "right" }}>TOTAL</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", padding: "4px 0", borderTop: "1px solid #333", color: "#ccc" }}>
                  <div>Product {i}</div>
                  <div>1</div>
                  <div>$10.00</div>
                  <div style={{ textAlign: "right" }}>$10.00</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: "#fff" }}>Total: $30.00</div>
            </div>
          </div>
        );

      case "aurora":
      case "epoch":
        return (
          <div style={baseStyles}>
            <div style={{ background: "#000", color: "#fff", padding: "12px", marginBottom: "12px", borderRadius: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold", fontSize: "10px" }}>SWEET CAKES</div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>INVOICE</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "7px", color: "#666", marginBottom: "2px" }}>BILL TO</div>
                <div style={{ fontSize: "8px" }}>Customer Name</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "7px", color: "#666" }}>Invoice #: INV-001</div>
              </div>
            </div>
            <div style={{ border: "1px solid #e1e3e5", padding: "8px", borderRadius: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", fontWeight: "bold", marginBottom: "6px" }}>
                <div>ITEM</div>
                <div>QTY</div>
                <div>PRICE</div>
                <div style={{ textAlign: "right" }}>TOTAL</div>
              </div>
              {[1, 2].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", padding: "4px 0", borderTop: "1px solid #e1e3e5" }}>
                  <div>Product {i}</div>
                  <div>1</div>
                  <div>$10.00</div>
                  <div style={{ textAlign: "right" }}>$10.00</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", background: "#000", color: "#fff", padding: "8px", borderRadius: "4px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>Total: $20.00</div>
            </div>
          </div>
        );

      default:
        return (
          <div style={baseStyles}>
            {commonHeader}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "7px", color: "#666", marginBottom: "2px" }}>BILL TO</div>
                <div style={{ fontSize: "8px" }}>Customer Name</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "7px", color: "#666" }}>Invoice #: INV-001</div>
                <div style={{ fontSize: "7px", color: "#666" }}>Date: Jan 1, 2026</div>
              </div>
            </div>
            <div style={{ border: "1px solid #e1e3e5", padding: "8px", borderRadius: "4px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", fontWeight: "bold", marginBottom: "6px" }}>
                <div>ITEM</div>
                <div>QTY</div>
                <div>PRICE</div>
                <div style={{ textAlign: "right" }}>TOTAL</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "4px", fontSize: "7px", padding: "4px 0", borderTop: "1px solid #e1e3e5" }}>
                  <div>Product {i}</div>
                  <div>1</div>
                  <div>$10.00</div>
                  <div style={{ textAlign: "right" }}>$10.00</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", textAlign: "right" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold" }}>Total: $30.00</div>
            </div>
          </div>
        );
    }
  };

  return <div>{getTemplatePreview()}</div>;
}
