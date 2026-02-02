import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { FORGOT_PASSWORD_ROUTE } from "@/utils/constants";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(FORGOT_PASSWORD_ROUTE, { email });
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("User not Found");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3">
      <Toaster />
      <div
        className="flex gap-10 justify-center items-center"
        onClick={() => navigate("/login")}
      >
        {" "}
        <IoArrowBack className="text-4xl lg:text-6xl text-opacity-90 cursor-pointer" />
      </div>
      <h1 className="text-3xl font-semibold">Forgot Password?</h1>
      <p className="text-gray-500">Enter your email to reset your password.</p>

      <Input
        placeholder="Email"
        type="email"
        className="mt-5 p-4 w-80"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        className="mt-3 w-80 p-4"
        onClick={handleForgotPassword}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </div>
  );
};

export default ForgotPassword;
