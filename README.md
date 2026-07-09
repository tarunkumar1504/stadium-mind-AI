# StadiumPulse AI | FIFA World Cup 2026

StadiumPulse AI is an enterprise-grade, production-ready MERN + GenAI platform designed to tackle crowd congestion, restroom queue bottlenecks, language barriers, and accessibility issues at scale during the FIFA World Cup 2026.

---

## 🏆 Project Highlights & Features
1. **Dynamic Heatmap & SVG Stadium Grid:** Clickable sectors showing real-time crowd status overlays (Clear, Moderate, Congested, Critical).
2. **Least-Congested Pathfinding:** Core Dijkstra routing engine adjusting weights based on live queue counts.
3. **Accessibility Routing Filter:** Reroutes mobility-impaired users to avoid stairs (such as the East Sector) and prioritize ramps and elevators.
4. **Google Gemini Conversational AI:** Conversational queries with local fallback and voice guidance (SpeechSynthesis + webkitSpeechRecognition).
5. **Organizer Operations & Dispatch Center:** Live attendance metrics, dispatch center to issue warning directives, and crowd simulator sliders.
6. **Robust Failover Database Engine:** Operates automatically in an in-memory JSON mock database configuration if no MongoDB is active.

---

## 🏗️ Architecture Design

```
+-------------------------------------------------------------+
|                     REACT VITE FRONTEND                     |
|                                                             |
|   +-------------------+  +--------------+  +------------+   |
|   |   Interactive     |  | AI Assistant |  |  Navbar &  |   |
|   |  SVG Stadium Map  |  |    (Chat)    |  |  Access.   |   |
|   +-------------------+  +--------------+  +------------+   |
|             ^                   ^                ^          |
+-------------|-------------------|----------------|----------+
              | Axios HTTP        |                |
              v                   v                v
+-------------------------------------------------------------+
|                      NODE EXPRESS API                       |
|                                                             |
|   +-------------------+  +--------------+  +------------+   |
|   |      Stadium      |  |  Gemini AI   |  | Auth (JWT) |   |
|   |    Controller     |  |  Controller  |  | Controller |   |
|   +-------------------+  +--------------+  +------------+   |
|             |                   |                |          |
+-------------|-------------------|----------------|----------+
              |                   |                |
              v                   v                |
       +--------------+     +----------+           |
       | Dijkstra.js  |     |  Google  |           |
       | Routing Alg. |     |  Gemini  |           v
       +--------------+     +----------+     +------------+
              |                              |  MongoDB   |
              +=============================>|  database  |
                                             | (Fallback  |
                                             |  JSON DB)  |
                                             +------------+
```

---

## 🚀 Environment Setup

### Prerequisites
- Node.js (v18 or v20)
- Docker & Docker Compose (Optional)
- MongoDB Server (Optional - falls back to Offline JSON DB)

### Setup backend
1. Go to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (a template is provided in `backend/.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stadiumpulse
   JWT_SECRET=supersecretfifaworldcup2026stadiumpulsekey
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Setup frontend
1. Go to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server (proxies `/api` to port 5000):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 🔌 API Documentation

### 🔒 Authentication Endpoints
- **`POST /api/auth/register`**: Signup new spectators or staff.
  - *Payload*: `{ "username": "dan", "email": "dan@test.com", "password": "password123", "role": "fan" }` (or "organizer").
  - *Response*: `{ "token": "JWT_TOKEN", "user": { "username": "dan", "role": "fan" } }`.
- **`POST /api/auth/login`**: Authenticate credentials.
  - *Payload*: `{ "email": "dan@test.com", "password": "password123" }`
  - *Response*: `{ "token": "JWT_TOKEN", ... }`.
- **`GET /api/auth/me`**: Fetch credentials of active JWT bearer token. (Headers: `Authorization: Bearer <TOKEN>`)

### 🧭 Stadium & Pathfinding Endpoints
- **`GET /api/stadium/points`**: Retrieves list of gates, restrooms, food stalls and active metrics.
- **`PUT /api/stadium/points/:id`**: Update point crowdLevel and queueSize.
- **`GET /api/stadium/route`**: Dynamic path routing calculation.
  - *Query Params*: `start=gate_b`, `end=seat_n`, `accessibility=true`
- **`GET /api/stadium/alerts`**: Returns active operations warnings.
- **`POST /api/stadium/alerts`**: Broadcast operational alert (Role: organizer).
- **`PUT /api/stadium/alerts/:id/dismiss`**: Mark alert resolved (Role: organizer).

### 🤖 Gemini AI Assistant Endpoint
- **`POST /api/ai/chat`**: Process prompts using Gemini 1.5 Flash.
  - *Payload*: `{ "prompt": "Where is the closest bathroom?", "language": "Spanish", "accessibilityMode": "true" }`

---

## 🐳 Docker Deployment
To spin up MongoDB, Express, and React together instantly:
```bash
docker-compose up --build
```
The application will map public web ports to `http://localhost:80` (Frontend) and API routes to `http://localhost:5000` (Backend).

---

## 🧪 Testing Suite
Execute Jest testing scripts:
- Backend:
  ```bash
  cd backend
  npm test
  ```
