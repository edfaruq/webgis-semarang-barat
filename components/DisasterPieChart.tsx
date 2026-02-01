"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export type DisasterCount = { name: string; value: number; fill: string };

const DISASTER_COLORS: Record<string, string> = {
  flood: "#3b82f6",
  landslide: "#22c55e",
};

function getColor(disasterType: string): string {
  return DISASTER_COLORS[disasterType] ?? "#94a3b8";
}

export default function DisasterPieChart({ data }: { data: { disasterType: string; _count: number }[] }) {
  const chartData: DisasterCount[] = data.map((d) => ({
    name: d.disasterType.charAt(0).toUpperCase() + d.disasterType.slice(1),
    value: d._count,
    fill: getColor(d.disasterType),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm">
        Belum ada data laporan
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} laporan`, "Jumlah"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
