# Deven Cowork — Workspace & Lead Reservation System

A production-ready website and reservation booking system built for **Deven Cowork** (Raipur, India), migrated from a Replit multi-package monorepo workspace into a consolidated standard MERN stack.

---

## 1. Technology Architecture

The workspace is restructured into a clean client-server architecture:

- **Frontend (`client/`)**: Built using **React.js** + **Vite**. Implements a mobile-first premium dark mode landing page, form submission client services, and an administrative dashboard panel. Utilizes Wouter for client routing and Tailwind CSS v4 for layout rendering.
- **Backend (`server/`)**: Built using **Node.js** + **Express.js**. Provides restful endpoints under an MVC architecture (routes, controllers, models, and middleware validation).
- **Database**: Built using **MongoDB** + **Mongoose** (replacing the empty PostgreSQL configuration). Registers custom schemas for user identity tracking and pre-bookings.
- **Authentication**: Secured with **JSON Web Tokens (JWT)** and **bcryptjs** password hashing for protected admin actions.

---

## 2. Directory Layout

```text
project-root/
│
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static favicon, robots.txt
│   ├── src/
│   │   ├── components/     # UI primitives and error boundary
│   │   ├── pages/          # Admin login, Admin dashboard, NotFound
│   │   ├── services/       # API client layer (fetch)
│   │   ├── App.jsx         # Client routing configuration
│   │   └── main.jsx        # JS/React Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite compile directives
│
├── server/                 # Express Backend (Node)
│   ├── config/             # Mongoose database pool
│   ├── controllers/        # Reservation and authentication handlers
│   ├── middleware/         # Auth verify checks
│   ├── models/             # Schema structures (User, Reservation)
│   ├── routes/             # REST route mappings
│   ├── app.js              # Express app definitions
│   ├── server.js           # Server startup script
│   └── package.json        # Backend dependencies
│
├── .env                    # Environment secrets (ignored)
├── .env.example            # Environment templates
├── package.json            # Root running scripts
└── README.md               # Documentation (This file)
```

---

## 3. Configuration & Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# Server Running Parameters
PORT=5000
NODE_ENV=development

# Database Pool String
MONGO_URI=mongodb://127.0.0.1:27017/deven_cowork

# JWT Secret Signature
JWT_SECRET=deven_cowork_local_jwt_secret_982347

# Admin Seed Credentials (Auto-created on start)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 4. How to Run

### Installation
From the project root directory, install all client and server dependencies with a single command:
```bash
npm run setup
```

### Run in Development
Start both the React development server and the Express API server concurrently:
```bash
npm run dev
```
- **Frontend** will be active at: [http://localhost:3000/](http://localhost:3000/)
- **Backend API** will be active at: [http://localhost:5000/api/](http://localhost:5000/api/)
- **Health check** is available at: [http://localhost:5000/api/healthz](http://localhost:5000/api/healthz)

### Run in Production
To compile and deploy the production bundle:
1. Build the frontend client assets:
   ```bash
   npm run build
   ```
2. Start the Express server (which automatically serves the client build statically):
   ```bash
   npm start
   ```

---

## 5. Administrative Access

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) in the browser.
2. Sign in using the default credentials configured in your `.env` file (Username: `admin`, Password: `admin123`).
3. You will be redirected to the secure **Admin Dashboard** (`/admin`) where you can view total seat metrics and review the pre-booking spreadsheet in real time.
