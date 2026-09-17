import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function RequesterDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard/requester");

      setDashboard(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Could not load dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  const viewDonorContact = async (matchId) => {
    try {
      setContactLoading(matchId);

      const response = await api.get(
        `/matches/${matchId}/contact`
      );

      setContact(response.data.donor);

    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Could not load donor contact."
      );
    } finally {
      setContactLoading(null);
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
        Loading dashboard...
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

      {/* NAVBAR */}
      <nav className="dashboard-navbar">

        <Link
          to="/"
          className="dashboard-logo"
        >
          🩸 BloodBridge
        </Link>


        <div className="dashboard-user">

          <span>
            {dashboard?.requester?.name}
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

        {/* HEADER */}
        <div className="dashboard-header">

          <div>

            <p className="dashboard-label">
              REQUESTER DASHBOARD
            </p>

            <h1>
              Welcome, {dashboard?.requester?.name}
            </h1>

            <p>
              Create and track urgent blood requests.
            </p>

          </div>


          <Link to="/request-blood">

            <button className="primary-btn">
              + Request Blood
            </button>

          </Link>

        </div>


        {/* STAT CARDS */}
        <section className="dashboard-stats">

          <div className="stat-card">
            <p>Total Requests</p>

            <h2>
              {dashboard?.stats?.total_requests || 0}
            </h2>
          </div>


          <div className="stat-card">
            <p>Searching</p>

            <h2>
              {dashboard?.stats?.active_requests || 0}
            </h2>
          </div>


          <div className="stat-card">
            <p>Matched</p>

            <h2>
              {dashboard?.stats?.matched_requests || 0}
            </h2>
          </div>


          <div className="stat-card">
            <p>Completed</p>

            <h2>
              {dashboard?.stats?.completed_requests || 0}
            </h2>
          </div>

        </section>


        {/* DONOR CONTACT */}
        {contact && (

          <div className="contact-card">

            <div>

              <p className="dashboard-label">
                DONOR ACCEPTED
              </p>

              <h2>
                🔓 Donor Contact Unlocked
              </h2>

            </div>


            <div className="contact-details">

              <p>
                <strong>Name:</strong>{" "}
                {contact.name}
              </p>

              <p>
                <strong>Blood Group:</strong>{" "}
                {contact.blood_group}
              </p>

              <p>
                <strong>City:</strong>{" "}
                {contact.city}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {contact.phone || "Not provided"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {contact.email}
              </p>

            </div>


            <button
              className="logout-btn"
              onClick={() => setContact(null)}
            >
              Close
            </button>

          </div>

        )}


        {/* REQUESTS */}
        <section className="request-section">

          <div className="section-title">

            <h2>
              Recent Blood Requests
            </h2>

          </div>


          {!dashboard?.recent_requests?.length ? (

            <div className="empty-state">

              <div className="empty-icon">
                🩸
              </div>

              <h3>
                No blood requests yet
              </h3>

              <p>
                Create your first blood request and
                BloodBridge will search for eligible donors.
              </p>


              <Link to="/request-blood">

                <button className="primary-btn">
                  Create Blood Request
                </button>

              </Link>

            </div>

          ) : (

            <div className="request-list">

              {dashboard.recent_requests.map((request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

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
                      {request.units} unit(s)
                    </p>

                    <p>
                      Matching donors:{" "}
                      {request.matching_donors}
                    </p>

                  </div>


                  <div className="request-details">

                    <span
                      className={`status-badge ${request.status}`}
                    >
                      {request.status}
                    </span>


                    <p className="urgency">
                      {request.urgency}
                    </p>


                    {request.donor_accepted &&
                      request.accepted_match_id && (

                      <button
                        className="contact-btn"
                        onClick={() =>
                          viewDonorContact(
                            request.accepted_match_id
                          )
                        }
                        disabled={
                          contactLoading ===
                          request.accepted_match_id
                        }
                      >

                        {contactLoading ===
                        request.accepted_match_id
                          ? "Loading..."
                          : "🔓 View Donor Contact"}

                      </button>

                    )}


                    {!request.donor_accepted &&
                      request.status === "searching" && (

                      <p className="waiting-text">
                        🔒 Contact hidden
                      </p>

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

export default RequesterDashboard;