import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/registration";
import CollegeDashboard from "./pages/collegeDashboard";
import CompanyDashboard from "./pages/companyDashboard";
import AdminDashboard from "./pages/adminDashboard";

function Home() {
  return (
    <div>
      <h1>CampusConnect</h1>
      <p>College–Company Recruitment & Internship Platform</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/college"
          element={<CollegeDashboard />}
        />

        <Route
          path="/company"
          element={<CompanyDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;