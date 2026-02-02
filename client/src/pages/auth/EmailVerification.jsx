import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { EMAIL_VERIFICATION_ROUTE } from "@/utils/constants";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      try {
        //console.log("API Call:", `${EMAIL_VERIFICATION_ROUTE}?token=${token}`);

        const response = await apiClient.get(
          `${EMAIL_VERIFICATION_ROUTE}?token=${token}`,
          {
            withCredentials: true,
          }
        );
        navigate("/verify-email");
        console.log("Verification successful:", response.data);
        toast.success(response.data.message);
        navigate("/login");
      } catch (error) {
        console.error("Verification error:", error.response);
        toast.error(error.response?.data?.message || "Verification failed.");
        navigate("/");
      }
    };

    if (!token) {
      console.log("Invalid verification link || token is null.");
      navigate("/");
      return;
    }

    verify();
  }, [token, navigate]);

  return <div>Verifying your email...</div>;
};

export default VerifyEmail;
