import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "@/firebase";
import { toast } from "sonner";
import { useAppStore } from "@/store";
import { FaGoogle } from "react-icons/fa";

const OAuth = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      console.log("Google Sign-in Result:", resultsFromGoogle);

      // Send user data to the backend
      const res = await fetch("http://localhost:8747/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("Response Data:", data);

      if (res.ok) {
        toast.success("Login successful!");

        // Save token in localStorage
        localStorage.setItem("access_token", data.token);

        // Store user info in global state
        setUserInfo(data.user);

        // Redirect to chat if profile is set up, else go to profile setup
        navigate(data.user.profileSetup ? "/chat" : "/profile");
      } else {
        toast.error(data.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error("Google authentication failed.");
    }
  };

  return (
    <button type="button" onClick={handleGoogleAuth} className="text-[28px] cursor-pointer text-center bold flex items-center justify-center">
      <FaGoogle />
    </button>
  );
};

export default OAuth;
