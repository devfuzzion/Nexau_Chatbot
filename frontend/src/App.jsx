import "./App.css";
import { useEffect, useState } from "react";
import { getUserData } from "./api/chatService";
import Chatbot from "./assets/components/chatbot/page.jsx";
const App = () => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState("guest");
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://242456567.hs-sites-na2.com") return;
  
      if (event.data.type === "hubspot_cookies") {
        const cookies = event.data.data;
        console.log("✅ Received cookies from HubSpot parent:", cookies);
      }
    };
  
    window.addEventListener("message", handleMessage);
  
    return () => {
      window.removeEventListener("message", handleMessage); // Cleanup on unmount
    };
  }, []);

  



  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookieName = "hubspotutk";
        const cookies = document.cookie.split("; ");
        const userIdCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
        const userId = userIdCookie ? userIdCookie.split("=")[1] : null;
        setUserId(userId);
        console.log(userId);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userId);
        setUserData(data);
      } catch (err) { 
        console.error("Failed to fetch user data", err);
      } finally {
        // setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);
  

  // if (loading) return <div>Loading...</div>;

  return <Chatbot userData={userData} setUserData={setUserData} />;
};

export default App;
