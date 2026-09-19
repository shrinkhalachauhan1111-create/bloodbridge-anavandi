import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Droplet,
  MapPin,
  Hospital,
  Clock3,
  CheckCircle2,
  XCircle,
  LogOut,
  Navigation,
  AlertTriangle,
  HeartHandshake,
  RefreshCw,
} from "lucide-react";

import api from "../api/api";
import NotificationBell from "../components/NotificationBell";


function DonorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);


  // ============================================================
  // LOAD DONOR DASHBOARD
  // ============================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/dashboard/donor"
      );

      console.log(
        "Donor dashboard response:",
        response.data
      );

      setDashboard(response.data);

    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load donor dashboard."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  // ============================================================
  // ACCEPT REQUEST
  // IMPORTANT: PATCH
  // ============================================================

  const acceptRequest = async (matchId) => {
    try {
      setActionLoading(matchId);
      setError("");

      console.log(
        "Accepting match:",
        matchId
      );

      const response = await api.patch(
        `/matches/${matchId}/accept`
      );

      console.log(
        "Accept response:",
        response.data
      );

      await loadDashboard();

    } catch (err) {
      console.error(
        "Accept request error:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Unable to accept request.";

      setError(message);

      alert(message);

    } finally {
      setActionLoading(null);
    }
  };


  // ============================================================
  // DECLINE REQUEST
  // IMPORTANT: PATCH
  // ============================================================

  const declineRequest = async (matchId) => {
    try {
      setActionLoading(matchId);
      setError("");

      console.log(
        "Declining match:",
        matchId
      );

      const response = await api.patch(
        `/matches/${matchId}/decline`
      );

      console.log(
        "Decline response:",
        response.data
      );

      await loadDashboard();

    } catch (err) {
      console.error(
        "Decline request error:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Unable to decline request.";

      setError(message);

      alert(message);

    } finally {
      setActionLoading(null);
    }
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    if (status === "accepted") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "declined") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (status === "cancelled") {
      return {
        background: "#f3f4f6",
        color: "#6b7280",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };


  // ============================================================
  // URGENCY STYLE
  // ============================================================

  const getUrgencyStyle = (urgency) => {
    if (urgency === "critical") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (urgency === "urgent") {
      return {
        background: "#ffedd5",
        color: "#c2410c",
      };
    }

    return {
      background: "#f3f4f6",
      color: "#4b5563",
    };
  };


  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading && !dashboard) {
    return (
      <div style={centerStyle}>

        <div style={{ textAlign: "center" }}>

          <RefreshCw
            size={32}
            color="#b91c1c"
            className="dashboard-spinner"
          />

          <p>
            Loading donor dashboard...
          </p>

          <style>
            {`
              .dashboard-spinner {
                animation: dashboardSpin 1s linear infinite;
              }

              @keyframes dashboardSpin {
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

      </div>
    );
  }


  // ============================================================
  // DASHBOARD COULD NOT LOAD
  // ============================================================

  if (!dashboard) {
    return (
      <div style={centerStyle}>

        <div style={messageCardStyle}>

          <Droplet
            size={40}
            color="#b91c1c"
          />

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error ||
              "The donor dashboard could not be loaded."}
          </p>

          <button
            onClick={loadDashboard}
            style={primaryButtonStyle}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // ============================================================
  // SAFE DATA
  // Supports multiple backend response versions
  // ============================================================

  const profile =
    dashboard?.profile ||
    dashboard?.donor_profile ||
    dashboard?.donor ||
    null;


  const stats =
    dashboard?.stats || {
      pending: 0,
      accepted: 0,
      declined: 0,
      cancelled: 0,
    };


  const incomingRequests =
    dashboard?.incoming_requests || [];


  // ============================================================
  // DONOR PROFILE MISSING
  // ============================================================

  if (!profile) {
    return (
      <div style={centerStyle}>

        <div style={messageCardStyle}>

          <Droplet
            size={40}
            color="#b91c1c"
          />

          <h2>
            Donor profile not found
          </h2>

          <p>
            Complete your donor profile before
            receiving blood requests.
          </p>

          <button
            onClick={() =>
              navigate("/donor/setup")
            }
            style={primaryButtonStyle}
          >
            Complete Donor Profile
          </button>


          <button
            onClick={logout}
            style={secondaryButtonStyle}
          >
            Logout
          </button>

        </div>

      </div>
    );
  }


  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div style={pageStyle}>

      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <nav style={navbarStyle}>

        <div style={brandStyle}>

          <div style={brandIconStyle}>

            <Droplet
              size={22}
              fill="currentColor"
            />

          </div>


          <div>

            <strong style={{ fontSize: "18px" }}>
              BloodBridge
            </strong>

            <div style={brandSubtitleStyle}>
              Donor Dashboard
            </div>

          </div>

        </div>


        <div style={navActionsStyle}>

          <NotificationBell />


          <button
            onClick={logout}
            style={logoutButtonStyle}
          >
            <LogOut size={17} />

            Logout
          </button>

        </div>

      </nav>


      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <main style={contentStyle}>

        {/* WELCOME */}

        <section style={welcomeStyle}>

          <p style={smallRedText}>
            DONOR DASHBOARD
          </p>


          <h1 style={pageTitleStyle}>
            Ready to make a difference?
          </h1>


          <p style={subtitleStyle}>
            Review nearby blood requests and
            respond when you are available.
          </p>

        </section>


        {/* ERROR MESSAGE */}

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}


        {/* ===================================================== */}
        {/* DONOR PROFILE */}
        {/* ===================================================== */}

        <section style={profileCardStyle}>

          <div style={bloodGroupCircleStyle}>

            {profile?.blood_group || "--"}

          </div>


          <div style={{ flex: 1 }}>

            <p style={profileLabelStyle}>
              YOUR DONOR PROFILE
            </p>


            <h2 style={profileTitleStyle}>
              Blood Donor
            </h2>


            <div style={profileDetailsStyle}>

              <span style={profileDetailStyle}>

                <MapPin size={16} />

                {profile?.city ||
                  "Location unavailable"}

              </span>


              <span style={profileDetailStyle}>

                <Clock3 size={16} />

                Last donation:{" "}

                {profile?.last_donation_date ||
                  "Not provided"}

              </span>

            </div>

          </div>


          <div
            style={{
              ...availabilityStyle,

              background:
                profile?.available
                  ? "#dcfce7"
                  : "#fee2e2",

              color:
                profile?.available
                  ? "#166534"
                  : "#b91c1c",
            }}
          >

            {profile?.available ? (
              <>
                <CheckCircle2 size={16} />
                Available
              </>
            ) : (
              <>
                <XCircle size={16} />
                Unavailable
              </>
            )}

          </div>

        </section>


        {/* ===================================================== */}
        {/* STATS */}
        {/* ===================================================== */}

        <section style={statsGridStyle}>

          <StatCard
            number={stats?.pending || 0}
            label="Incoming Requests"
            icon={<Clock3 size={22} />}
          />


          <StatCard
            number={stats?.accepted || 0}
            label="Accepted"
            icon={
              <CheckCircle2 size={22} />
            }
          />


          <StatCard
            number={stats?.declined || 0}
            label="Declined"
            icon={<XCircle size={22} />}
          />


          <StatCard
            number={stats?.cancelled || 0}
            label="Cancelled"
            icon={
              <AlertTriangle size={22} />
            }
          />

        </section>


        {/* ===================================================== */}
        {/* REQUESTS */}
        {/* ===================================================== */}

        <section>

          <div style={sectionHeaderStyle}>

            <div>

              <p style={smallRedText}>
                NEARBY REQUESTS
              </p>


              <h2 style={sectionTitleStyle}>
                Incoming Blood Requests
              </h2>

            </div>


            <div style={requestCountStyle}>

              {incomingRequests.length} request
              {incomingRequests.length !== 1
                ? "s"
                : ""}

            </div>

          </div>


          {/* EMPTY STATE */}

          {incomingRequests.length === 0 && (
            <div style={emptyStyle}>

              <HeartHandshake
                size={45}
                color="#b91c1c"
              />

              <h3>
                No blood requests yet
              </h3>

              <p>
                Eligible nearby requests will
                appear here when BloodBridge
                finds a match.
              </p>

            </div>
          )}


          {/* REQUEST CARDS */}

          <div style={requestsGridStyle}>

            {incomingRequests.map(
              (request) => {

                const status =
                  request?.match_status ||
                  "pending";


                return (
                  <article
                    key={
                      request?.match_id ||
                      request?.request_id
                    }
                    style={requestCardStyle}
                  >

                    {/* HEADER */}

                    <div style={requestHeaderStyle}>

                      <div style={requestBloodStyle}>

                        {request?.blood_group ||
                          "--"}

                      </div>


                      <span
                        style={{
                          ...statusBadgeStyle,

                          ...getStatusStyle(
                            status
                          ),
                        }}
                      >
                        {formatStatus(status)}
                      </span>

                    </div>


                    {/* HOSPITAL */}

                    <div style={hospitalSectionStyle}>

                      <Hospital
                        size={20}
                        color="#b91c1c"
                      />


                      <div>

                        <strong style={hospitalNameStyle}>

                          {request?.hospital_name ||
                            "Hospital"}

                        </strong>


                        <span style={unitsStyle}>

                          {request?.units || 0} unit
                          {request?.units !== 1
                            ? "s"
                            : ""}{" "}
                          required

                        </span>

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div style={detailsGridStyle}>

                      {/* CITY */}

                      <div style={detailItemStyle}>

                        <MapPin
                          size={17}
                          color="#b91c1c"
                        />


                        <div>

                          <span style={detailLabelStyle}>
                            LOCATION
                          </span>


                          <strong style={detailValueStyle}>

                            {request?.city ||
                              "Unavailable"}

                          </strong>

                        </div>

                      </div>


                      {/* DISTANCE */}

                      <div style={detailItemStyle}>

                        <Navigation
                          size={17}
                          color="#b91c1c"
                        />


                        <div>

                          <span style={detailLabelStyle}>
                            DISTANCE
                          </span>


                          <strong style={detailValueStyle}>

                            {request?.distance_km !== null &&
                            request?.distance_km !== undefined
                              ? `${request.distance_km} km away`
                              : "Distance unavailable"}

                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* URGENCY */}

                    <div
                      style={{
                        ...urgencyStyle,

                        ...getUrgencyStyle(
                          request?.urgency
                        ),
                      }}
                    >

                      <AlertTriangle size={15} />


                      {(
                        request?.urgency ||
                        "normal"
                      ).toUpperCase()}

                    </div>


                    {/* PRIVACY MESSAGE */}

                    {status === "pending" && (
                      <div style={privacyMessageStyle}>

                        🔒 Your contact information
                        remains private until you
                        accept this request.

                      </div>
                    )}


                    {/* ================================================= */}
                    {/* ACCEPT / DECLINE BUTTONS */}
                    {/* ================================================= */}

                    {status === "pending" && (

                      <div style={actionButtonsStyle}>


                        {/* DECLINE */}

                        <button
                          type="button"

                          onClick={() => {
                            console.log(
                              "Decline clicked:",
                              request.match_id
                            );

                            declineRequest(
                              request.match_id
                            );
                          }}

                          disabled={
                            actionLoading ===
                            request.match_id
                          }

                          style={{
                            ...declineButtonStyle,

                            opacity:
                              actionLoading ===
                              request.match_id
                                ? 0.6
                                : 1,
                          }}
                        >

                          <XCircle size={17} />

                          {actionLoading ===
                          request.match_id
                            ? "Please wait..."
                            : "Decline"}

                        </button>


                        {/* ACCEPT */}

                        <button
                          type="button"

                          onClick={() => {
                            console.log(
                              "Accept clicked:",
                              request.match_id
                            );

                            acceptRequest(
                              request.match_id
                            );
                          }}

                          disabled={
                            actionLoading ===
                            request.match_id
                          }

                          style={{
                            ...acceptButtonStyle,

                            opacity:
                              actionLoading ===
                              request.match_id
                                ? 0.6
                                : 1,
                          }}
                        >

                          <HeartHandshake
                            size={17}
                          />


                          {actionLoading ===
                          request.match_id
                            ? "Please wait..."
                            : "Accept Request"}

                        </button>

                      </div>
                    )}


                    {/* ACCEPTED MESSAGE */}

                    {status === "accepted" && (
                      <div style={acceptedMessageStyle}>

                        <CheckCircle2 size={18} />

                        Request accepted. Your contact
                        information is now available
                        to the requester.

                      </div>
                    )}


                    {/* DECLINED MESSAGE */}

                    {status === "declined" && (
                      <div style={declinedMessageStyle}>

                        <XCircle size={18} />

                        You declined this request.

                      </div>
                    )}


                    {/* CANCELLED MESSAGE */}

                    {status === "cancelled" && (
                      <div style={cancelledMessageStyle}>

                        <AlertTriangle size={18} />

                        Another donor accepted this
                        request.

                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>

        </section>

      </main>

    </div>
  );
}


// ============================================================
// STAT CARD COMPONENT
// ============================================================

function StatCard({
  number,
  label,
  icon,
}) {
  return (
    <div style={statCardStyle}>

      <div style={statIconStyle}>
        {icon}
      </div>


      <div>

        <strong style={statNumberStyle}>
          {number}
        </strong>


        <span style={statLabelStyle}>
          {label}
        </span>

      </div>

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  color: "#111827",
  fontFamily: "Inter, system-ui, sans-serif",
};


const centerStyle = {
  minHeight: "100vh",
  background: "#fff7f7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const messageCardStyle = {
  width: "90%",
  maxWidth: "430px",
  padding: "36px",
  borderRadius: "20px",
  background: "white",
  textAlign: "center",
  boxShadow:
    "0 15px 45px rgba(0,0,0,.08)",
};


const primaryButtonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "9px",
  background: "#b91c1c",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
};


const secondaryButtonStyle = {
  marginLeft: "10px",
  padding: "11px 18px",
  border: "1px solid #ddd",
  borderRadius: "9px",
  background: "white",
  color: "#444",
  fontWeight: "600",
  cursor: "pointer",
};


const navbarStyle = {
  height: "76px",
  padding: "0 5%",
  background: "white",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};


const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};


const brandIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: "#b91c1c",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const brandSubtitleStyle = {
  marginTop: "2px",
  color: "#888",
  fontSize: "10px",
};


const navActionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};


const logoutButtonStyle = {
  padding: "10px 15px",
  border: "1px solid #ddd",
  borderRadius: "9px",
  background: "white",
  color: "#444",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  cursor: "pointer",
};


const contentStyle = {
  width: "92%",
  maxWidth: "1200px",
  margin: "auto",
  padding: "45px 0 70px",
};


const welcomeStyle = {
  marginBottom: "30px",
};


const smallRedText = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "10px",
  letterSpacing: "1.8px",
  fontWeight: "800",
};


const pageTitleStyle = {
  margin: "7px 0",
  fontSize: "37px",
  letterSpacing: "-1px",
};


const subtitleStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "15px",
};


const errorStyle = {
  marginBottom: "20px",
  padding: "12px 15px",
  borderRadius: "9px",
  background: "#fee2e2",
  color: "#b91c1c",
};


const profileCardStyle = {
  padding: "24px",
  borderRadius: "17px",
  background: "white",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  gap: "20px",
  boxShadow:
    "0 6px 20px rgba(0,0,0,.035)",
};


const bloodGroupCircleStyle = {
  width: "74px",
  height: "74px",
  flexShrink: 0,
  borderRadius: "50%",
  background: "#b91c1c",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "24px",
  fontWeight: "800",
};


const profileLabelStyle = {
  margin: 0,
  color: "#999",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1px",
};


const profileTitleStyle = {
  margin: "5px 0 12px",
  fontSize: "21px",
};


const profileDetailsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "18px",
};


const profileDetailStyle = {
  color: "#666",
  fontSize: "12px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};


const availabilityStyle = {
  padding: "8px 12px",
  borderRadius: "30px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: "700",
};


const statsGridStyle = {
  margin: "22px 0 45px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
};


const statCardStyle = {
  minHeight: "115px",
  padding: "20px",
  borderRadius: "14px",
  background: "white",
  border: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  gap: "14px",
};


const statIconStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "11px",
  background: "#fee2e2",
  color: "#b91c1c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const statNumberStyle = {
  display: "block",
  fontSize: "26px",
};


const statLabelStyle = {
  display: "block",
  marginTop: "2px",
  color: "#777",
  fontSize: "11px",
};


const sectionHeaderStyle = {
  marginBottom: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};


const sectionTitleStyle = {
  margin: "5px 0 0",
  fontSize: "27px",
};


const requestCountStyle = {
  padding: "7px 11px",
  borderRadius: "20px",
  background: "#fee2e2",
  color: "#b91c1c",
  fontSize: "11px",
  fontWeight: "700",
};


const requestsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "20px",
};


const requestCardStyle = {
  padding: "23px",
  borderRadius: "16px",
  background: "white",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 8px 24px rgba(0,0,0,.04)",
};


const requestHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
};


const requestBloodStyle = {
  width: "55px",
  height: "55px",
  borderRadius: "50%",
  background: "#b91c1c",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "18px",
};


const statusBadgeStyle = {
  padding: "7px 11px",
  borderRadius: "20px",
  fontSize: "10px",
  fontWeight: "800",
};


const hospitalSectionStyle = {
  paddingBottom: "18px",
  borderBottom: "1px solid #eee",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};


const hospitalNameStyle = {
  display: "block",
  fontSize: "16px",
};


const unitsStyle = {
  display: "block",
  marginTop: "3px",
  color: "#777",
  fontSize: "12px",
};


const detailsGridStyle = {
  marginTop: "18px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "11px",
};


const detailItemStyle = {
  padding: "12px",
  borderRadius: "10px",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};


const detailLabelStyle = {
  display: "block",
  color: "#999",
  fontSize: "9px",
};


const detailValueStyle = {
  display: "block",
  marginTop: "2px",
  fontSize: "11px",
};


const urgencyStyle = {
  width: "fit-content",
  marginTop: "17px",
  padding: "7px 10px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "10px",
  fontWeight: "800",
};


const privacyMessageStyle = {
  marginTop: "16px",
  padding: "11px",
  borderRadius: "9px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "11px",
};


const actionButtonsStyle = {
  marginTop: "18px",
  display: "flex",
  gap: "10px",
};


const declineButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "9px",
  border: "1px solid #ddd",
  background: "white",
  color: "#b91c1c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontWeight: "700",
  cursor: "pointer",
};


const acceptButtonStyle = {
  flex: 1.4,
  padding: "12px",
  borderRadius: "9px",
  border: "none",
  background: "#166534",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontWeight: "700",
  cursor: "pointer",
};


const acceptedMessageStyle = {
  marginTop: "17px",
  padding: "12px",
  borderRadius: "9px",
  background: "#dcfce7",
  color: "#166534",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "11px",
};


const declinedMessageStyle = {
  marginTop: "17px",
  padding: "12px",
  borderRadius: "9px",
  background: "#fee2e2",
  color: "#b91c1c",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "11px",
};


const cancelledMessageStyle = {
  marginTop: "17px",
  padding: "12px",
  borderRadius: "9px",
  background: "#f3f4f6",
  color: "#6b7280",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  fontSize: "11px",
};


const emptyStyle = {
  padding: "55px",
  borderRadius: "16px",
  background: "white",
  border: "1px dashed #ddd",
  textAlign: "center",
  color: "#777",
};


export default DonorDashboard;