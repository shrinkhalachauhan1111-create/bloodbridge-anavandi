import { Link } from "react-router-dom";
import {
  HeartPulse,
  ShieldCheck,
  MapPin,
  Clock3,
  ArrowRight,
  Droplets
} from "lucide-react";

function Home() {
  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="home-navbar">

        <Link to="/" className="home-logo">
          <Droplets size={28} />
          <span>BloodBridge</span>
        </Link>

        <div className="home-nav-actions">

          <Link to="/login">
            <button className="home-login-btn">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="home-register-btn">
              Get Started
            </button>
          </Link>

        </div>

      </nav>


      {/* HERO */}
      <main className="home-hero">

        <div className="home-hero-left">

          <div className="home-badge">
            <HeartPulse size={17} />
            Emergency blood matching made simpler
          </div>

          <h1>
            Find an eligible blood donor
            <span> when every minute matters.</span>
          </h1>

          <p className="home-description">
            BloodBridge connects urgent blood requests with
            eligible nearby donors based on blood group,
            location, availability and donation interval —
            while protecting donor contact details until
            they accept.
          </p>


          <div className="home-actions">

            <Link to="/register">
              <button className="hero-primary-btn">
                Request Blood
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link to="/register">
              <button className="hero-secondary-btn">
                Become a Donor
              </button>
            </Link>

          </div>


          <div className="home-trust-row">

            <div>
              <ShieldCheck size={18} />
              Privacy-first
            </div>

            <div>
              <MapPin size={18} />
              Location matching
            </div>

            <div>
              <Clock3 size={18} />
              Fast response
            </div>

          </div>

        </div>


        {/* DEMO CARD */}
        <div className="home-demo-card">

          <div className="demo-card-header">

            <div>
              <p>LIVE REQUEST</p>
              <h2>Emergency Blood Request</h2>
            </div>

            <span className="critical-pill">
              Critical
            </span>

          </div>


          <div className="demo-main">

            <div className="demo-blood-group">
              O+
            </div>

            <div>
              <h3>ABC Hospital Kochi</h3>

              <p>
                <MapPin size={15} />
                Kochi
              </p>
            </div>

          </div>


          <div className="demo-details">

            <div>
              <span>Units required</span>
              <strong>2</strong>
            </div>

            <div>
              <span>Matching donors</span>
              <strong>1 found</strong>
            </div>

          </div>


          <div className="demo-progress">

            <div className="progress-item completed">
              <span>1</span>
              Request
            </div>

            <div className="progress-line"></div>

            <div className="progress-item completed">
              <span>2</span>
              Match
            </div>

            <div className="progress-line"></div>

            <div className="progress-item active">
              <span>3</span>
              Notify
            </div>

            <div className="progress-line"></div>

            <div className="progress-item">
              <span>4</span>
              Accept
            </div>

          </div>


          <div className="privacy-message">
            <ShieldCheck size={19} />

            <div>
              <strong>Contact protected</strong>

              <p>
                Donor details remain hidden until acceptance.
              </p>
            </div>

          </div>

        </div>

      </main>


      {/* FEATURES */}
      <section className="home-features">

        <div className="feature-card">
          <div className="feature-icon">
            <Droplets />
          </div>

          <h3>Smart Matching</h3>

          <p>
            Requests are filtered using blood group,
            city, availability and donation interval.
          </p>
        </div>


        <div className="feature-card">
          <div className="feature-icon">
            <ShieldCheck />
          </div>

          <h3>Privacy First</h3>

          <p>
            Donor phone and email remain private
            until the donor chooses to accept.
          </p>
        </div>


        <div className="feature-card">
          <div className="feature-icon">
            <HeartPulse />
          </div>

          <h3>Simple Response</h3>

          <p>
            Donors receive matching requests and
            can quickly accept or decline.
          </p>
        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="how-section">

        <p className="section-small-title">
          HOW BLOODBRIDGE WORKS
        </p>

        <h2>
          From request to donor in four simple steps
        </h2>


        <div className="how-grid">

          <div className="how-card">
            <span>01</span>
            <h3>Request</h3>

            <p>
              Hospital enters blood group,
              units, location and urgency.
            </p>
          </div>


          <div className="how-card">
            <span>02</span>
            <h3>Match</h3>

            <p>
              BloodBridge finds eligible
              available donors.
            </p>
          </div>


          <div className="how-card">
            <span>03</span>
            <h3>Notify</h3>

            <p>
              Matching donors see the request
              on their dashboard.
            </p>
          </div>


          <div className="how-card">
            <span>04</span>
            <h3>Accept</h3>

            <p>
              After acceptance, contact details
              are securely unlocked.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="home-cta">

        <div>
          <h2>
            Every connection can save time.
          </h2>

          <p>
            Join BloodBridge as a donor or requester.
          </p>
        </div>

        <Link to="/register">
          <button className="cta-button">
            Get Started
            <ArrowRight size={18} />
          </button>
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="home-footer">

        <div className="home-logo">
          <Droplets size={23} />
          <span>BloodBridge</span>
        </div>

        <p>
          Privacy-first blood donor matching prototype.
        </p>

      </footer>

    </div>
  );
}

export default Home;