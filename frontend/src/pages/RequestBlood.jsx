import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";


function RequestBlood() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    blood_group: "",
    units: 1,
    hospital_name: "",
    city: "",
    urgency: "urgent",
    latitude: null,
    longitude: null,
  });

  const [locationStatus, setLocationStatus] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        name === "units"
          ? Number(value)
          : value,
    }));
  };

  // =====================================================
  // GET REQUESTER LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location is not supported by this browser."
      );

      return;
    }

    setLocationStatus(
      "Getting your location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setForm((previous) => ({
          ...previous,
          latitude,
          longitude,
        }));

        setLocationStatus(
          "✓ Current location captured"
        );
      },

      (error) => {
        console.error(error);

        setLocationStatus(
          "Could not access your location. Allow location permission and try again."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // =====================================================
  // CREATE REQUEST
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.blood_group) {
      alert("Select blood group");
      return;
    }

    if (!form.city.trim()) {
      alert("Enter location");
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/blood-requests",
          form
        );

      const matches =
        response.data
          ?.matching_donors_found ?? 0;

      alert(
        `Blood request created. ${matches} donor match(es) found.`
      );

      navigate(
        "/requester-dashboard"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Failed to create blood request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-request-page">

      <div className="request-form-container">

        <div className="request-form-header">

          <p className="section-small-title">
            EMERGENCY REQUEST
          </p>

          <h1>
            Request Blood
          </h1>

          <p>
            Provide the required blood details
            and location. BloodBridge will find
            the nearest eligible donors.
          </p>

        </div>

        <form
          className="blood-request-form"
          onSubmit={handleSubmit}
        >

          {/* BLOOD GROUP */}

          <div className="form-group">

            <label>
              Blood Group
            </label>

            <select
              name="blood_group"
              value={form.blood_group}
              onChange={handleChange}
              required
            >

              <option value="">
                Select blood group
              </option>

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

          {/* UNITS */}

          <div className="form-group">

            <label>
              Units Required
            </label>

            <input
              type="number"
              name="units"
              min="1"
              value={form.units}
              onChange={handleChange}
              required
            />

          </div>

          {/* HOSPITAL */}

          <div className="form-group">

            <label>
              Hospital Name
            </label>

            <input
              type="text"
              name="hospital_name"
              value={form.hospital_name}
              onChange={handleChange}
              placeholder="Example: Medical Trust Hospital"
              required
            />

          </div>

          {/* CITY */}

          <div className="form-group">

            <label>
              City / Location
            </label>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Example: Kochi"
              required
            />

          </div>

          {/* GPS LOCATION */}

          <div className="form-group">

            <label>
              Exact Location
            </label>

            <button
              type="button"
              onClick={getCurrentLocation}
              style={{
                width: "100%",
                padding: "13px",
                background: "white",
                color: "#b91c1c",
                border:
                  "1px solid #b91c1c",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📍 Use My Current Location
            </button>

            {locationStatus && (
              <small
                style={{
                  display: "block",
                  marginTop: "8px",
                }}
              >
                {locationStatus}
              </small>
            )}

          </div>

          {/* URGENCY */}

          <div className="form-group">

            <label>
              Urgency
            </label>

            <select
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
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
            className="create-request-btn"
            disabled={loading}
          >

            {loading
              ? "Searching donors..."
              : "Create Blood Request"}

          </button>

        </form>

      </div>

    </div>
  );
}


export default RequestBlood;