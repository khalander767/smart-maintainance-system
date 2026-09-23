import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const ROLE_HOME = {
  ADMIN:      "/admin/dashboard",
  TECHNICIAN: "/technician/dashboard",
  RESIDENT:   "/resident/dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  // Wait for localStorage to be read before making any redirect decision
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
