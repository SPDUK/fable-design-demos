import { useMemo, useState } from "react";
import "./SaasAnalyticsDashboardPage.css";

/*
DESIGN BRIEF
Product ......... Plinth, a product analytics command center for mid-size e-commerce teams.
Feeling ......... precise, composed, accountable.
Direction ....... Refined SaaS Light fused with Premium Dark Tech for the tinted dark mode.
Palette ......... bg #f7f8fb / surface #ffffff / text #151922 / muted #657084 / accent #2368f5.
Type ............ Space Grotesk for compact app UI, Space Mono for axes and figures.
Spatial ......... 8px grid, 4-8px radii, dense dashboard shell with hairline discipline.
Motion .......... snappy controls, quiet chart draw-ins, no marketing scroll theater.
Concept ......... A merchandising control ledger where every panel can be audited by state.
Signature ....... Each analytics module has live/loading/empty/error states without layout shift.
*/

const kpis = [
  {
    label: "Attributed revenue",
    value: "$1.84M",
    delta: "+12.4%",
    tone: "positive",
    detail: "vs prior period",
    spark: [18, 20, 19, 26, 31, 29, 38, 42, 49, 55],
  },
  {
    label: "Conversion rate",
    value: "4.82%",
    delta: "+0.38 pt",
    tone: "positive",
    detail: "checkout started",
    spark: [29, 28, 31, 30, 34, 33, 37, 41, 40, 44],
  },
  {
    label: "Blended CAC",
    value: "$38.14",
    delta: "-8.1%",
    tone: "positive",
    detail: "paid + affiliate",
    spark: [64, 61, 58, 54, 51, 49, 45, 41, 40, 36],
  },
  {
    label: "Refund leakage",
    value: "$42.6K",
    delta: "+3.6%",
    tone: "negative",
    detail: "quality flags",
    spark: [18, 16, 19, 22, 20, 27, 29, 31, 30, 34],
  },
];

const revenueSeries = [
  { label: "Jun 1", revenue: 142, target: 132 },
  { label: "Jun 2", revenue: 151, target: 137 },
  { label: "Jun 3", revenue: 148, target: 139 },
  { label: "Jun 4", revenue: 166, target: 146 },
  { label: "Jun 5", revenue: 172, target: 151 },
  { label: "Jun 6", revenue: 184, target: 158 },
  { label: "Jun 7", revenue: 178, target: 162 },
  { label: "Jun 8", revenue: 196, target: 168 },
  { label: "Jun 9", revenue: 214, target: 174 },
  { label: "Jun 10", revenue: 208, target: 179 },
  { label: "Jun 11", revenue: 231, target: 184 },
  { label: "Jun 12", revenue: 248, target: 190 },
];

const funnelSteps = [
  { label: "Sessions", value: 100, count: "382.4K", delta: "+9.1%" },
  { label: "Product views", value: 72, count: "275.8K", delta: "+6.4%" },
  { label: "Add to cart", value: 31, count: "118.6K", delta: "+2.8%" },
  { label: "Checkout", value: 18, count: "68.9K", delta: "-1.3%" },
  { label: "Purchased", value: 11, count: "42.1K", delta: "+4.7%" },
];

const cohorts = [
  { cohort: "May 27", size: "18,240", values: [100, 42, 31, 24, 20, 16, 13, 11] },
  { cohort: "May 20", size: "17,882", values: [100, 40, 29, 23, 18, 15, 12, 10] },
  { cohort: "May 13", size: "16,506", values: [100, 39, 30, 22, 17, 14, 12, 9] },
  { cohort: "May 06", size: "15,913", values: [100, 37, 28, 21, 16, 13, 10, 8] },
  { cohort: "Apr 29", size: "14,778", values: [100, 36, 26, 20, 15, 12, 10, 8] },
  { cohort: "Apr 22", size: "13,991", values: [100, 35, 25, 19, 14, 11, 9, 7] },
];

const channelMix = [
  { channel: "Paid social", revenue: "$612K", roas: "3.9x", share: "33%", health: "Stable" },
  { channel: "Search", revenue: "$418K", roas: "5.4x", share: "23%", health: "Scaling" },
  { channel: "Email", revenue: "$331K", roas: "18.2x", share: "18%", health: "Stable" },
  { channel: "Affiliate", revenue: "$204K", roas: "4.6x", share: "11%", health: "Watch" },
];

const navItems = ["Overview", "Funnels", "Cohorts", "Campaigns", "Reports"];
const ranges = ["7D", "14D", "30D", "90D"];
const chartStates = [
  { key: "ready", label: "Live" },
  { key: "loading", label: "Load" },
  { key: "empty", label: "Empty" },
  { key: "error", label: "Error" },
];

function Icon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M10 21h4" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M4 10h16" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    moon: (
      <path d="M21 13a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10Z" />
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.9 4.9 1.4 1.4" />
        <path d="m17.7 17.7 1.4 1.4" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m4.9 19.1 1.4-1.4" />
        <path d="m17.7 6.3 1.4-1.4" />
      </>
    ),
    retry: (
      <>
        <path d="M20 12a8 8 0 1 1-2.3-5.7" />
        <path d="M20 4v6h-6" />
      </>
    ),
    spark: (
      <>
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="plinth-icon" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function pointsFor(values, width, height, padding = 4) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function pathFor(values, width, height, padding = 18) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function KpiCard({ item }) {
  const sparkPoints = pointsFor(item.spark, 96, 34);

  return (
    <article className="plinth-kpi" tabIndex="0">
      <div className="plinth-kpi__top">
        <span>{item.label}</span>
        <span className={`plinth-delta is-${item.tone}`}>{item.delta}</span>
      </div>
      <strong>{item.value}</strong>
      <div className="plinth-kpi__bottom">
        <span>{item.detail}</span>
        <svg viewBox="0 0 96 34" role="img" aria-label={`${item.label} trend`}>
          <polyline pathLength="1" points={sparkPoints} />
        </svg>
      </div>
    </article>
  );
}

function StateTabs({ value, onChange, label }) {
  return (
    <div className="plinth-state-tabs" aria-label={`${label} state`}>
      {chartStates.map((state) => (
        <button
          aria-pressed={value === state.key}
          className={value === state.key ? "is-active" : ""}
          key={state.key}
          onClick={() => onChange(state.key)}
          type="button"
        >
          {state.label}
        </button>
      ))}
    </div>
  );
}

function PanelState({ state, title, action }) {
  if (state === "loading") {
    return (
      <div className="plinth-chart-state is-loading" aria-label={`${title} is loading`}>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="plinth-chart-state">
        <Icon name="spark" />
        <strong>No matching data</strong>
        <p>Try broadening the segment or extending the date range.</p>
        <button type="button">{action}</button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="plinth-chart-state is-error" role="alert">
        <Icon name="retry" />
        <strong>Source sync failed</strong>
        <p>Shopify orders loaded, but ad spend timed out at 09:42.</p>
        <button type="button">Retry sync</button>
      </div>
    );
  }

  return null;
}

function RevenueChart({ state }) {
  const revenuePath = pathFor(
    revenueSeries.map((point) => point.revenue),
    720,
    250,
  );
  const targetPath = pathFor(
    revenueSeries.map((point) => point.target),
    720,
    250,
  );
  const areaPath = `${revenuePath} L 720 250 L 0 250 Z`;

  if (state !== "ready") {
    return <PanelState action="Reset filters" state={state} title="Revenue chart" />;
  }

  return (
    <div className="plinth-revenue-chart" role="img" aria-label="Attributed revenue is tracking 31 percent above target over the selected period">
      <svg viewBox="0 0 720 250" preserveAspectRatio="none">
        {[48, 96, 144, 192, 240].map((y) => (
          <line key={y} x1="0" x2="720" y1={y} y2={y} />
        ))}
        <path className="plinth-area" d={areaPath} />
        <path className="plinth-target" d={targetPath} pathLength="1" />
        <path className="plinth-primary-line" d={revenuePath} pathLength="1" />
        {revenueSeries.map((point, index) => {
          if (index < revenueSeries.length - 1 && index !== 8) return null;
          const x = (index / (revenueSeries.length - 1)) * 720;
          const values = revenueSeries.map((item) => item.revenue);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const y = 250 - 18 - ((point.revenue - min) / (max - min)) * (250 - 36);
          return <circle className="plinth-point" cx={x} cy={y} key={point.label} r="4" />;
        })}
      </svg>
      <div className="plinth-axis x">
        {["Jun 1", "Jun 4", "Jun 7", "Jun 10", "Jun 12"].map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="plinth-float-note">
        <span>Peak lift</span>
        <strong>$248K</strong>
      </div>
    </div>
  );
}

function FunnelChart({ state }) {
  if (state !== "ready") {
    return <PanelState action="Use all sessions" state={state} title="Funnel chart" />;
  }

  return (
    <div className="plinth-funnel-chart" role="img" aria-label="Purchase funnel keeps 11 percent of sessions through purchase">
      {funnelSteps.map((step, index) => (
        <div className="plinth-funnel-step" key={step.label} style={{ "--bar": `${step.value}%`, "--delay": `${index * 70}ms` }}>
          <div>
            <span>{step.label}</span>
            <strong>{step.count}</strong>
          </div>
          <div className="plinth-funnel-track">
            <span />
          </div>
          <em className={step.delta.startsWith("-") ? "is-negative" : ""}>{step.delta}</em>
        </div>
      ))}
    </div>
  );
}

function CohortTable({ state }) {
  if (state !== "ready") {
    return <PanelState action="Clear segment" state={state} title="Cohort retention table" />;
  }

  return (
    <div className="plinth-cohort-wrap">
      <table className="plinth-cohort-table">
        <caption>Retention by first purchase week</caption>
        <thead>
          <tr>
            <th scope="col">Cohort</th>
            <th scope="col">Customers</th>
            {["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7"].map((week) => (
              <th scope="col" key={week}>{week}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((row) => (
            <tr key={row.cohort}>
              <th scope="row">{row.cohort}</th>
              <td>{row.size}</td>
              {row.values.map((value, index) => (
                <td key={`${row.cohort}-${index}`}>
                  <span className="plinth-heat" style={{ "--heat": value / 100 }}>
                    {value}%
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Panel({ title, eyebrow, metric, state, onStateChange, children }) {
  return (
    <section className="plinth-panel" aria-labelledby={`${title.replaceAll(" ", "-")}-title`}>
      <div className="plinth-panel__header">
        <div>
          <span className="plinth-eyebrow">{eyebrow}</span>
          <h2 id={`${title.replaceAll(" ", "-")}-title`}>{title}</h2>
        </div>
        <div className="plinth-panel__tools">
          {metric ? <strong>{metric}</strong> : null}
          <StateTabs label={title} onChange={onStateChange} value={state} />
        </div>
      </div>
      <div className="plinth-panel__body">{children}</div>
    </section>
  );
}

export function SaasAnalyticsDashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [range, setRange] = useState("30D");
  const [revenueState, setRevenueState] = useState("ready");
  const [funnelState, setFunnelState] = useState("ready");
  const [cohortState, setCohortState] = useState("ready");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const rangeLabel = useMemo(() => {
    const today = new Date("2026-06-11T12:00:00");
    const days = Number.parseInt(range, 10);
    const start = new Date(today);
    start.setDate(today.getDate() - days + 1);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }, [range]);

  return (
    <div className={`plinth ${darkMode ? "is-dark" : ""}`}>
      <aside className={`plinth-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="plinth-brand" aria-label="Plinth">
          <span>Pl</span>
          <strong>Plinth</strong>
        </div>

        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              aria-current={activeNav === item ? "page" : undefined}
              className={activeNav === item ? "is-active" : ""}
              key={item}
              onClick={() => {
                setActiveNav(item);
                setMobileNavOpen(false);
              }}
              type="button"
            >
              <span>{item.slice(0, 2)}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="plinth-sidebar__card">
          <span className="plinth-eyebrow">Sync health</span>
          <strong>9 sources live</strong>
          <p>Last warehouse refresh completed 4 minutes ago.</p>
        </div>
      </aside>

      <div className="plinth-workspace">
        <header className="plinth-topbar">
          <button
            aria-expanded={mobileNavOpen}
            aria-label="Toggle navigation"
            className="plinth-icon-button plinth-mobile-menu"
            onClick={() => setMobileNavOpen((open) => !open)}
            type="button"
          >
            <Icon name="menu" />
          </button>

          <label className="plinth-search">
            <Icon name="search" />
            <input placeholder="Search customers, SKUs, campaigns" type="search" />
          </label>

          <div className="plinth-topbar__actions">
            <button className="plinth-icon-button" aria-label="Notifications" type="button">
              <Icon name="bell" />
            </button>
            <button
              className="plinth-mode-toggle"
              onClick={() => setDarkMode((mode) => !mode)}
              type="button"
            >
              <Icon name={darkMode ? "sun" : "moon"} />
              <span>{darkMode ? "Light" : "Dark"}</span>
            </button>
            <button className="plinth-avatar" aria-label="Open account menu" type="button">
              AC
            </button>
          </div>
        </header>

        <main className="plinth-main">
          <section className="plinth-title-row" aria-labelledby="plinth-page-title">
            <div>
              <span className="plinth-eyebrow">Commerce analytics</span>
              <h1 id="plinth-page-title">Growth overview</h1>
              <p>Revenue, retention, and funnel quality for the North America storefront.</p>
            </div>

            <div className="plinth-filter-deck">
              <div className="plinth-date-control">
                <Icon name="calendar" />
                <span>{rangeLabel}</span>
              </div>
              <div className="plinth-segmented" aria-label="Date range">
                {ranges.map((item) => (
                  <button
                    aria-pressed={range === item}
                    className={range === item ? "is-active" : ""}
                    key={item}
                    onClick={() => setRange(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button className="plinth-filter-button" type="button">
                <Icon name="filter" />
                Filter
              </button>
            </div>
          </section>

          <section className="plinth-kpi-grid" aria-label="Key performance indicators">
            {kpis.map((item) => (
              <KpiCard item={item} key={item.label} />
            ))}
          </section>

          <div className="plinth-grid">
            <Panel
              eyebrow="Revenue"
              metric="+31% vs target"
              onStateChange={setRevenueState}
              state={revenueState}
              title="Attributed revenue"
            >
              <RevenueChart state={revenueState} />
            </Panel>

            <Panel
              eyebrow="Funnel"
              metric="11.0% purchase"
              onStateChange={setFunnelState}
              state={funnelState}
              title="Session to purchase"
            >
              <FunnelChart state={funnelState} />
            </Panel>

            <Panel
              eyebrow="Retention"
              metric="W4 16.7%"
              onStateChange={setCohortState}
              state={cohortState}
              title="Cohort retention"
            >
              <CohortTable state={cohortState} />
            </Panel>

            <section className="plinth-panel plinth-channel-panel" aria-labelledby="channel-title">
              <div className="plinth-panel__header">
                <div>
                  <span className="plinth-eyebrow">Channels</span>
                  <h2 id="channel-title">Revenue mix</h2>
                </div>
                <button className="plinth-text-button" type="button">Export CSV</button>
              </div>
              <div className="plinth-channel-list">
                {channelMix.map((row) => (
                  <article key={row.channel} tabIndex="0">
                    <div>
                      <strong>{row.channel}</strong>
                      <span>{row.health}</span>
                    </div>
                    <span>{row.revenue}</span>
                    <span>{row.roas}</span>
                    <em>{row.share}</em>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
