import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Chatbot from "./assets/components/chatbot/page.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
