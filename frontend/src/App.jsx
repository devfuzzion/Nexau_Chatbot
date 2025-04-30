import "./App.css";
import { useEffect, useState } from "react";
import { getUserData } from "./api/chatService";
import Chatbot from "./assets/components/chatbot/page.jsx";
const App = () => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || "guest");
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current URL search parameters
    const queryParams = new URLSearchParams(window.location.search);
    const cookieValue = queryParams.get('cookieValue');

    if (cookieValue) {
      console.log('Received cookie value:', cookieValue);
      localStorage.setItem('userId', cookieValue);
      // localStorage.setItem('userId', "guest");
    }
    console.log("cookieValue", cookieValue);
    
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData(userId);
        setUserData(data);
        console.log("userData", data);
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
