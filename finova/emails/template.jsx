import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

// ─── Inline styles (React Email works best with plain objects) ───────────────

const main = {
  backgroundColor: "#f4f7fb",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const logo = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#4f46e5",
  marginBottom: "8px",
};

const tagline = {
  fontSize: "13px",
  color: "#9ca3af",
  marginTop: "0",
  marginBottom: "32px",
};

const greeting = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#111827",
  marginBottom: "8px",
};

const bodyText = {
  fontSize: "15px",
  color: "#4b5563",
  lineHeight: "1.6",
  marginBottom: "24px",
};

const alertBox = (pct) => ({
  backgroundColor: pct >= 100 ? "#fef2f2" : pct >= 90 ? "#fff7ed" : "#fffbeb",
  border: `1px solid ${pct >= 100 ? "#fca5a5" : pct >= 90 ? "#fdba74" : "#fcd34d"}`,
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "24px",
});

const alertHeading = (pct) => ({
  fontSize: "15px",
  fontWeight: "700",
  color: pct >= 100 ? "#dc2626" : pct >= 90 ? "#ea580c" : "#d97706",
  marginTop: "0",
  marginBottom: "8px",
});

const progressBarOuter = {
  backgroundColor: "#e5e7eb",
  borderRadius: "99px",
  height: "10px",
  overflow: "hidden",
  marginTop: "12px",
  marginBottom: "4px",
};

const statsGrid = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "24px",
};

const statLabel = {
  fontSize: "12px",
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "4px",
  marginTop: "0",
};

const statValue = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111827",
  marginTop: "0",
  marginBottom: "0",
};

const insightBox = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "12px",
};

const insightText = {
  fontSize: "14px",
  color: "#0c4a6e",
  margin: "0",
  lineHeight: "1.5",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center",
  lineHeight: "1.6",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formats a number as USD currency string.
 * @param {number} n
 * @returns {string}
 */
function usd(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/**
 * Clamps a percentage to [0, 100] for the progress bar width.
 * @param {number} pct
 * @returns {string}
 */
function clampPct(pct) {
  return `${Math.min(100, Math.max(0, pct)).toFixed(1)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Header() {
  return (
    <>
      <Text style={logo}>Finova</Text>
      <Text style={tagline}>Your personal finance companion</Text>
    </>
  );
}

function Footer() {
  return (
    <>
      <Hr style={divider} />
      <Text style={footer}>
        You're receiving this email because you have an active Finova account.
        <br />
        © {new Date().getFullYear()} Finova. All rights reserved.
      </Text>
    </>
  );
}

// ─── Budget Alert Template ────────────────────────────────────────────────────

function BudgetAlertEmail({ userName, data }) {
  const { percentUsed, budgetAmount, totalExpenses, accountName } = data;
  const pct = parseFloat(percentUsed.toFixed(1));
  const remaining = budgetAmount - totalExpenses;

  const statusLabel =
    pct >= 100
      ? "⛔ Budget Exceeded"
      : pct >= 90
      ? "🚨 Critical – Almost Exhausted"
      : "⚠️ Budget Warning";

  const progressColor =
    pct >= 100 ? "#dc2626" : pct >= 90 ? "#ea580c" : "#f59e0b";

  return (
    <Html>
      <Head />
      <Preview>
        {statusLabel}: {pct}% of your {accountName} budget used
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Header />

            <Heading style={greeting}>Hi {userName || "there"} 👋</Heading>

            <Text style={bodyText}>
              This is an automated alert for your{" "}
              <strong>{accountName}</strong> account. You've used{" "}
              <strong>{pct}%</strong> of your monthly budget.
            </Text>

            {/* Alert box */}
            <Section style={alertBox(pct)}>
              <Text style={alertHeading(pct)}>{statusLabel}</Text>
              <Text style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>
                {usd(totalExpenses)} spent of {usd(budgetAmount)} budget
              </Text>

              {/* Progress bar */}
              <div style={progressBarOuter}>
                <div
                  style={{
                    backgroundColor: progressColor,
                    width: clampPct(pct),
                    height: "10px",
                    borderRadius: "99px",
                  }}
                />
              </div>
              <Text
                style={{
                  fontSize: "12px",
                  color: "#9ca3af",
                  margin: "4px 0 0",
                  textAlign: "right",
                }}
              >
                {pct}% used
              </Text>
            </Section>

            {/* Stats grid */}
            <Section style={statsGrid}>
              <Row>
                <Column>
                  <Text style={statLabel}>Budget</Text>
                  <Text style={statValue}>{usd(budgetAmount)}</Text>
                </Column>
                <Column>
                  <Text style={statLabel}>Spent</Text>
                  <Text style={{ ...statValue, color: "#dc2626" }}>
                    {usd(totalExpenses)}
                  </Text>
                </Column>
                <Column>
                  <Text style={statLabel}>Remaining</Text>
                  <Text
                    style={{
                      ...statValue,
                      color: remaining >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {usd(Math.abs(remaining))}
                    {remaining < 0 ? " over" : ""}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={bodyText}>
              {pct >= 100
                ? "You've exceeded your budget for this month. Consider reviewing your recent transactions to identify areas where you can cut back."
                : "Consider reviewing your spending to stay within your monthly target. Small adjustments now can make a big difference by month end."}
            </Text>

            <Footer />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Monthly Report Template ──────────────────────────────────────────────────

function MonthlyReportEmail({ userName, data }) {
  const { month, stats, insights } = data;
  const net = stats.totalIncome - stats.totalExpenses;
  const isPositive = net >= 0;

  // Sort categories by spend descending, show top 5
  const topCategories = Object.entries(stats.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Html>
      <Head />
      <Preview>
        Your {month} financial report — Net {isPositive ? "+" : ""}
        {usd(net)}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Header />

            <Heading style={greeting}>
              Your {month} Report 📊
            </Heading>

            <Text style={bodyText}>
              Hi {userName || "there"}, here's a summary of your financial
              activity for <strong>{month}</strong>. You had{" "}
              <strong>{stats.transactionCount} transaction
              {stats.transactionCount !== 1 ? "s" : ""}</strong> this month.
            </Text>

            {/* Summary stats */}
            <Section style={statsGrid}>
              <Row>
                <Column>
                  <Text style={statLabel}>Income</Text>
                  <Text style={{ ...statValue, color: "#16a34a" }}>
                    {usd(stats.totalIncome)}
                  </Text>
                </Column>
                <Column>
                  <Text style={statLabel}>Expenses</Text>
                  <Text style={{ ...statValue, color: "#dc2626" }}>
                    {usd(stats.totalExpenses)}
                  </Text>
                </Column>
                <Column>
                  <Text style={statLabel}>Net</Text>
                  <Text
                    style={{
                      ...statValue,
                      color: isPositive ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {isPositive ? "+" : ""}
                    {usd(net)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Top spending categories */}
            {topCategories.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  Top Spending Categories
                </Text>

                {topCategories.map(([category, amount]) => {
                  const pct =
                    stats.totalExpenses > 0
                      ? (amount / stats.totalExpenses) * 100
                      : 0;
                  return (
                    <Row
                      key={category}
                      style={{ marginBottom: "10px", alignItems: "center" }}
                    >
                      <Column style={{ width: "40%" }}>
                        <Text
                          style={{
                            fontSize: "13px",
                            color: "#374151",
                            margin: 0,
                            textTransform: "capitalize",
                          }}
                        >
                          {category.replace(/_/g, " ")}
                        </Text>
                      </Column>
                      <Column style={{ width: "35%" }}>
                        <div style={progressBarOuter}>
                          <div
                            style={{
                              backgroundColor: "#6366f1",
                              width: clampPct(pct),
                              height: "10px",
                              borderRadius: "99px",
                            }}
                          />
                        </div>
                      </Column>
                      <Column style={{ width: "25%", textAlign: "right" }}>
                        <Text
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#111827",
                            margin: 0,
                          }}
                        >
                          {usd(amount)}
                        </Text>
                      </Column>
                    </Row>
                  );
                })}

                <Hr style={{ ...divider, margin: "24px 0" }} />
              </>
            )}

            {/* AI insights */}
            {insights && insights.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  💡 AI-Powered Insights
                </Text>

                {insights.map((insight, i) => (
                  <Section key={i} style={insightBox}>
                    <Text style={insightText}>
                      <strong>{i + 1}.</strong> {insight}
                    </Text>
                  </Section>
                ))}
              </>
            )}

            <Footer />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Unified email template component.
 *
 * @param {{
 *   userName: string,
 *   type: "budget-alert" | "monthly-report",
 *   data: object
 * }} props
 */
export default function EmailTemplate({ userName, type, data }) {
  if (type === "budget-alert") {
    return <BudgetAlertEmail userName={userName} data={data} />;
  }

  if (type === "monthly-report") {
    return <MonthlyReportEmail userName={userName} data={data} />;
  }

  // Fallback – should never reach here in production
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <Text>Unknown email type: {type}</Text>

        </Container>
      </Body>
    </Html>
  );
}
