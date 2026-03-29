---

# 🚀 Tutor supporting system 

This project is built using the **MERN stack**, leveraging **Vite** for a fast React frontend and **Node.js/Express.js** for the backend, with **Mongoose** handling MongoDB interactions.

---

## 🛠 Prerequisites

Make sure you have Node.js (which includes npm) installed and running.

MongoDB Compass is optional and can be used to manually inspect or modify the database, for example to debug issues, fix records, or explore collections.

---

## ⚙️ Environment Setup

Before running the application, you need to configure the environment variables:

1.  Navigate to the `backend` folder.
2.  Copy `.env.example` to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open `.env` and fill in your actual values (MongoDB URI, JWT Secret, etc.).

---

## 🌐 Running the Application

The application requires the frontend and backend to be started separately.

### Frontend (Vite + React)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm i

# Start development server
npm run dev
```

> The frontend server will typically run on [http://localhost:5173](http://localhost:5173).

### Backend (Node.js + Express.js + Mongoose)

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm i

# Start backend server
npm run server
```

> The backend server will typically run on [http://localhost:4000](http://localhost:4000) (or the port defined in your configuration).

---

## 🔗 Notes

*   The backend requires a `.env` file to connect to MongoDB and handle authentication.
*   Frontend and backend communicate via API endpoints defined in the backend.

---
