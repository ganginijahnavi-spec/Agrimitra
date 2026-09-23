"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarketTrendPoint } from "@/lib/market";

export function MarketTrendChart({ trend }: { trend: MarketTrendPoint[] }) {
  const t = useTranslations("Market");
  const format = useFormatter();

  const data = trend.map((point) => ({
    date: point.date,
    label: format.dateTime(new Date(point.date), { month: "short", day: "numeric" }),
    price: point.modalPrice,
  }));

  const first = data[0];
  const last = data[data.length - 1];
  const summary =
    first && last
      ? t("trendSrSummary", {
          first: first.price,
          firstDate: first.label,
          last: last.price,
          lastDate: last.label,
        })
      : undefined;

  return (
    <div className="h-64 w-full" role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%" aria-hidden="true">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" fontSize={12} tickLine={false} />
          <YAxis fontSize={12} tickLine={false} width={48} />
          <Tooltip
            formatter={(value) => [`₹${value}`, "Modal price"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              backgroundColor: "var(--popover)",
              color: "var(--popover-foreground)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
