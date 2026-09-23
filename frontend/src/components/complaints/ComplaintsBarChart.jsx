import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComplaintsBarChart({ statusCounts }) {
  const data = statusCounts
    ? [
        { status: "Open",        count: statusCounts.OPEN,        fill: "#f97316" },
        { status: "In Progress", count: statusCounts.IN_PROGRESS, fill: "#eab308" },
        { status: "Closed",      count: statusCounts.CLOSED,      fill: "#22c55e" },
        { status: "Reopened",    count: statusCounts.REOPENED,    fill: "#a855f7" },
        ...(statusCounts.CANCELLED ? [{ status: "Cancelled", count: statusCounts.CANCELLED, fill: "#6b7280" }] : []),
      ]
    : [];

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-800">Complaints by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
              cursor={{ fill: "#f8fafc" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
