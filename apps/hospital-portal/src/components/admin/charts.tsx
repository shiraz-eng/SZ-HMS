"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRIMARY = "rgb(var(--color-primary))";
const AXIS = "rgb(var(--color-muted-fg))";
const GRID = "rgb(var(--color-border))";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function RevenueBarChart({ data }: { data: { day: string; cents: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v: number) => money(v)}
        />
        <Tooltip
          cursor={{ fill: "rgb(var(--color-muted))" }}
          formatter={(v: number) => [money(v), "Revenue"]}
          contentStyle={{
            background: "rgb(var(--color-surface))",
            border: `1px solid ${GRID}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="cents" fill={PRIMARY} radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UtilisationBarChart({
  data,
}: {
  data: { name: string; pct: number; booked: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          stroke={AXIS}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={AXIS}
          fontSize={11}
          width={80}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgb(var(--color-muted))" }}
          formatter={(v: number) => [`${v}%`, "Utilisation"]}
          contentStyle={{
            background: "rgb(var(--color-surface))",
            border: `1px solid ${GRID}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="pct" fill={PRIMARY} radius={[0, 3, 3, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const OCC_COLORS: Record<string, string> = {
  Occupied: "rgb(var(--color-primary))",
  Available: "rgb(var(--color-success))",
  Cleaning: "rgb(var(--color-warning))",
  "Out of service": "rgb(var(--color-muted-fg))",
};

export function OccupancyDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const shown = data.filter((d) => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={shown}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="none"
        >
          {shown.map((d) => (
            <Cell key={d.name} fill={OCC_COLORS[d.name] ?? PRIMARY} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, n: string) => [`${v} beds`, n]}
          contentStyle={{
            background: "rgb(var(--color-surface))",
            border: `1px solid ${GRID}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
