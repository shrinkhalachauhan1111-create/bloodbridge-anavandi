# 🩸 BloodBridge

BloodBridge is a privacy-first blood donor matching platform designed to connect urgent blood requests with eligible nearby donors.

The platform matches donors based on blood group, availability, donation interval, and geographic distance while keeping donor contact details private until the donor accepts the request.

## 🌐 Live Demo

### Advanced Frontend
https://bloodbridge-frontend-advanced.onrender.com

### Backend API
https://bloodbridge-anavandi-advanced.onrender.com

### API Documentation
https://bloodbridge-anavandi-advanced.onrender.com/docs

---

## 🚨 Problem

During medical emergencies, finding an eligible blood donor quickly can be difficult.

Traditional approaches often depend on:

- Manual phone calls
- Social media posts
- WhatsApp groups
- Large donor lists without location-based filtering
- Sharing personal contact information publicly

BloodBridge provides a structured donor-matching workflow.

---

## 💡 Solution

BloodBridge follows this flow:

Request Blood
↓
Find Eligible Donors
↓
Calculate Distance
↓
Match Nearby Donors
↓
Notify Donor
↓
Donor Accepts / Declines
↓
Requester Gets Notification
↓
Donor Contact Is Unlocked

---

## ✨ Features

### 🩸 Blood Request Management

Requesters can create emergency blood requests containing:

- Blood group
- Number of units
- Hospital name
- City
- Urgency
- Current GPS location

---

### 📍 Location-Based Matching

BloodBridge captures latitude and longitude using browser geolocation.

The backend calculates the distance between the requester and eligible donors using the Haversine formula.

Eligible donors are ordered according to geographic distance.

---

### ❤️ Donor Eligibility

Donors are filtered based on:

- Required blood group
- Availability
- Donation interval
- Location

The donation interval used in this project is prototype matching logic and should not be treated as medical advice.

---

### 🔔 Two-Way Notifications

When a request is matched:

- The donor receives a notification about the blood request.

When a donor accepts:

- The requester receives an acceptance notification.

---

### 🔐 Privacy-First Contact Sharing

Donor contact information remains private during the matching process.

Contact details are made available to the requester only after the donor accepts the request.

---

### ✅ Accept / Decline Requests

Donors can:

- Accept a blood request
- Decline a blood request

After accepting a request, the donor is marked unavailable to prevent simultaneous matching with another active request.

---

### 📊 Requester Dashboard

The requester dashboard provides:

- Total requests
- Searching requests
- Matched requests
- Completed requests
- Recent blood requests
- Matching donor count
- Accepted donor information

---

### 🧑‍⚕️ Donor Dashboard

The donor dashboard provides:

- Donor profile
- Availability status
- Incoming requests
- Request distance
- Urgency
- Accepted requests
- Declined requests
- Cancelled requests

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- Framer Motion

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database

- PostgreSQL
- Neon

### Deployment

- Render

---

## 🏗️ Architecture

```text
                User
                  |
                  v
          React + Vite Frontend
                  |
               Axios
                  |
                  v
             FastAPI API
                  |
        ---------------------
        |         |         |
        v         v         v
 Authentication Matching Notifications
                  |
                  v
             SQLAlchemy
                  |
                  v
          PostgreSQL / Neon

🔄 Matching Flow
Blood Request Created
        |
        v
Check Blood Group
        |
        v
Check Donor Availability
        |
        v
Check Donation Interval
        |
        v
Calculate GPS Distance
        |
        v
Sort Eligible Donors
        |
        v
Create Matches
        |
        v
Notify Donors
        |
        v
Accept / Decline
        |
        v
Notify Requester
        |
        v
Unlock Donor Contact
📁 Project Structure
BloodBridge/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
🔑 Main API Endpoints
Authentication
POST /auth/register
POST /auth/login
GET  /auth/me
Donors
POST  /donors/profile
GET   /donors/profile
PATCH /donors/availability
Blood Requests
POST /requests
GET  /requests/my
GET  /requests/{request_id}
Matching
GET   /matches/my
PATCH /matches/{match_id}/accept
PATCH /matches/{match_id}/decline
GET   /matches/{match_id}/contact
Notifications
GET   /notifications
PATCH /notifications/{notification_id}/read
Dashboards
GET /dashboard/requester
GET /dashboard/donor
🔒 Security

BloodBridge uses:

JWT-based authentication
Password hashing
Protected API routes
Role-based access
CORS configuration
Environment variables for secrets
Privacy-controlled donor contact access

Sensitive files such as .env are excluded from Git using .gitignore.

🚀 Running Locally
Backend
cd backend
python -m venv .venv

Activate the environment and install dependencies:

pip install -r requirements.txt

Start FastAPI:

python -m uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs
Frontend
cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
⚠️ Prototype Disclaimer

BloodBridge is a hackathon/prototype application.

Blood donation eligibility must ultimately follow medical guidelines and decisions made by qualified healthcare professionals. The matching rules implemented in this application should not be considered medical advice.

👩‍💻 Developer

Shrinkhala Chauhan

MCA Student
Cochin University of Science and Technology (CUSAT)

GitHub:
https://github.com/shrinkhalachauhan1111-create


After pasting it, scroll down on GitHub. In **Commit changes**, enter:

```text
Add BloodBridge project README
