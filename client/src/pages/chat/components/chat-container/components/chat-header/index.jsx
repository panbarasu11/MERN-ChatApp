import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  // ✅ Ensure selectedChatData is defined before using it
  if (!selectedChatData) {
    return <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-center">Loading...</div>;
  }

  // ✅ Extract user data safely
  const firstName = selectedChatData?.firstName || "";
  const lastName = selectedChatData?.lastName || "";
  const email = selectedChatData?.email || "";
  const avatarColor = selectedChatData?.color || "bg-gray-500";
  const profileImage = selectedChatData?.image ? `${HOST}/${selectedChatData.image}` : null;

  // ✅ Safely get the first letter
  const avatarInitial = firstName ? firstName.charAt(0) : email.charAt(0);

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20 ">
      <div className="flex gap-5 items-center justify-between w-full">
        <div className="flex gap-3 items-center justify-center">
          {selectedChatType === "contact" ? (
            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="profile" className="object-cover w-full h-full bg-black rounded-full" />
              ) : (
                <div className={`uppercase h-12 w-12 md:w-12 md:h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(avatarColor)}`}>
                  {avatarInitial}
                </div>
              )}
            </Avatar>
          ) : (
            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
              #
            </div>
          )}

          <div>
            {selectedChatType === "channel" && selectedChatData?.name}
            {selectedChatType === "contact"
              ? `${firstName} ${lastName}`.trim() || email
              : email}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5">
          <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={closeChat}>
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
