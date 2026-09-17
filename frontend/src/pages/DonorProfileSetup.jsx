import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function DonorProfileSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    blood_group: "O+",
    city: "",
    last_donation_date: "",
    available: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        ...formData,

        last_donation_date:
          formData.last_donation_date === ""
            ? null
            : formData.last_donation_date
      };

      await api.post(
        "/donors/profile",
        dataToSend
      );

      navigate("/donor/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not create donor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🩸 BloodBridge
        </div>

        <h1>Complete Donor Profile</h1>

        <p className="auth-subtitle">
          Tell us a few details so we can match you
          with relevant blood requests.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Blood Group</label>

            <select
              className="role-select"
              name="blood_group"
              value={formData.blood_group}
              onChange={handleChange}
            >

              <option value="A+">A+</option>
              <option value="A-">A-</option>

              <option value="B+">B+</option>
              <option value="B-">B-</option>

              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>

              <option value="O+">O+</option>
              <option value="O-">O-</option>

            </select>

          </div>


          <div className="form-group">

            <label>City</label>

            <input
              type="text"
              name="city"
              placeholder="Example: Kochi"
              value={formData.city}
              onChange={handleChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Last Donation Date
            </label>

            <input
              type="date"
              name="last_donation_date"
              value={formData.last_donation_date}
              onChange={handleChange}
            />

            <small className="form-help">
              Leave empty if you have not donated before.
            </small>

          </div>


          <div className="availability-check">

            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />

            <label>
              I am currently available to donate
            </label>

          </div>


          <button
            type="submit"
            className="primary-btn full login-button"
            disabled={loading}
          >

            {loading
              ? "Saving profile..."
              : "Complete Profile"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default DonorProfileSetup;