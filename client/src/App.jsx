import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { useAppStore } from "./store";
import { apiClient } from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";
import axios from "axios";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/EmailVerification";
import WaitingForVerification from "./pages/auth/WaitingForVerification";


const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getUser = async () => {
    try {
      const url = "http://localhost:5173/auth/login/success";
      const { data } = await axios.get(url, { withCredentials: true });
      setUser(data.user._json);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
        console.log({ response });
      } catch (error) {
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };
    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  useEffect(() => {
    getUser();
  }, []);

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          exact
          path="/"
          element={user ? <Profile /> : <Navigate to="/auth" />}
        />
        <Route
          exact
          path="/login"
          element={user ? <Navigate to="/profile" /> : <Auth />}
        />
        <Route
          exact
          path="/signup"
          element={user ? <Navigate to="/profile" /> : <Auth />}
        />
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/waiting-for-verification" element={<WaitingForVerification />} />

        

        {/* <Route path="/unread-count" element={<UnReadMessages />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
