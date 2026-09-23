import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";

// 📊 Chart imports
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";

function CategoryTechnicians() {
  const { role } = useParams();
  const [selectedTech, setSelectedTech] = useState(null);

  // 🔧 Technician data
  const technicians = [
    { name: "Ravi Kumar", role: "Electrician" },
    { name: "Vikram Singh", role: "Electrician" },
    { name: "Suresh Reddy", role: "Plumber" },
    { name: "Manoj Kumar", role: "Plumber" },
    { name: "Amit Sharma", role: "AC Technician" },
    { name: "Kiran", role: "Carpenter" },
    { name: "Ramesh", role: "Security" },
    { name: "Ajay", role: "Lift Technician" },
  ];

  // 🔁 Convert role to slug
  const format = (text) => text.toLowerCase().replace(/\s+/g, "-");

  const filtered = technicians.filter((t) => format(t.role) === role);

  // 📊 Generate performance data
  const getPerformance = (technician) => {
    // Deterministic demo metrics keep the dashboard stable across rerenders.
    const seed = Array.from(technician.name).reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    );
    const rating = (2.5 + (seed % 26) / 10).toFixed(1);

    let verdict = "";
    let color = "";

    if (rating >= 4) {
      verdict = "Excellent";
      color = "bg-green-100 text-green-600";
    } else if (rating >= 3) {
      verdict = "Good";
      color = "bg-blue-100 text-blue-600";
    } else if (rating >= 2) {
      verdict = "Average";
      color = "bg-yellow-100 text-yellow-600";
    } else {
      verdict = "Needs Improvement";
      color = "bg-red-100 text-red-600";
    }

    return {
      handled: (seed % 50) + 10,
      resolved: (seed % 40) + 5,
      rating,
      verdict,
      color,
    };
  };

  // 📈 Weekly trend data
  const getTrendData = (technician) => {
    const seed = Array.from(technician.name).reduce(
      (total, character) => total + character.charCodeAt(0),
      0
    );
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day, index) => ({ day, value: ((seed + index * 7) % 10) + 1 })
    );
  };

  return (
    <DashboardLayout>
      {/* 🔹 Page Title */}
      <h1 className="text-2xl font-bold mb-6 capitalize">
        {role.replace("-", " ")} Technicians
      </h1>

      {/* 🔹 Table */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <table className="w-full text-left">
          <thead className="border-b text-sm text-gray-600">
            <tr>
              <th className="py-3">Name</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tech, index) => (
              <tr key={index} className="border-b">
                <td className="py-3">{tech.name}</td>

                <td>
                  <button
                    onClick={() =>
                      setSelectedTech({
                        ...tech,
                        performance: getPerformance(tech),
                        trend: getTrendData(tech),
                      })
                    }
                    className="text-blue-600 hover:underline"
                  >
                    View Performance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 Analytics Section */}
      {selectedTech && (
        <div className="bg-white p-6 rounded-xl shadow max-w-md">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTech.name} Analytics
          </h2>

          {/* 📊 Stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Handled</span>
              <span>{selectedTech.performance.handled}</span>
            </div>

            <div className="flex justify-between">
              <span>Resolved</span>
              <span>{selectedTech.performance.resolved}</span>
            </div>

            <div className="flex justify-between">
              <span>Rating</span>
              <span>{selectedTech.performance.rating} ⭐</span>
            </div>

            {/* ✅ Verdict Badge */}
            <div className="flex justify-between items-center">
              <span>Performance</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTech.performance.color}`}
              >
                {selectedTech.performance.verdict}
              </span>
            </div>
          </div>

          {/* 📈 Trend Chart */}
          <div className="mt-6">
            <h3 className="text-sm text-gray-500 mb-2">
              Weekly Performance Trend
            </h3>

            <BarChart width={300} height={150} data={selectedTech.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CategoryTechnicians;
