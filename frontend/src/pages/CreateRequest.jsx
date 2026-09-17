import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function CreateRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    blood_group: "O+",
    units: 1,
    hospital_name: "",
    city: "",
    urgency: "normal"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "units" ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post(
        "/requests",
        formData
      );

      setResult(response.data);

    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Could not create blood request."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-request-page">

      <nav className="dashboard-navbar">

        <Link
          to="/requester/dashboard"
          className="dashboard-logo"
        >
          🩸 BloodBridge
        </Link>

        <Link to="/requester/dashboard">
          <button className="logout-btn">
            ← Dashboard
          </button>
        </Link>

      </nav>


      <div className="request-form-container">

        <div className="request-form-header">

          <p className="dashboard-label">
            NEW REQUEST
          </p>

          <h1>
            Request Blood
          </h1>

          <p>
            Enter the patient requirement and we will search
            for eligible donors.
          </p>

        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {result && (
          <div className="success-box">

            <h2>Request Created ✅</h2>

            <p>
              BloodBridge found{" "}
              <strong>
                {result.matching_donors_found}
              </strong>{" "}
              matching donor(s).
            </p>

            <p>
              Request ID: {result.request?.id}
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                navigate("/requester/dashboard")
              }
            >
              View Dashboard
            </button>

          </div>
        )}


        {!result && (
          <form
            className="blood-request-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label>
                Blood Group
              </label>

              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                required
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

              <label>
                Units Required
              </label>

              <input
                type="number"
                name="units"
                min="1"
                max="10"
                value={formData.units}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Hospital Name
              </label>

              <input
                type="text"
                name="hospital_name"
                placeholder="Example: ABC Hospital Kochi"
                value={formData.hospital_name}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                City
              </label>

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
                Urgency
              </label>

              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
              >

                <option value="normal">
                  Normal
                </option>

                <option value="urgent">
                  Urgent
                </option>

                <option value="critical">
                  Critical
                </option>

              </select>

            </div>


            <button
              type="submit"
              className="primary-btn full create-request-btn"
              disabled={loading}
            >
              {loading
                ? "Searching for donors..."
                : "Create Blood Request"}
            </button>

          </form>
        )}

      </div>

    </div>
  );
}

export default CreateRequest;