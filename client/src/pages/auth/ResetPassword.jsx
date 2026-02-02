import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Toaster, toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { RESET_PASSWORD_ROUTE } from "@/utils/constants";
import { IoArrowBack } from "react-icons/io5";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      console.log(
        await apiClient.post(`${RESET_PASSWORD_ROUTE}/${token}`, {
          newPassword,
        })
      );
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed.");
      console.error("Reset error:", error.response?.data);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3">
      <Toaster />
      <div
        className="flex gap-10 justify-center items-center"
        onClick={() => navigate("/forgot-password")}
      >
        <IoArrowBack className="text-4xl lg:text-6xl text-opacity-90 cursor-pointer" />
      </div>
      <h1 className="text-3xl font-semibold">Reset Password</h1>
      <p className="text-gray-500">Enter a new password.</p>

      <PasswordInput
        placeholder="New Password"
        className="mt-5 p-4 w-80"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <PasswordInput
        placeholder="Confirm Password"
        className="mt-3 p-4 w-80"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        className="mt-3 w-80 p-4"
        onClick={handleResetPassword}
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </div>
  );
};

export default ResetPassword;
