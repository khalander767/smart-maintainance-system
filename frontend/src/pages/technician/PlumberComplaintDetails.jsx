import { useParams } from "react-router-dom";

// ✅ IMPORT IMAGE
import plumbingImg from "../../assets/plumbing_problem.jpeg";

function PlumberComplaintDetails() {
  const { id } = useParams();

  const complaints = [
    {
      id: 1,
      title: "Water Leakage",
      resident: "John",
      flat: "A-101",
      description: "Pipe leakage under sink",
      image: plumbingImg,
    },
    {
      id: 2,
      title: "Bathroom Leakage",
      resident: "Sita",
      flat: "B-202",
      description: "Water leakage from bathroom wall",
      image: plumbingImg,
    },
    {
      id: 3,
      title: "Water Supply Problem",
      resident: "Sneha",
      flat: "C-303",
      description: "Low water pressure",
      image: plumbingImg,
    },
  ];

  const complaint = complaints.find((c) => c.id === Number(id));

  if (!complaint) return <div>Not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Complaint Details</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-xl">
        {/* IMAGE */}
        <img
          src={complaint.image}
          alt="plumbing"
          className="w-full h-60 object-cover rounded mb-4"
        />

        <h2 className="text-xl font-semibold mb-2">{complaint.title}</h2>

        <p>Resident: {complaint.resident}</p>
        <p>Flat: {complaint.flat}</p>

        <p className="mt-3 text-gray-600">{complaint.description}</p>
      </div>
    </div>
  );
}

export default PlumberComplaintDetails;
