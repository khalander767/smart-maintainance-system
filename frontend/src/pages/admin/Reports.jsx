import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

// ✅ SAFE IMPORTS (no @ alias issues)
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card";

import { Button } from "../../components/ui/button";

// ✅ IMPORT YOUR LOCAL IMAGES
import electriciansImg from "../../assets/electrician.jpeg";
import plumberImg from "../../assets/plumbers.jpeg";
import acImg from "../../assets/actechs.jpeg";
import carpenterImg from "../../assets/carpenters.avif";
import securityImg from "../../assets/security.jpeg";
import liftImg from "../../assets/lift.jpeg";

function Reports() {
  const navigate = useNavigate();

  const categories = [
    {
      title: "Electricians",
      slug: "electrician",
      desc: "Handle wiring and power issues",
      img: electriciansImg,
    },
    {
      title: "Plumbers",
      slug: "plumber",
      desc: "Fix leakage and pipe systems",
      img: plumberImg,
    },
    {
      title: "AC Technicians",
      slug: "ac-technician",
      desc: "Cooling and AC maintenance",
      img: acImg,
    },
    {
      title: "Carpenters",
      slug: "carpenter",
      desc: "Furniture and wood repairs",
      img: carpenterImg,
    },
    {
      title: "Security",
      slug: "security",
      desc: "Safety and monitoring",
      img: securityImg,
    },
    {
      title: "Lift Technicians",
      slug: "lift-technician",
      desc: "Elevator maintenance",
      img: liftImg,
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Technician Reports</h1>

      <div className="grid grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <Card
            key={index}
            className="cursor-pointer overflow-hidden rounded-xl hover:shadow-2xl hover:scale-[1.02] transition duration-200"
            onClick={() => navigate(`/admin/reports/category/${cat.slug}`)}
          >
            {/* IMAGE */}
            <img
              src={cat.img}
              alt={cat.title}
              className="h-40 w-full object-cover"
            />

            {/* CONTENT */}
            <CardHeader>
              <CardTitle className="text-lg">{cat.title}</CardTitle>
              <CardDescription className="text-sm">{cat.desc}</CardDescription>
            </CardHeader>

            {/* BUTTON */}
            <CardFooter>
              <Button
                className="w-full bg-black hover:bg-gray-900 text-white"
                onClick={(e) => {
                  e.stopPropagation(); // prevent double navigation
                  navigate(`/admin/reports/category/${cat.slug}`);
                }}
              >
                View Technicians
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Reports;
