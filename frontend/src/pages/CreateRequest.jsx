import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Droplet,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import api from "../api/api";

function CreateRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    blood_group: "O+",
    units: 1,
    hospital_name: "",
    city: "",
    urgency: "urgent",
  });

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // GET CURRENT LOCATION
  // ============================================================

  const getCurrentLocation = () => {
    setError("");
    setLocationStatus("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocationStatus("Request location captured successfully");
        setLocationLoading(false);
      },

      (locationError) => {
        setLocationLoading(false);

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (locationError.code === 2) {
          setError("Unable to determine your location.");
        } else if (locationError.code === 3) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("Unable to get your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ============================================================
  // CREATE BLOOD REQUEST
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!formData.hospital_name.trim()) {
      setError("Please enter the hospital name.");
      setLoading(false);
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter the city.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        blood_group: formData.blood_group,
        units: Number(formData.units),
        hospital_name: formData.hospital_name.trim(),
        city: formData.city.trim(),

        latitude: latitude,
        longitude: longitude,

        urgency: formData.urgency,
      };

      console.log("Blood request payload:", payload);

      const response = await api.post("/requests", payload);

      const count = response.data.matching_donors_found;

      setMessage(
        `Blood request created successfully. ${count} matching donor(s) found.`
      );

      setTimeout(() => {
        navigate("/requester-dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to create blood request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* HEADER */}

        <div style={{ marginBottom: "28px" }}>
          <div style={iconBoxStyle}>
            <Droplet size={25} />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            Create Blood Request
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#777",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            Enter the emergency details and BloodBridge will search for
            eligible nearby donors.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* BLOOD GROUP */}

          <label style={labelStyle}>Blood Group</label>

          <select
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            style={inputStyle}
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

          {/* UNITS */}

          <label style={labelStyle}>Units Required</label>

          <input
            type="number"
            name="units"
            min="1"
            value={formData.units}
            onChange={handleChange}
            style={inputStyle}
          />

          {/* HOSPITAL */}

          <label style={labelStyle}>Hospital Name</label>

          <div style={{ position: "relative" }}>
            <Building2
              size={18}
              color="#888"
              style={{
                position: "absolute",
                left: "13px",
                top: "13px",
              }}
            />

            <input
              type="text"
              name="hospital_name"
              placeholder="Example: ABC Hospital"
              value={formData.hospital_name}
              onChange={handleChange}
              style={{
                ...inputStyle,
                paddingLeft: "42px",
              }}
            />
          </div>

          {/* CITY */}

          <label style={labelStyle}>City</label>

          <input
            type="text"
            name="city"
            placeholder="Example: Kochi"
            value={formData.city}
            onChange={handleChange}
            style={inputStyle}
          />

          {/* LOCATION */}

          <div style={locationBoxStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <MapPin size={20} color="#b91c1c" />

              <strong>Nearby donor search</strong>
            </div>

            <p
              style={{
                margin: "9px 0 12px",
                fontSize: "13px",
                color: "#777",
                lineHeight: "1.5",
              }}
            >
              Share the request location so BloodBridge can find the closest
              eligible donors.
            </p>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              style={{
                ...locationButtonStyle,
                opacity: locationLoading ? 0.7 : 1,
              }}
            >
              {locationLoading ? (
                <>
                  <Loader2 size={17} className="location-spinner" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin size={17} />
                  Use Current Location
                </>
              )}
            </button>

            {locationStatus && (
              <div
                style={{
                  marginTop: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <CheckCircle2 size={17} />

                {locationStatus}
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#888",
                  fontSize: "11px",
                }}
              >
                Coordinates captured securely.
              </p>
            )}
          </div>

          {/* URGENCY */}

          <label style={labelStyle}>Urgency</label>

          <div style={{ position: "relative" }}>
            <AlertTriangle
              size={18}
              color="#888"
              style={{
                position: "absolute",
                left: "13px",
                top: "13px",
              }}
            />

            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              style={{
                ...inputStyle,
                paddingLeft: "42px",
              }}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* ERROR */}

          {error && <div style={errorStyle}>{error}</div>}

          {/* SUCCESS */}

          {message && <div style={successStyle}>{message}</div>}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Searching for Donors..." : "Find Matching Donors"}
          </button>
        </form>
      </div>

      <style>
        {`
          .location-spinner {
            animation: locationSpin 1s linear infinite;
          }

          @keyframes locationSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#fff7f7",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px 20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "560px",
  background: "white",
  borderRadius: "18px",
  padding: "32px",
  boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
};

const iconBoxStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fee2e2",
  color: "#b91c1c",
  marginBottom: "14px",
};

const labelStyle = {
  display: "block",
  marginTop: "18px",
  marginBottom: "7px",
  fontWeight: "600",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "9px",
  border: "1px solid #ddd",
  outline: "none",
  background: "white",
  fontSize: "14px",
};

const locationBoxStyle = {
  marginTop: "19px",
  padding: "16px",
  borderRadius: "12px",
  background: "#fff7f7",
  border: "1px solid #f6d1d1",
};

const locationButtonStyle = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 15px",
  background: "#b91c1c",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const errorStyle = {
  marginTop: "17px",
  padding: "11px",
  borderRadius: "9px",
  color: "#b91c1c",
  background: "#fee2e2",
  fontSize: "13px",
};

const successStyle = {
  marginTop: "17px",
  padding: "11px",
  borderRadius: "9px",
  color: "#166534",
  background: "#dcfce7",
  fontSize: "13px",
};

const submitButtonStyle = {
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "#b91c1c",
  color: "white",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

export default CreateRequest;