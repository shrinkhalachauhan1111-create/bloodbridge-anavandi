import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Droplets,
  HeartHandshake,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./Home.css";

function Home() {
  const steps = [
    {
      icon: <Droplets />,
      number: "01",
      title: "Create Request",
      text: "Enter blood group, hospital, units and location.",
    },
    {
      icon: <Search />,
      number: "02",
      title: "Smart Matching",
      text: "BloodBridge searches eligible and available donors.",
    },
    {
      icon: <BellRing />,
      number: "03",
      title: "Notify Donor",
      text: "Matched requests appear securely for the donor.",
    },
    {
      icon: <HeartHandshake />,
      number: "04",
      title: "Accept & Connect",
      text: "Contact details unlock only after donor acceptance.",
    },
  ];

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 35,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
      },
    },
  };

  return (
    <div className="home-page">

      {/* Animated background */}
      <div className="background-effects">
        <motion.div
          className="blur-circle circle-one"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="blur-circle circle-two"
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* NAVBAR */}
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Link to="/" className="brand">
          <motion.div
            className="brand-icon"
            whileHover={{
              rotate: 8,
              scale: 1.08,
            }}
          >
            <Droplets size={25} />
          </motion.div>

          <div>
            <strong>BloodBridge</strong>
            <span>Connecting lives</span>
          </div>
        </Link>

        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>

          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/register" className="nav-button">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="hero">

        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.16,
              },
            },
          }}
        >

          <motion.div className="hero-badge" variants={fadeUp}>
            <Sparkles size={15} />
            Smart Emergency Donor Matching
          </motion.div>

          <motion.h1 variants={fadeUp}>
            Every second
            <span> matters.</span>
            <br />
            Find a donor faster.
          </motion.h1>

          <motion.p variants={fadeUp}>
            BloodBridge connects emergency blood requests with eligible
            nearby donors while protecting donor privacy until they accept.
          </motion.p>

          <motion.div className="hero-buttons" variants={fadeUp}>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to="/register" className="primary-button">
                <Droplets size={19} />
                Request Blood
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to="/register" className="secondary-button">
                <HeartPulse size={19} />
                Become a Donor
              </Link>
            </motion.div>

          </motion.div>

          <motion.div className="mini-features" variants={fadeUp}>

            <div>
              <ShieldCheck />
              Privacy First
            </div>

            <div>
              <MapPin />
              Location Matching
            </div>

            <div>
              <HeartPulse />
              Fast Response
            </div>

          </motion.div>

        </motion.div>

        {/* HERO ANIMATED CARD */}
        <motion.div
          className="hero-card-area"
          initial={{ opacity: 0, scale: 0.85, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.3,
          }}
        >

          <motion.div
            className="emergency-card"
            animate={{
              y: [0, -9, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >

            <div className="emergency-header">
              <div>
                <span>EMERGENCY REQUEST</span>
                <h3>Blood Needed</h3>
              </div>

              <motion.div
                className="critical-label"
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                CRITICAL
              </motion.div>
            </div>

            <div className="blood-info">
              <motion.div
                className="blood-circle"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(220,38,38,0)",
                    "0 0 25px rgba(220,38,38,0.35)",
                    "0 0 0px rgba(220,38,38,0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                O+
              </motion.div>

              <div>
                <strong>2 Units Required</strong>
                <span>ABC Hospital, Kochi</span>
              </div>
            </div>

            <motion.div
              className="match-found"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.6,
              }}
            >
              <div className="match-icon">
                <HeartHandshake />
              </div>

              <div>
                <strong>Eligible donor found</strong>
                <span>Contact information protected</span>
              </div>
            </motion.div>

            {/* STATUS TIMELINE */}
            <div className="status-flow">

              <div className="status-item complete">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ✓
                </motion.span>

                Request
              </div>

              <motion.div
                className="status-line"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                }}
              />

              <div className="status-item complete">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  ✓
                </motion.span>

                Match
              </div>

              <motion.div
                className="status-line"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 1.4,
                  duration: 0.5,
                }}
              />

              <div className="status-item active">
                <motion.span
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  3
                </motion.span>

                Accept
              </div>

            </div>

          </motion.div>

          {/* FLOATING NOTIFICATION */}

          <motion.div
            className="floating-notification notification-one"
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <BellRing size={21} />

            <div>
              <strong>Donor notified</strong>
              <span>Just now</span>
            </div>
          </motion.div>

          <motion.div
            className="floating-notification notification-two"
            animate={{
              y: [0, 7, 0],
            }}
            transition={{
              duration: 3.7,
              repeat: Infinity,
            }}
          >
            <ShieldCheck size={21} />

            <div>
              <strong>Privacy protected</strong>
              <span>Contact locked</span>
            </div>
          </motion.div>

        </motion.div>

      </section>

      {/* FLOW */}

      <section className="how-section" id="how">

        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span>HOW BLOODBRIDGE WORKS</span>

          <h2>
            From emergency request
            <br />
            to donor connection.
          </h2>

          <p>
            One simple flow designed to reduce the time spent searching for
            donors.
          </p>
        </motion.div>

        <div className="steps-grid">

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{
                opacity: 0,
                y: 45,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: index * 0.13,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
            >

              <span className="step-number">
                {step.number}
              </span>

              <motion.div
                className="step-icon"
                whileHover={{
                  rotate: 7,
                  scale: 1.1,
                }}
              >
                {step.icon}
              </motion.div>

              <h3>{step.title}</h3>

              <p>{step.text}</p>

            </motion.div>
          ))}

        </div>

      </section>

      {/* PRIVACY */}

      <motion.section
        className="privacy-section"
        id="privacy"
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
        }}
      >

        <motion.div
          className="privacy-icon"
          animate={{
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          <ShieldCheck size={40} />
        </motion.div>

        <div>
          <span>PRIVACY BY DESIGN</span>

          <h2>
            Your contact details aren't part of the search.
          </h2>

          <p>
            Donor information remains protected during matching.
            Personal contact information is revealed only when the donor
            voluntarily accepts the request.
          </p>
        </div>

      </motion.section>

      {/* CTA */}

      <motion.section
        className="final-cta"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >

        <div>
          <span>BE PART OF THE BRIDGE</span>

          <h2>
            One response could make
            <br />
            all the difference.
          </h2>

          <p>
            Join as a blood donor or create an emergency request.
          </p>
        </div>

        <motion.div
          whileHover={{
            scale: 1.06,
          }}
          whileTap={{
            scale: 0.96,
          }}
        >
          <Link to="/register" className="cta-button">
            Get Started
            <ArrowRight />
          </Link>
        </motion.div>

      </motion.section>

      <footer>

        <div className="brand">
          <div className="brand-icon">
            <Droplets />
          </div>

          <div>
            <strong>BloodBridge</strong>
            <span>Connecting lives</span>
          </div>
        </div>

        <p>
          Emergency donor matching with privacy at its core.
        </p>

        <span>
          © 2026 BloodBridge
        </span>

      </footer>

    </div>
  );
}

export default Home;