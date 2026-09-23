import { useParams } from "react-router-dom";

// ✅ IMPORT LIFT IMAGE
import liftImg from "../../assets/lift_problem.jpeg";

function LiftComplaintDetails() {
  const { id } = useParams();

  const complaints = [
    {
      id: 1,
      title: "Lift Not Working",
      resident: "Arjun",
      flat: "A-201",
      description: "Lift completely not working",
      image: liftImg,
    },
    {
      id: 2,
      title: "Lift Stuck",
      resident: "Meena",
      flat: "B-102",
      description: "Lift stuck between floors",
      image: liftImg,
    },
    {
      id: 3,
      title: "Door Sensor Issue",
      resident: "Ravi",
      flat: "C-303",
      description: "Lift door not closing properly",
      image: liftImg,
    },
  ];

  const complaint = complaints.find((c) => c.id === Number(id));

  if (!complaint) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Lift Complaint Details</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl">
        <img
          src={complaint.image}
          className="w-full h-60 object-cover rounded mb-4"
        />

        <h2 className="text-xl font-semibold">{complaint.title}</h2>

        <p>Resident: {complaint.resident}</p>
        <p>Flat: {complaint.flat}</p>

        <p className="mt-3 text-gray-600">{complaint.description}</p>
      </div>
    </div>
  );
}

export default LiftComplaintDetails;
