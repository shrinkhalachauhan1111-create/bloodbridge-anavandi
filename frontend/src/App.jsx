import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import RequesterDashboard from "./pages/RequesterDashboard";
import DonorDashboard from "./pages/DonorDashboard";

import DonorProfileSetup from "./pages/DonorProfileSetup";
import CreateRequest from "./pages/CreateRequest";

function App() {
  return (
    <Routes>

      {/* =========================================
          HOME
      ========================================= */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* =========================================
          AUTH
      ========================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================================
          REQUESTER
      ========================================= */}

      <Route
        path="/requester-dashboard"
        element={<RequesterDashboard />}
      />

      <Route
        path="/request-blood"
        element={<CreateRequest />}
      />


      {/* =========================================
          DONOR
      ========================================= */}

      <Route
        path="/donor-profile"
        element={<DonorProfileSetup />}
      />

      <Route
        path="/donor-dashboard"
        element={<DonorDashboard />}
      />


      {/* =========================================
          WRONG URL
      ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;