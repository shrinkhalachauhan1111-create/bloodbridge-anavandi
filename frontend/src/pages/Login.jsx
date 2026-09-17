import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // --------------------------------
      // LOGIN
      // --------------------------------
      const response = await api.post(
        "/auth/login",
        formData
      );

      const token = response.data.access_token;
      const user = response.data.user;

      // Save token in browser
      localStorage.setItem(
        "token",
        token
      );

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      // --------------------------------
      // DONOR LOGIN
      // --------------------------------
      if (user.role === "donor") {
        try {
          // Check whether donor profile exists
          await api.get("/donors/profile");

          // Profile exists
          navigate("/donor/dashboard");

        } catch (profileError) {
          // Profile does not exist
          if (profileError.response?.status === 404) {
            navigate("/donor/setup");

          } else {
            throw profileError;
          }
        }
      }


      // --------------------------------
      // REQUESTER LOGIN
      // --------------------------------
      else if (user.role === "requester") {
        navigate("/requester/dashboard");
      }


      // --------------------------------
      // UNKNOWN ROLE
      // --------------------------------
      else {
        setError("Unknown user role.");
      }

    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.detail ||
        "Login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };


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


        {/* REGISTER LINK */}
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