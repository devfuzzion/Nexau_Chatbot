import "./App.css";
import { useEffect, useState } from "react";
import { getUserData } from "./api/chatService";
import Chatbot from "./assets/components/chatbot/page.jsx";
import { MathJaxContext } from "better-react-mathjax";

const LOGIN_KEY = "chatbot_login_time";
const LOGIN_DURATION = 24 * 60 * 60 * 1000; // 1 day in ms

const App = () => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(
    localStorage.getItem("userId") || "guest",
  );

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem(LOGIN_KEY);
    if (!saved) return false;
    const savedTime = parseInt(saved);
    return Date.now() - savedTime < LOGIN_DURATION;
  });

  const [form, setForm] = useState({ id: "", pass: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const cookieValue = queryParams.get("cookieValue");

    if (cookieValue) {
      localStorage.setItem("userId", cookieValue);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userId);
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleLogin = () => {
    const { id, pass } = form;
    if (id === "qwerty" && pass === "yuiop") {
      localStorage.setItem(LOGIN_KEY, Date.now().toString());
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid ID or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-wall">
        <h2 className="login-heading">Login Required</h2>
        <input
          className="login-input"
          type="text"
          placeholder="Enter ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Enter Password"
          value={form.pass}
          onChange={(e) => setForm({ ...form, pass: e.target.value })}
        />
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    );
  }

  return (
    <MathJaxContext>
      <Chatbot userData={userData} setUserData={setUserData} />
    </MathJaxContext>
  );
};

export default App;
