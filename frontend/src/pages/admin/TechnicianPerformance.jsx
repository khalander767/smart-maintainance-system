import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TechnicianPerformance() {
  const { name } = useParams();

  const data = [
    { month: "Jan", completed: 12 },
    { month: "Feb", completed: 18 },
    { month: "Mar", completed: 10 },
    { month: "Apr", completed: 22 },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{name} Performance</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}

export default TechnicianPerformance;
