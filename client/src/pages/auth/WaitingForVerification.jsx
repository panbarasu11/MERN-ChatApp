// WaitingForVerification.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TiArrowBack } from "react-icons/ti";

const WaitingForVerification = () => {
  const navigate = useNavigate();
  navigate("verify-email");

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">Verification Pending</h1>
      <p className="text-lg mb-8">
        We've sent a verification email to your inbox. Please check your email
        and follow the instructions to verify your account.
      </p>
      <p className="text-sm mb-4 text-gray-500">
        If you didn't receive the email, check your spam folder or try again.
      </p>

      <Button
        onClick={() => navigate("/")}
        className="flex items-center justify-center gap-2 mt-4 rounded-full p-2"
      >
        <TiArrowBack className="text-lg" />
        Go Back to Home
      </Button>
    </div>
  );
};

export default WaitingForVerification;
