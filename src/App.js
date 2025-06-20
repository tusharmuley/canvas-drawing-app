import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Projects from "./pages/Projects";
import Board from "./pages/Board";
// import DrawingBoard from "./components/DrawingBoard/";

const token = () => localStorage.getItem("access_token");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token() ? <Navigate to="/projects" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        {token() && (
          <>
            <Route path="/projects" element={<Projects />} />
            <Route path="/board/:slug" element={<Board />} />
            {/* <Route path="/" element={<DrawingBoard />} /> */}
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
