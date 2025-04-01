import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/about"
          element={
            <div>
              <h1>Hello</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
