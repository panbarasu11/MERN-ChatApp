import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { MailIcon } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { TiLockOpen } from "react-icons/ti";
import OAuth from "./OAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regEx = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,8}$/;
    return regEx.test(email);
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    if (!hasUpperCase) {
      toast.error("Password must contain at least one uppercase letter.");
      return false;
    }
    if (!hasLowerCase) {
      toast.error("Password must contain at least one lowercase letter.");
      return false;
    }
    if (!hasNumber) {
      toast.error("Password must contain at least one number.");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateEmail(signupEmail)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!signupEmail || !signupPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (!validatePassword(signupPassword)) {
      return;
    }
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true); // Disable button
      await apiClient.post(
        SIGNUP_ROUTE,
        { email: signupEmail, password: signupPassword },
        { withCredentials: true }
      );
      toast.success(
        "Signup successful! Please check your email for verification."
      );
      navigate("/waiting-for-verification");
      // navigate("/verify-email");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false); // Enable button again
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(loginEmail)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!loginEmail || !loginPassword) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setLoading(true); // Disable button
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email: loginEmail, password: loginPassword },
        { withCredentials: true }
      );

      setUserInfo(response.data.user);
      toast.success("Login successful!");

      navigate(response.data.user.profileSetup ? "/chat" : "/profile");
    } catch (error) {
      navigate("");
      console.log("Error response:", error.response?.data); // Debugging
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false); // Enable button again
    }
  };


  return (
    <div className="h-screen flex items-center justify-center">
      <Toaster />
      <div className="h-[90vh] bg-white border-2 text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-5 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center mt-[-70px]">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory Emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>

          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none  data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 w-[50%] transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none  data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 w-[50%] transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent className="flex flex-col gap-7 mt-7" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={loginEmail}
                  suffix={<MailIcon />}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />

                <PasswordInput
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6 w-full relative"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <Button
                  className="rounded-full p-6"
                  onClick={handleLogin}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? "Loging Up..." : "Login"}{" "}
                  {/* Change text when loading */}
                </Button>
                <span className="text-center">Or</span>
                <OAuth />
                {/* Forgot Password Link */}
                <Button
                  className="text-sm mt-2"
                  onClick={() => navigate("/forgot-password")}
                >
                  <TiLockOpen className="text-lg mr-2" />
                  Forgot Password?
                </Button>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent className="flex flex-col gap-5" value="signup">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6"
                  value={signupEmail}
                  suffix={<MailIcon />}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
                <PasswordInput
                  placeholder="Password"
                  type="password"
                  className="rounded-full p-6 w-full"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-full p-6 w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                />
                <Button
                  className="rounded-full p-6"
                  onClick={handleSignup}
                  disabled={loading} // Disable button while loading
                >
                  {loading ? "Signing Up..." : "Signup"}{" "}
                  {/* Change text when loading */}
                </Button>
                <span className="text-center">Or</span>
                <OAuth />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Background Image Section */}
        <div className="hidden xl:flex items-center justify-center">
          <img src={Background} alt="Background Image" className="h-full" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
