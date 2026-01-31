import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import NavBar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import JoinWorkspacePage from "./pages/JoinWorkspacePage";
import DashboardPage from "./pages/DashboardPage";
import WorkspaceManagePage from "./pages/WorkspaceManagePage";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <BrowserRouter>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/join/:wsId" element={<JoinWorkspacePage />} />
        <Route
          path="/dashboard"
          element={
            user ? <DashboardPage user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard/workspaces/:wsId"
          element={
            user ? (
              <WorkspaceManagePage user={user} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
