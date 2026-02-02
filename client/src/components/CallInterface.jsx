import React, { useEffect } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { 
  FaPhone, 
  FaPhoneSlash, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaDesktop,
  FaStop
} from 'react-icons/fa';

const CallInterface = ({ userId, remoteUserId, remoteUserName, socket, onClose }) => {
  const {
    localStream,
    remoteStream,
    callStatus,
    callType,
    isMuted,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    initCall,
    answerCall,
    endCall,
    toggleMute,
    toggleScreenShare,
    rejectCall
  } = useWebRTC(userId, remoteUserId, socket);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  if (callStatus === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[1000]">
      {/* Incoming Call Modal */}
      {callStatus === 'ringing' && (
        <div className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Incoming {callType} Call</h2>
          <p className="mb-4">From: {remoteUserName}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={answerCall}
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-all"
            >
              <FaPhone size={20} />
            </button>
            <button 
              onClick={rejectCall}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all"
            >
              <FaPhoneSlash size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Active Call Interface */}
      {callStatus === 'active' && (
        <>
          <div className="text-white text-xl mb-4">
            {callType === 'video' ? 'Video Call' : 'Voice Call'} with {remoteUserName}
          </div>
          
          <div className="w-full max-w-[1200px] h-[70vh] mb-5 relative">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full bg-black rounded-lg object-cover"
            />
            {callType === 'video' && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-white object-cover"
              />
            )}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full text-white ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:opacity-90 transition-all`}
            >
              {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
            </button>
            
            {callType === 'video' && (
              <button 
                onClick={toggleScreenShare}
                className={`p-3 rounded-full text-white ${isScreenSharing ? 'bg-blue-500' : 'bg-gray-700'} hover:opacity-90 transition-all`}
              >
                {isScreenSharing ? <FaStop size={20} /> : <FaDesktop size={20} />}
              </button>
            )}
            
            <button 
              onClick={handleEndCall}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all"
            >
              <FaPhoneSlash size={20} />
            </button>
          </div>
        </>
      )}

      {/* Calling/Ended Status */}
      {(callStatus === 'calling' || callStatus === 'ended') && (
        <div className="text-white text-xl">
          {callStatus === 'calling' ? 'Calling...' : 'Call ended'}
        </div>
      )}
    </div>
  );
};

export default CallInterface;