import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LiftDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Lift Not Working",
      resident: "Arjun",
      flat: "A-201",
      status: "Pending",
    },
    {
      id: 2,
      title: "Lift Stuck",
      resident: "Meena",
      flat: "B-102",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Door Sensor Issue",
      resident: "Ravi",
      flat: "C-303",
      status: "Pending",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    const updated = complaints.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c,
    );
    setComplaints(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Sunshine Apartments - Lift Technician Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-left">
          <thead className="border-b text-gray-600 text-sm">
            <tr>
              <th className="py-3">Issue</th>
              <th>Resident</th>
              <th>Flat</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.title}</td>
                <td>{item.resident}</td>
                <td>{item.flat}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs
                    ${item.status === "Pending" && "bg-yellow-100 text-yellow-600"}
                    ${item.status === "In Progress" && "bg-blue-100 text-blue-600"}
                    ${item.status === "Completed" && "bg-green-100 text-green-600"}
                  `}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="flex gap-2">
                  <button
                    onClick={() => navigate(`/lift/complaint/${item.id}`)}
                    className="text-blue-600 text-sm underline"
                  >
                    View
                  </button>

                  <button
                    onClick={() => updateStatus(item.id, "In Progress")}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
                  >
                    Start
                  </button>

                  <button
                    onClick={() => updateStatus(item.id, "Completed")}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded"
                  >
                    Complete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LiftDashboard;
