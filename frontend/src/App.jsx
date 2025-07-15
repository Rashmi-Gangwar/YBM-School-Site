import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import LifeatYBM from "./pages/LifeatYBM";
import NewsEvents from "./pages/NewsEvents";
import Register from "./components/Register";

import Academics from "./pages/Academics";
import Admission from "./pages/Admission";

import Login from "./components/Login";

import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";

import AdminPage from "./pages/AdminPage";

function App() {
  const { setIsAuthenticated, setUser } = useContext(Context);

  useEffect(() => {
    const getUser = async () => {
      await axios
        .get("http://localhost:4000/api/v1/user/me", { withCredentials: true })
        .then((res) => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          setUser(null);
          setIsAuthenticated(false);
        });
    };
    getUser();
  }, []);

  return (
    <>
      <Header />
      <main style={{ marginTop: "100px", marginBottom: "0" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/lifeatYBM" element={<LifeatYBM />} />
          <Route path="/events" element={<NewsEvents />} />
          <Route path="/register" element={<Register />} />

          <Route path="/academics" element={<Academics />} />
          <Route path="/admission" element={<Admission />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/otp-verification/:email/:phone"
            element={<OtpVerification />}
          />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />

          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <ToastContainer theme="colored" /> 
      <Footer />
    </>
  );
}

export default App;
