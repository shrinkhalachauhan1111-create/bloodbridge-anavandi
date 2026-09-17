import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function DonorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setError("");

      const response = await api.get("/dashboard/donor");

      setDashboard(response.data);
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Could not load donor dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (matchId) => {
    try {
      setActionLoading(matchId);

      await api.patch(`/matches/${matchId}/accept`);

      await fetchDashboard();

    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Could not accept request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const declineRequest = async (matchId) => {
    try {
      setActionLoading(matchId);

      await api.patch(`/matches/${matchId}/decline`);

      await fetchDashboard();

    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Could not decline request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading donor dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          🩸 BloodBridge
        </div>

        <div className="dashboard-user">

          <span>
            {dashboard?.donor?.name}
          </span>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>


      <main className="dashboard-container">

        <div className="dashboard-header">

          <div>

            <p className="dashboard-label">
              DONOR DASHBOARD
            </p>

            <h1>
              Welcome, {dashboard?.donor?.name}
            </h1>

            <p>
              View nearby blood requests and respond when
              you are available to donate.
            </p>

          </div>

          <div
            className={
              dashboard?.donor?.available
                ? "availability available"
                : "availability unavailable"
            }
          >
            {dashboard?.donor?.available
              ? "● Available"
              : "● Unavailable"}
          </div>

        </div>


        {/* DONOR PROFILE */}

        <section className="donor-profile-card">

          <div>

            <p>Blood Group</p>

            <h2>
              {dashboard?.donor?.blood_group}
            </h2>

          </div>


          <div>

            <p>City</p>

            <h3>
              {dashboard?.donor?.city}
            </h3>

          </div>


          <div>

            <p>Last Donation</p>

            <h3>
              {dashboard?.donor?.last_donation_date || "No previous donation"}
            </h3>

          </div>

        </section>


        {/* STAT CARDS */}

        <section className="dashboard-stats donor-stats">

          <div className="stat-card">

            <p>Pending Requests</p>

            <h2>
              {dashboard?.stats?.pending_requests || 0}
            </h2>

          </div>


          <div className="stat-card">

            <p>Accepted</p>

            <h2>
              {dashboard?.stats?.accepted_requests || 0}
            </h2>

          </div>


          <div className="stat-card">

            <p>Declined</p>

            <h2>
              {dashboard?.stats?.declined_requests || 0}
            </h2>

          </div>

        </section>


        {/* INCOMING REQUESTS */}

        <section className="request-section">

          <div className="section-title">

            <h2>
              Incoming Blood Requests
            </h2>

            <p>
              Your contact details remain private until
              you accept a request.
            </p>

          </div>


          {!dashboard?.incoming_requests?.length ? (

            <div className="empty-state">

              <div className="empty-icon">
                🩸
              </div>

              <h3>
                No matching requests right now
              </h3>

              <p>
                BloodBridge will show requests here when
                your blood group, city, availability and
                donation interval match.
              </p>

            </div>

          ) : (

            <div className="donor-request-list">

              {dashboard.incoming_requests.map((request) => (

                <div
                  className="donor-request-card"
                  key={request.match_id}
                >

                  <div className="donor-request-top">

                    <div className="request-blood">
                      {request.blood_group}
                    </div>


                    <div className="request-info">

                      <h3>
                        {request.hospital_name}
                      </h3>

                      <p>
                        📍 {request.city}
                      </p>

                      <p>
                        {request.units} unit(s) required
                      </p>

                    </div>


                    <div>

                      <span
                        className={`urgency-badge ${request.urgency}`}
                      >
                        {request.urgency}
                      </span>

                    </div>

                  </div>


                  <div className="donor-request-footer">

                    <span
                      className={`status-badge ${request.match_status}`}
                    >
                      {request.match_status}
                    </span>


                    {request.match_status === "pending" && (

                      <div className="request-actions">

                        <button
                          className="decline-btn"
                          disabled={
                            actionLoading === request.match_id
                          }
                          onClick={() =>
                            declineRequest(request.match_id)
                          }
                        >
                          Decline
                        </button>


                        <button
                          className="accept-btn"
                          disabled={
                            actionLoading === request.match_id
                          }
                          onClick={() =>
                            acceptRequest(request.match_id)
                          }
                        >

                          {actionLoading === request.match_id
                            ? "Processing..."
                            : "Accept Request"}

                        </button>

                      </div>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default DonorDashboard;