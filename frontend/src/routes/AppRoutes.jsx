import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResidentRegister from "../pages/auth/ResidentRegister";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageComplaints from "../pages/admin/ManageComplaints";
import ManageResidents from "../pages/admin/ManageResidents";
import ResidentDetails from "../pages/admin/ResidentDetails";
import ManageTechnicians from "../pages/admin/ManageTechnicians";
import Reports from "../pages/admin/Reports";
import TechnicianPerformance from "../pages/admin/TechnicianPerformance";
import CategoryTechnicians from "../pages/admin/CategoryTechnicians";
import ComplaintDetails from "../pages/admin/ComplaintDetails";
import Settings from "../pages/admin/Settings";

import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import AssignedComplaints from "../pages/technician/AssignedComplaints";
import TechnicianSettings from "../pages/technician/TechnicianSettings";
import ResidentSettings from "../pages/resident/ResidentSettings";

import ResidentDashboard from "../pages/resident/ResidentDashboard";
import CreateComplaint from "../pages/resident/CreateComplaint";
import MyComplaints from "../pages/resident/MyComplaints";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/resident" element={<ResidentRegister />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/technicians"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageTechnicians />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/residents"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ManageResidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/residents/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ResidentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/category/:role"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CategoryTechnicians />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports/:name"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TechnicianPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Technician routes */}
        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/complaints"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <AssignedComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/settings"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianSettings />
            </ProtectedRoute>
          }
        />
        <Route path="/plumber/dashboard"    element={<Navigate to="/technician/dashboard" />} />
        <Route path="/plumber/complaint/:id" element={<Navigate to="/technician/dashboard" />} />
        <Route path="/lift/dashboard"        element={<Navigate to="/technician/dashboard" />} />
        <Route path="/lift/complaint/:id"    element={<Navigate to="/technician/dashboard" />} />

        {/* Resident routes */}
        <Route
          path="/resident/dashboard"
          element={
            <ProtectedRoute allowedRoles={["RESIDENT"]}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resident/complaints"
          element={
            <ProtectedRoute allowedRoles={["RESIDENT"]}>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resident/create-complaint"
          element={
            <ProtectedRoute allowedRoles={["RESIDENT"]}>
              <CreateComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resident/settings"
          element={
            <ProtectedRoute allowedRoles={["RESIDENT"]}>
              <ResidentSettings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
