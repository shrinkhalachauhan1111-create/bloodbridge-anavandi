import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./RequesterDashboard.css";

function RequesterDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [donorContact, setDonorContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Go back to login page
    navigate("/login");
  };

  // =====================================================
  // LOAD REQUESTER DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/requester");

      console.log("Requester dashboard:", response.data);

      setDashboard(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load requester dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VIEW DONOR CONTACT
  // =====================================================

  const handleViewContact = async (requestId) => {
    try {
      setContactLoading(true);
      setDonorContact(null);

      // Get matches for this blood request
      const matchesResponse = await api.get(
        `/blood-requests/${requestId}/matches`
      );

      console.log(
        "Matches response:",
        matchesResponse.data
      );

      let matches = [];

      if (Array.isArray(matchesResponse.data)) {
        matches = matchesResponse.data;
      } else if (
        Array.isArray(matchesResponse.data?.matches)
      ) {
        matches = matchesResponse.data.matches;
      }

      // Find accepted match
      const acceptedMatch = matches.find(
        (match) =>
          match.status?.toLowerCase() === "accepted"
      );

      if (!acceptedMatch) {
        alert(
          "No donor has accepted this request yet."
        );

        return;
      }

      // Get donor contact
      const contactResponse = await api.get(
        `/matches/${acceptedMatch.id}/contact`
      );

      console.log(
        "Donor contact:",
        contactResponse.data
      );

      const contact =
        contactResponse.data?.donor ||
        contactResponse.data;

      setDonorContact(contact);
    } catch (err) {
      console.error(
        "View donor contact error:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Unable to load donor contact"
      );
    } finally {
      setContactLoading(false);
    }
  };

  // =====================================================
  // MARK REQUEST AS COMPLETED
  // =====================================================

  const handleCompleteRequest = async (requestId) => {
    try {
      setCompletingId(requestId);

      const response = await api.put(
        `/blood-requests/${requestId}/complete`
      );

      console.log(
        "Complete request response:",
        response.data
      );

      alert(
        response.data?.message ||
          "Blood request completed successfully"
      );

      setDonorContact(null);

      // Refresh dashboard
      await fetchDashboard();
    } catch (err) {
      console.error(
        "Complete request error:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to complete blood request"
      );
    } finally {
      setCompletingId(null);
    }
  };

  // =====================================================
  // LOAD PAGE
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="loader"></div>

        <h2>
          Loading your dashboard...
        </h2>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="dashboard-state">

        <div className="error-icon">
          !
        </div>

        <h2>{error}</h2>

        <button
          className="primary-btn"
          onClick={fetchDashboard}
        >
          Try Again
        </button>

      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!dashboard) {
    return (
      <div className="dashboard-state">

        <h2>
          No dashboard data found.
        </h2>

      </div>
    );
  }

  // =====================================================
  // GET REQUESTS
  // =====================================================

  const requests =
    dashboard.recent_requests ||
    dashboard.requests ||
    dashboard.blood_requests ||
    [];

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalRequests =
    dashboard.stats?.total_requests ??
    requests.length;

  const searchingRequests =
    dashboard.stats?.searching_requests ??
    requests.filter((request) => {
      const status =
        request.status?.toLowerCase();

      return (
        status === "searching" ||
        status === "pending"
      );
    }).length;

  const matchedRequests =
    dashboard.stats?.matched_requests ??
    requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "matched"
    ).length;

  const completedRequests =
    dashboard.stats?.completed_requests ??
    requests.filter(
      (request) =>
        request.status?.toLowerCase() ===
        "completed"
    ).length;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="requester-page">

      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="dashboard-hero">

        {/* LEFT SIDE */}

        <div>

          <div className="hero-badge">
            ❤️ BloodBridge
          </div>

          <h1>
            Requester Dashboard
          </h1>

          <p>
            Create, monitor and manage your
            blood requests from one place.
          </p>

        </div>

        {/* RIGHT SIDE BUTTONS */}

        <div className="hero-actions">

          <Link
            to="/request-blood"
            className="new-request-btn"
          >
            <span>+</span>

            New Blood Request
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </section>

      {/* =================================================
          REQUEST SUMMARY
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              OVERVIEW
            </p>

            <h2>
              Request Summary
            </h2>

          </div>

          <p className="section-description">
            Your blood request activity
          </p>

        </div>

        <div className="stats-grid">

          {/* TOTAL REQUESTS */}

          <div className="stat-card">

            <div className="stat-icon total-icon">
              📋
            </div>

            <div className="stat-content">

              <p>
                Total Requests
              </p>

              <h3>
                {totalRequests}
              </h3>

            </div>

          </div>

          {/* SEARCHING */}

          <div className="stat-card">

            <div className="stat-icon searching-icon">
              🔍
            </div>

            <div className="stat-content">

              <p>
                Searching
              </p>

              <h3>
                {searchingRequests}
              </h3>

            </div>

          </div>

          {/* MATCHED */}

          <div className="stat-card">

            <div className="stat-icon matched-icon">
              🤝
            </div>

            <div className="stat-content">

              <p>
                Matched
              </p>

              <h3>
                {matchedRequests}
              </h3>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="stat-card">

            <div className="stat-icon completed-icon">
              ✓
            </div>

            <div className="stat-content">

              <p>
                Completed
              </p>

              <h3>
                {completedRequests}
              </h3>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          MY BLOOD REQUESTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              ACTIVITY
            </p>

            <h2>
              My Blood Requests
            </h2>

          </div>

          <span className="request-count">

            {requests.length} request
            {requests.length !== 1
              ? "s"
              : ""}

          </span>

        </div>

        {/* =================================================
            NO REQUESTS
        ================================================= */}

        {requests.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🩸
            </div>

            <h3>
              No blood requests yet
            </h3>

            <p>
              When you need blood, create your
              first request and we'll start
              searching for matching donors.
            </p>

            <Link
              to="/request-blood"
              className="empty-request-btn"
            >
              + Create Blood Request
            </Link>

          </div>

        ) : (

          // =================================================
          // REQUEST LIST
          // =================================================

          <div className="requests-list">

            {requests.map((request) => {

              const status =
                request.status?.toLowerCase();

              return (

                <div
                  key={request.id}
                  className="blood-request-card"
                >

                  {/* =========================================
                      REQUEST CARD HEADER
                  ========================================= */}

                  <div className="request-card-header">

                    <div className="blood-group-box">

                      <span>
                        {request.blood_group}
                      </span>

                      <small>
                        Blood Group
                      </small>

                    </div>

                    <div className="request-title">

                      <h3>
                        Blood Request
                        {request.id
                          ? ` #${request.id}`
                          : ""}
                      </h3>

                      <p>
                        {request.hospital_name ||
                          "Blood donation request"}
                      </p>

                    </div>

                    <span
                      className={`status-badge status-${status}`}
                    >

                      {status ===
                        "searching" &&
                        "Searching"}

                      {status ===
                        "pending" &&
                        "Pending"}

                      {status ===
                        "matched" &&
                        "Matched"}

                      {status ===
                        "completed" &&
                        "Completed"}

                      {status ===
                        "cancelled" &&
                        "Cancelled"}

                    </span>

                  </div>

                  {/* =========================================
                      REQUEST DETAILS
                  ========================================= */}

                  <div className="request-details">

                    {/* LOCATION */}

                    <div className="detail-item">

                      <span className="detail-label">
                        📍 Location
                      </span>

                      <strong>
                        {request.city ||
                          request.location ||
                          "Not provided"}
                      </strong>

                    </div>

                    {/* UNITS */}

                    {request.units !==
                      undefined && (

                      <div className="detail-item">

                        <span className="detail-label">
                          🩸 Units
                        </span>

                        <strong>
                          {request.units}
                        </strong>

                      </div>

                    )}

                    {/* URGENCY */}

                    {request.urgency && (

                      <div className="detail-item">

                        <span className="detail-label">
                          ⚡ Urgency
                        </span>

                        <strong>
                          {request.urgency}
                        </strong>

                      </div>

                    )}

                    {/* MATCHES */}

                    {request.matching_donors !==
                      undefined && (

                      <div className="detail-item">

                        <span className="detail-label">
                          👥 Matches
                        </span>

                        <strong>
                          {
                            request.matching_donors
                          }
                        </strong>

                      </div>

                    )}

                  </div>

                  {/* =========================================
                      SEARCHING
                  ========================================= */}

                  {(status === "searching" ||
                    status === "pending") && (

                    <div className="request-message searching-message">

                      <span>
                        🔍
                      </span>

                      <div>

                        <strong>
                          Looking for donors
                        </strong>

                        <p>
                          We're searching for
                          compatible donors in your
                          location.
                        </p>

                      </div>

                    </div>

                  )}

                  {/* =========================================
                      MATCHED
                  ========================================= */}

                  {status === "matched" && (

                    <div className="matched-section">

                      <div className="request-message matched-message">

                        <span>
                          ✓
                        </span>

                        <div>

                          <strong>
                            Donor found!
                          </strong>

                          <p>
                            A donor has accepted your
                            blood request.
                          </p>

                        </div>

                      </div>

                      <div className="request-actions">

                        {/* VIEW CONTACT */}

                        <button
                          className="contact-btn"
                          onClick={() =>
                            handleViewContact(
                              request.id
                            )
                          }
                          disabled={
                            contactLoading
                          }
                        >

                          {contactLoading
                            ? "Loading..."
                            : "☎ View Donor Contact"}

                        </button>

                        {/* COMPLETE */}

                        <button
                          className="complete-btn"
                          onClick={() =>
                            handleCompleteRequest(
                              request.id
                            )
                          }
                          disabled={
                            completingId ===
                            request.id
                          }
                        >

                          {completingId ===
                          request.id
                            ? "Completing..."
                            : "✓ Mark Completed"}

                        </button>

                      </div>

                    </div>

                  )}

                  {/* =========================================
                      COMPLETED
                  ========================================= */}

                  {status === "completed" && (

                    <div className="request-message completed-message">

                      <span>
                        ✓
                      </span>

                      <div>

                        <strong>
                          Request completed
                        </strong>

                        <p>
                          This blood request was
                          successfully completed.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        )}

      </section>

      {/* =================================================
          DONOR CONTACT MODAL
      ================================================= */}

      {donorContact && (

        <div className="modal-overlay">

          <div className="contact-modal">

            {/* CLOSE */}

            <button
              className="modal-close"
              onClick={() =>
                setDonorContact(null)
              }
            >
              ×
            </button>

            <div className="contact-modal-icon">
              ❤️
            </div>

            <p className="section-label">
              MATCHED DONOR
            </p>

            <h2>
              Donor Contact
            </h2>

            <p className="modal-subtitle">
              Your donor has accepted the
              request. You can contact them
              directly.
            </p>

            <div className="contact-information">

              {/* NAME */}

              {donorContact.name && (

                <div className="contact-row">

                  <span>
                    👤
                  </span>

                  <div>

                    <small>
                      Name
                    </small>

                    <strong>
                      {donorContact.name}
                    </strong>

                  </div>

                </div>

              )}

              {/* PHONE */}

              {donorContact.phone && (

                <div className="contact-row">

                  <span>
                    ☎
                  </span>

                  <div>

                    <small>
                      Phone
                    </small>

                    <strong>
                      {donorContact.phone}
                    </strong>

                  </div>

                </div>

              )}

              {/* EMAIL */}

              {donorContact.email && (

                <div className="contact-row">

                  <span>
                    ✉
                  </span>

                  <div>

                    <small>
                      Email
                    </small>

                    <strong>
                      {donorContact.email}
                    </strong>

                  </div>

                </div>

              )}

              {/* BLOOD GROUP */}

              {donorContact.blood_group && (

                <div className="contact-row">

                  <span>
                    🩸
                  </span>

                  <div>

                    <small>
                      Blood Group
                    </small>

                    <strong>
                      {
                        donorContact.blood_group
                      }
                    </strong>

                  </div>

                </div>

              )}

              {/* LOCATION */}

              {(donorContact.city ||
                donorContact.location) && (

                <div className="contact-row">

                  <span>
                    📍
                  </span>

                  <div>

                    <small>
                      Location
                    </small>

                    <strong>
                      {donorContact.city ||
                        donorContact.location}
                    </strong>

                  </div>

                </div>

              )}

            </div>

            <button
              className="modal-done-btn"
              onClick={() =>
                setDonorContact(null)
              }
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default RequesterDashboard;