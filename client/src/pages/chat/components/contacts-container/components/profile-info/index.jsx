import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST, LOGOUT_ROUTE, SUBMIT_FEEDBACK_ROUTES } from "@/utils/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { IoPowerSharp } from "react-icons/io5";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmitFeedback = async () => {
    if (feedback.trim() !== "") {
      try {
        await apiClient.post(SUBMIT_FEEDBACK_ROUTES, { feedback });
        console.log("Feedback submitted successfully.");
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    }
    handleLogout(); // Proceed with logout after feedback
  };

  const handleLogout = async () => {
    try {
      const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      {/* Profile Section */}
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {userInfo.image ? (
              <AvatarImage
                src={`${HOST}/${userInfo.image}`}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-12 w-12 md:w-12 md:h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  userInfo.color
                )}`}
              >
                {userInfo.firstName
                  ? userInfo.firstName.charAt(0)
                  : userInfo.email.charAt(0)}
              </div>
            )}
          </Avatar>
        </div>
        <div>
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2 className="text-purple-500 text-xl font-medium" onClick={() => navigate("/profile")} />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Logout Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp className="text-red-500 text-xl font-medium" onClick={() => setOpen(true)} />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* ShadCN Dialog for Feedback */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>Before you log out, let us know your thoughts!</DialogDescription>
          <Textarea
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-2"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="outline" onClick={handleLogout}>Skip & Logout</Button>
            <Button variant="default" onClick={handleSubmitFeedback}>Submit & Logout</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileInfo;
