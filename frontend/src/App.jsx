import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DonorDashboard from "./pages/DonorDashboard";
import DonorProfileSetup from "./pages/DonorProfileSetup";

import RequesterDashboard from "./pages/RequesterDashboard";
import CreateRequest from "./pages/CreateRequest";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* PUBLIC PAGES */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* DONOR PAGES */}

      <Route
        path="/donor/setup"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorProfileSetup />
          </ProtectedRoute>
        }
      />

      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />


      {/* REQUESTER PAGES */}

      <Route
        path="/requester/dashboard"
        element={
          <ProtectedRoute allowedRole="requester">
            <RequesterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/request-blood"
        element={
          <ProtectedRoute allowedRole="requester">
            <CreateRequest />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;