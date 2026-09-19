import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

function DonorProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    blood_group: "",
    city: "",
    latitude: null,
    longitude: null,
    last_donation_date: "",
    available: true,
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
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // GET CURRENT GPS LOCATION
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
          "Could not access location. Please allow location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // =====================================================
  // LOAD EXISTING PROFILE
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await api.get(
            "/donors/profile"
          );

        setForm({
          blood_group:
            response.data.blood_group || "",

          city:
            response.data.city || "",

          latitude:
            response.data.latitude,

          longitude:
            response.data.longitude,

          last_donation_date:
            response.data.last_donation_date ||
            "",

          available:
            response.data.available ??
            true,
        });

        if (
          response.data.latitude != null &&
          response.data.longitude != null
        ) {
          setLocationStatus(
            "✓ Location already saved"
          );
        }
      } catch (error) {
        // 404 simply means profile
        // doesn't exist yet.
        if (
          error.response?.status !== 404
        ) {
          console.error(error);
        }
      }
    };

    loadProfile();
  }, []);

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.blood_group) {
      alert("Select blood group");
      return;
    }

    if (!form.city.trim()) {
      alert("Enter your city");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,

        last_donation_date:
          form.last_donation_date ||
          null,
      };

      const response =
        await api.post(
          "/donors/profile",
          payload
        );

      alert(response.data.message);

      navigate(
        "/donor-dashboard"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Could not save donor profile"
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
            DONOR PROFILE
          </p>

          <h1>
            Your donor information
          </h1>

          <p>
            Add your blood group and current
            location so BloodBridge can find
            nearby requests.
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
                Select Blood Group
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

          {/* CITY */}

          <div className="form-group">

            <label>
              City
            </label>

            <input
              type="text"
              name="city"
              placeholder="Example: Kochi"
              value={form.city}
              onChange={handleChange}
              required
            />

          </div>

          {/* GPS */}

          <div className="form-group">

            <label>
              Current Location
            </label>

            <button
              type="button"
              onClick={getCurrentLocation}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border:
                  "1px solid #b91c1c",
                background: "white",
                color: "#b91c1c",
                cursor: "pointer",
                fontWeight: "700",
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

          {/* LAST DONATION */}

          <div className="form-group">

            <label>
              Last Donation Date
            </label>

            <input
              type="date"
              name="last_donation_date"
              value={
                form.last_donation_date
              }
              onChange={handleChange}
            />

            <small className="form-help">
              Leave empty if you have never
              donated.
            </small>

          </div>

          {/* AVAILABLE */}

          <div className="availability-check">

            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
            />

            <label>
              I am currently available to donate
            </label>

          </div>

          <button
            type="submit"
            className="create-request-btn"
            disabled={loading}
          >

            {loading
              ? "Saving..."
              : "Save Donor Profile"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default DonorProfile;