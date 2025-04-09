import "./App.css";
import { useEffect, useState } from "react";
import { getUserData } from "./api/chatService";
import Chatbot from "./assets/components/chatbot/page.jsx";
const App = () => {
  const [userData, setUserData] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData(1);
        setUserData(data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, []);

  // if (loading) return <div>Loading...</div>;

  return <Chatbot userData={userData} setUserData={setUserData} />;
};

export default App;
