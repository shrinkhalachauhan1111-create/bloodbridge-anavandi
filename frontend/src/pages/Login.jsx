import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ---------------------------------------------
      // SEND LOGIN REQUEST
      // ---------------------------------------------

      const response = await api.post(
        "/auth/login",
        formData
      );

      console.log(
        "Login response:",
        response.data
      );

      const token =
        response.data.access_token;

      const user =
        response.data.user;

      // ---------------------------------------------
      // VALIDATE RESPONSE
      // ---------------------------------------------

      if (!token) {
        throw new Error(
          "Login token was not returned."
        );
      }

      if (!user) {
        throw new Error(
          "User information was not returned."
        );
      }

      // ---------------------------------------------
      // SAVE LOGIN DATA
      // ---------------------------------------------

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "role",
        user.role
      );

      // =================================================
      // DONOR LOGIN
      // =================================================

      if (user.role === "donor") {
        try {
          // Check whether donor profile exists
          await api.get(
            "/donors/profile"
          );

          // -----------------------------------------
          // PROFILE EXISTS
          // -----------------------------------------

          navigate(
            "/donor-dashboard"
          );

        } catch (profileError) {

          // -----------------------------------------
          // PROFILE DOES NOT EXIST
          // -----------------------------------------

          if (
            profileError.response?.status ===
            404
          ) {
            navigate(
              "/donor-profile"
            );

          } else {
            console.error(
              "Donor profile check error:",
              profileError
            );

            throw profileError;
          }
        }
      }

      // =================================================
      // REQUESTER LOGIN
      // =================================================

      else if (
        user.role === "requester"
      ) {
        navigate(
          "/requester-dashboard"
        );
      }

      // =================================================
      // UNKNOWN ROLE
      // =================================================

      else {
        setError(
          "Unknown user role."
        );
      }

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <Link
          to="/"
          className="auth-logo"
        >
          🩸 BloodBridge
        </Link>


        {/* TITLE */}

        <h1>
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to continue to BloodBridge.
        </p>


        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* LOGIN FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="primary-btn full login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* REGISTER */}

        <p className="auth-footer">

          Don't have an account?{" "}

          <Link to="/register">
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;