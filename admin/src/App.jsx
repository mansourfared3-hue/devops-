import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Attendance from "./pages/Attendance.jsx";
import Shifts from "./pages/Shifts.jsx";
import Users from "./pages/Users.jsx";
import Rewards from "./pages/Rewards.jsx";

// حارس بسيط: لو مفيش توكن أدمن يرجّع لصفحة الدخول
function Guard({ children }) {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/materials" element={<Guard><Materials /></Guard>} />
      <Route path="/attendance" element={<Guard><Attendance /></Guard>} />
      <Route path="/shifts" element={<Guard><Shifts /></Guard>} />
      <Route path="/users" element={<Guard><Users /></Guard>} />
      <Route path="/rewards" element={<Guard><Rewards /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
