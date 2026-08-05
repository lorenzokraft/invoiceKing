import type { CSSProperties, ReactNode } from "react";

function ProductIcon({ color = "#d1d5db" }: { color?: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" fill={color} opacity="0.2" />
      <path
        d="M7 7h10M7 12h7M7 17h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Palette = {
  bg: string;
  ink: string;
  sub: string;
  line: string;
  accent: string;
  headBg: string;
  headInk: string;
};

type TemplateConfig = {
  company: string;
  layout: "classic" | "banner" | "centered" | "split" | "sidebar";
  palette: Palette;
  logo: (p: Palette) => ReactNode;
};

const light = (accent: string, overrides?: Partial<Palette>): Palette => ({
  bg: "#ffffff",
  ink: "#1a1a1a",
  sub: "#8a8a8a",
  line: "#e5e5e5",
  accent,
  headBg: "#f4f4f4",
  headInk: "#1a1a1a",
  ...overrides,
});

const CONFIGS: Record<string, TemplateConfig> = {
  slim: {
    company: "Sweet Cakes",
    layout: "classic",
    palette: light("#1a1a1a"),
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 24,
            height: 24,
            background: "#000",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "#fff",
            fontWeight: 800,
            fontFamily: "monospace",
          }}
        >
          ▀▄▀
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: p.ink }}>SWEET CAKES</div>
          <div style={{ fontSize: 7.5, letterSpacing: 2, color: p.sub }}>BAKERY</div>
        </div>
      </div>
    ),
  },
  pure: {
    company: "Maple & Co.",
    layout: "classic",
    palette: light("#1a1a1a"),
    logo: (p) => (
      <div style={{ fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: p.ink }}>MAPLE &amp; CO.</div>
        <div style={{ fontSize: 8, letterSpacing: 4, color: p.sub, marginTop: 1 }}>FINE GOODS</div>
      </div>
    ),
  },
  agile: {
    company: "Urban Roots",
    layout: "split",
    palette: light("#2f6f4f", { headBg: "#2f6f4f", headInk: "#ffffff" }),
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: p.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          U
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: p.ink }}>URBAN ROOTS</div>
          <div style={{ fontSize: 7.5, letterSpacing: 2, color: p.sub }}>GARDEN SUPPLY</div>
        </div>
      </div>
    ),
  },
  aqua: {
    company: "Aqua Bloom",
    layout: "split",
    palette: light("#0e7c86", { headBg: "#e6f4f5", headInk: "#0e7c86" }),
    logo: (p) => (
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: p.accent, fontStyle: "italic" }}>
          aqua<span style={{ color: "#1a1a1a" }}>bloom</span>
        </div>
        <div style={{ height: 2, width: 40, background: p.accent, borderRadius: 2, marginTop: 2 }} />
      </div>
    ),
  },
  aurora: {
    company: "North Pine",
    layout: "banner",
    palette: light("#26413c", { headBg: "#26413c", headInk: "#ffffff" }),
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ fontSize: 17, color: p.headInk }}>▲</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: p.headInk }}>NORTH PINE</div>
          <div style={{ fontSize: 7.5, letterSpacing: 3, color: "#9db8b2" }}>OUTFITTERS</div>
        </div>
      </div>
    ),
  },
  epoch: {
    company: "Epoch Studio",
    layout: "banner",
    palette: light("#111111", { headBg: "#111111", headInk: "#ffffff" }),
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: p.headInk, letterSpacing: 1 }}>EPOCH</div>
        <div style={{ fontSize: 9.5, color: "#bbbbbb", letterSpacing: 2 }}>STUDIO</div>
      </div>
    ),
  },
  leo: {
    company: "Leo's Bakery",
    layout: "centered",
    palette: light("#8a5a2b", { headBg: "#1a1a1a", headInk: "#ffffff" }),
    logo: (p) => (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 26,
            height: 26,
            margin: "0 auto",
            border: `1.5px solid ${p.ink}`,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, serif",
            fontSize: 15,
            fontWeight: 700,
            color: p.ink,
          }}
        >
          L
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, marginTop: 2, color: p.ink }}>
          LEO&apos;S BAKERY
        </div>
        <div style={{ fontSize: 7, letterSpacing: 3, color: p.sub }}>EST. 2004</div>
      </div>
    ),
  },
  ocean: {
    company: "Ocean Crate",
    layout: "sidebar",
    palette: {
      bg: "#0d1b2a",
      ink: "#f2f5f7",
      sub: "#8fa3b3",
      line: "#22364a",
      accent: "#57c4e5",
      headBg: "#13263a",
      headInk: "#f2f5f7",
    },
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ fontSize: 15, color: p.accent }}>≋</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: p.ink }}>OCEAN CRATE</div>
          <div style={{ fontSize: 7.5, letterSpacing: 2, color: p.sub }}>SEAFOOD MARKET</div>
        </div>
      </div>
    ),
  },
  retro: {
    company: "Retro Roast",
    layout: "banner",
    palette: light("#c0392b", { headBg: "#191919", headInk: "#f5e9d6" }),
    logo: (p) => (
      <div
        style={{
          display: "inline-block",
          border: `1.5px solid ${p.headInk}`,
          borderRadius: 4,
          padding: "3px 8px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: p.headInk }}>RETRO ROAST</div>
        <div style={{ fontSize: 7, letterSpacing: 3, color: "#b8a98c" }}>★ COFFEE CO. ★</div>
      </div>
    ),
  },
  rhythm: {
    company: "Rhythm Goods",
    layout: "classic",
    palette: light("#5b3ea6", { headBg: "#f0ecfa", headInk: "#5b3ea6" }),
    logo: (p) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 16 }}>
          {[7, 12, 9, 15].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: p.accent, borderRadius: 1 }} />
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: p.ink }}>RHYTHM</div>
          <div style={{ fontSize: 7.5, letterSpacing: 2, color: p.sub }}>MUSIC GOODS</div>
        </div>
      </div>
    ),
  },
};

const ITEMS = [
  { name: "Pink Champagne Cookies", detail: "Medium / White", sku: "PNCHSKU138", qty: "x1", price: "$90.00" },
  { name: "Vegan Friendly Cupcakes", detail: "Brown / Large", sku: "VGN131", qty: "x1", price: "$22.50" },
];

const TOTALS = [
  { label: "SUB TOTAL", value: "$125.00" },
  { label: "DISCOUNT", value: "- $12.50" },
  { label: "SHIPPING", value: "$6.98" },
  { label: "TAX", value: "$4.28" },
];

function AddressBlock({ title, p }: { title: string; p: Palette }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1, color: p.ink, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 7.5, color: p.sub, lineHeight: 1.5 }}>
        Chuck Woods
        <br />
        355 East Front Street
        <br />
        Evergreen, AL 36401
        <br />
        (251) 578-7599
      </div>
    </div>
  );
}

function ItemsTable({ p }: { p: Palette }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1.5fr 0.7fr 1.2fr",
          gap: 3,
          background: p.headBg,
          color: p.headInk,
          padding: "3px 5px",
          fontSize: 7.5,
          fontWeight: 800,
          letterSpacing: 0.5,
          borderRadius: 2,
        }}
      >
        <div>ITEM</div>
        <div>SKU</div>
        <div>QTY</div>
        <div style={{ textAlign: "right" }}>TOTAL</div>
      </div>
      {ITEMS.map((item) => (
        <div
          key={item.sku}
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1.5fr 0.7fr 1.2fr",
            gap: 3,
            padding: "4px 5px",
            borderBottom: `1px solid ${p.line}`,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <div style={{ width: 22, height: 22, flexShrink: 0 }}>
              <ProductIcon color={p.accent} />
            </div>
            <div>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: p.ink }}>{item.name}</div>
              <div style={{ fontSize: 7, color: p.sub }}>{item.detail}</div>
            </div>
          </div>
          <div style={{ fontSize: 7, color: p.sub }}>{item.sku}</div>
          <div style={{ fontSize: 7, color: p.sub }}>{item.qty}</div>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: p.ink, textAlign: "right" }}>{item.price}</div>
        </div>
      ))}
    </div>
  );
}

function TotalsBlock({ p, boxed }: { p: Palette; boxed?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
      <div style={{ width: "45%" }}>
        {TOTALS.map((t) => (
          <div
            key={t.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 7.5,
              color: p.sub,
              padding: "2px 4px",
              borderBottom: `1px solid ${p.line}`,
            }}
          >
            <span>{t.label}</span>
            <span style={{ color: p.ink }}>{t.value}</span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 9.5,
            fontWeight: 800,
            padding: "3px 4px",
            marginTop: 2,
            background: boxed ? p.headBg : "transparent",
            color: boxed ? p.headInk : p.ink,
            borderRadius: 2,
          }}
        >
          <span>TOTAL</span>
          <span>$111.26</span>
        </div>
      </div>
    </div>
  );
}

function Footer({ p }: { p: Palette }) {
  return (
    <div style={{ marginTop: 8, paddingTop: 5, borderTop: `1px solid ${p.line}` }}>
      <div style={{ fontSize: 7.5, fontWeight: 800, color: p.ink, marginBottom: 1 }}>Thanks for your business</div>
      <div style={{ fontSize: 7, color: p.sub, lineHeight: 1.4 }}>
        We truly appreciate your trust and look forward to serving you again.
      </div>
      <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: p.line }} />
        ))}
      </div>
    </div>
  );
}

function MetaBlock({ p, align }: { p: Palette; align?: "right" | "left" }) {
  return (
    <div style={{ textAlign: align === "right" ? "right" : "left" }}>
      {[
        ["ORDER NO", "#1001"],
        ["INVOICE NO", "INV-1000"],
        ["ORDER DATE", "21 Nov, 2026"],
      ].map(([label, value]) => (
        <div key={label} style={{ marginBottom: 3 }}>
          <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: 1, color: p.sub }}>{label}</div>
          <div style={{ fontSize: 8, fontWeight: 700, color: p.ink }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

export function TemplatePreview({ templateId, height = 480 }: { templateId: string; height?: number }) {
  const config = CONFIGS[templateId] || CONFIGS.pure;
  const p = config.palette;

  const frame: CSSProperties = {
    width: "100%",
    height,
    background: p.bg,
    borderRadius: 8,
    border: `1px solid ${p.line}`,
    padding: 14,
    fontFamily: "system-ui, -apple-system, sans-serif",
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const invoiceTitle = (color?: string) => (
    <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, color: color || p.ink }}>INVOICE</div>
  );

  switch (config.layout) {
    case "banner":
      return (
        <div style={frame}>
          <div
            style={{
              background: p.headBg,
              borderRadius: 4,
              padding: "8px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            {config.logo(p)}
            {invoiceTitle(p.headInk)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <AddressBlock title="SHIP TO" p={p} />
            <AddressBlock title="BILL TO" p={p} />
            <MetaBlock p={p} align="right" />
          </div>
          <ItemsTable p={p} />
          <TotalsBlock p={p} boxed />
          <Footer p={p} />
        </div>
      );

    case "centered":
      return (
        <div style={frame}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{config.logo(p)}</div>
          <div
            style={{
              background: p.headBg,
              color: p.headInk,
              textAlign: "center",
              padding: "4px 0",
              borderRadius: 3,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: 3 }}>INVOICE</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <AddressBlock title="SHIP TO" p={p} />
            <AddressBlock title="BILL TO" p={p} />
            <MetaBlock p={p} align="right" />
          </div>
          <ItemsTable p={p} />
          <TotalsBlock p={p} boxed />
          <Footer p={p} />
        </div>
      );

    case "split":
      return (
        <div style={frame}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            {config.logo(p)}
            <div style={{ textAlign: "right" }}>
              {invoiceTitle(p.accent)}
              <div style={{ fontSize: 7, color: p.sub, marginTop: 1 }}>2026-11-21 13:42:39</div>
            </div>
          </div>
          <div style={{ height: 2, background: p.accent, borderRadius: 2, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <AddressBlock title="SHIP TO" p={p} />
            <AddressBlock title="BILL TO" p={p} />
            <MetaBlock p={p} align="right" />
          </div>
          <ItemsTable p={p} />
          <TotalsBlock p={p} />
          <Footer p={p} />
        </div>
      );

    case "sidebar":
      return (
        <div style={{ ...frame, display: "flex", gap: 10, padding: 0 }}>
          <div style={{ width: "30%", background: p.headBg, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {config.logo(p)}
            <AddressBlock title="SHIP TO" p={p} />
            <AddressBlock title="BILL TO" p={p} />
          </div>
          <div style={{ flex: 1, padding: "12px 12px 12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {invoiceTitle(p.accent)}
              <MetaBlock p={p} align="right" />
            </div>
            <ItemsTable p={p} />
            <TotalsBlock p={p} />
            <Footer p={p} />
          </div>
        </div>
      );

    case "classic":
    default:
      return (
        <div style={frame}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            {config.logo(p)}
            <div style={{ textAlign: "right", fontSize: 7, color: p.sub, lineHeight: 1.5 }}>
              {config.company}
              <br />
              Keizersgracht 482, Amsterdam
              <br />
              hello@{config.company.toLowerCase().replace(/[^a-z]/g, "")}.com
            </div>
          </div>
          <div style={{ borderBottom: `2px solid ${p.ink}`, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              {invoiceTitle()}
              <div style={{ marginTop: 4 }}>
                <MetaBlock p={p} />
              </div>
            </div>
            <AddressBlock title="SHIP TO" p={p} />
            <AddressBlock title="BILL TO" p={p} />
          </div>
          <ItemsTable p={p} />
          <TotalsBlock p={p} />
          <Footer p={p} />
        </div>
      );
  }
}
