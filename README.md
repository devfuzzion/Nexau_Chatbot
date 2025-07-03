---
# 🧠 Nexau AI Chatbot

This is a full-stack project with a **React** frontend and an **Express.js** + **PostgreSQL** backend. The application supports Markdown editing, LaTeX math rendering, and AI integration via OpenAI.
---

## 📁 Project Structure

- `backend/` – Node.js + Express server with PostgreSQL and Airtable integration
- `frontend/` – React + Vite frontend for the Markdown editor

---

## ⚙️ Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **PostgreSQL** (for backend database)
- Airtable account if using Airtable features
- OpenAI API key for AI functionality

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/devfuzzion/Nexau_Chatbot
cd Nexau_Chatbot
```

---

## 📦 Backend Setup

### 📁 Path: `/backend`

### Install Dependencies

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
OPENAI_API_KEY=
ASSISTANT_ID=
DATABASE_URL=
DB_USERNAME=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB=
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_CONVERSATIONS_TABLE_NAME=
AIRTABLE_FEEDBACKS_TABLE_NAME=
AIRTABLE_USER_DATA_TABLE_NAME=
```

> 🔒 Add values accordingly.

### Run the Server

```bash
npm start
```

- The server will start on `http://localhost:3000`
- Uses `nodemon` for auto-reloading in development

---

## 🖥️ Frontend Setup

### 📁 Path: `/frontend`

### Install Dependencies

```bash
cd frontend
npm install
```

### Run the Dev Server

```bash
npm run dev
```

- Starts the Vite dev server on `http://localhost:5173` (by default)

### Build for Production

```bash
npm run build
```

---

## 🔗 API & Features

### Backend Features

- **REST API** built using Express
- PostgreSQL + `pg` + `postgres` client support
- Airtable integration
- File upload support via `multer`
- OpenAI integration for AI-powered features

### Frontend Features

- Live Markdown preview (`react-markdown`, `marked`)
- LaTeX rendering with `KaTeX` and `MathJax`
- React Router-based navigation
- SweetAlert2 for clean modals
- Lucide Icons for a sleek UI
- Axios for API communication

---

## 🧪 Scripts

### Backend

| Script | Command     | Description              |
| ------ | ----------- | ------------------------ |
| Start  | `npm start` | Start backend server     |
| Test   | `npm test`  | Placeholder test command |

### Frontend

| Script  | Command           | Description                 |
| ------- | ----------------- | --------------------------- |
| Dev     | `npm run dev`     | Start Vite dev server       |
| Build   | `npm run build`   | Build production bundle     |
| Preview | `npm run preview` | Preview production build    |
| Lint    | `npm run lint`    | Run ESLint for code quality |

---

## ✍️ Author

Made with 💻 by Devfuzzion
