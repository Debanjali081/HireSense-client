
# 🚀 HireSense – AI-Powered Mock Interview Platform

HireSense is a smart, AI-powered platform that helps job seekers practice interviews with real-time feedback. Upload your resume, choose a job role, and get personalized interview questions with voice interaction and performance evaluation.

---

## ✨ Features

- 🔐 Google OAuth login using Passport.js
- 📄 Resume upload and parsing (coming soon)
- 🤖 AI-generated interview questions (OpenAI API)
- 🗣️ Real-time mock interviews using WebRTC/WebSockets
- 📊 Voice analysis with ML (tone, speed, confidence)
- 🌐 Full-stack TypeScript (MERN + Vite)

---

## 🧱 Tech Stack

| Layer       | Technology                          |
|------------|--------------------------------------|
| Frontend    | React + Vite + TypeScript + Tailwind |
| Backend     | Node.js + Express + TypeScript       |
| Auth        | Google OAuth 2.0 (Passport.js)       |
| Database    | MongoDB (Mongoose ODM)               |
| AI/ML       | OpenAI API + DeepSpeech (planned)    |

---

## 📁 Project Structure

```

HireSense/
├── client/               # React frontend (Vite + TypeScript)
├── server/               # Express backend (TypeScript)
│   ├── src/
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── dao/          # DB access layer
│   │   ├── auth/         # Passport OAuth config
│   │   ├── services/     # Business logic layer
│   │   ├── controllers/  # Controller functions
│   │   ├── index.ts      # Express app config
│   │   └── server.ts     # Entry point
│   └── .env              # Env vars for API keys, secrets

````

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HireSense.git
cd HireSense
````

### 2. Backend Setup (`/server`)

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=some_secret_key
OPENAI_API_KEY=your_openai_api_key
```

Run the server in dev mode:

```bash
npm run dev
```

---

### 3. Frontend Setup (`/client`)

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Authentication Flow

* Google login handled via `/api/auth/google`
* Backend uses sessions to track logged-in users
* Frontend triggers OAuth with a redirect button

---

## 📦 API Endpoints (WIP)

* `GET /api/auth/google` – Initiates OAuth login
* `GET /api/auth/google/callback` – Handles callback
* `GET /api/auth/logout` – Logs the user out
* `GET /api/me` – Returns current logged-in user

---

## 🛠️ Future Enhancements

* 🧾 Resume upload + NLP extraction
* 🎤 Real-time voice interview simulation
* 📈 AI feedback dashboard
* 🧠 Role-based question difficulty (Beginner, Mid, Senior)

---

## 🧑‍💻 Author

**Debanjali Lenka**
💼 Full Stack Developer | Blockchain Enthusiast
📧 [debanjalilenka.dev@example.com](mailto:debanjalilenka.dev@example.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```

---

Let me know if you'd like a **dark-themed badge-rich version**, or if you're ready to push this to GitHub — I can help generate `.gitignore`, license, or project board too!
```
