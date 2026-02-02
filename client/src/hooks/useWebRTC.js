import { useState, useEffect, useRef } from 'react';

export const useWebRTC = (userId, remoteUserId, socket) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'calling', 'ringing', 'active', 'ended'
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize media streams and peer connection
  const initCall = async (type) => {
    try {
      setCallType(type);
      setCallStatus('calling');
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia(
        type === 'video' ? { video: true, audio: true } : { audio: true }
      );
      setLocalStream(stream);
      
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add your TURN servers here if needed
        ]
      });
      
      // Add tracks to connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            to: remoteUserId,
            candidate: event.candidate
          });
        }
      };
      
      // Track handler for remote stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      // Connection state handlers
      pc.onconnectionstatechange = () => {
        switch(pc.connectionState) {
          case 'disconnected':
          case 'failed':
            endCall();
            break;
        }
      };
      
      peerConnection.current = pc;
      
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call-user', {
        to: remoteUserId,
        offer,
        callType: type
      });
      
    } catch (err) {
      console.error('Error initializing call:', err);
      endCall();
    }
  };

  // Handle incoming call
  const handleIncomingCall = async ({ from, offer, callType }) => {
    try {
      setCallType(callType);
      setCallStatus('ringing');
      
      const stream = await navigator.mediaDevices.getUserMedia(
        callType === 'video' ? { video: true, audio: true } : { audio: true }
      );
      setLocalStream(stream);
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            to: from,
            candidate: event.candidate
          });
        }
      };
      
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected') {
          endCall();
        }
      };
      
      peerConnection.current = pc;
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('answer-call', {
        to: from,
        answer
      });
      
      setCallStatus('active');
    } catch (err) {
      console.error('Error handling incoming call:', err);
      endCall();
    }
  };

  // End the call
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    setRemoteStream(null);
    setCallStatus('ended');
    setIsScreenSharing(false);
    
    // Notify the other user
    if (remoteUserId) {
      socket.emit('end-call', { to: remoteUserId });
    }
    
    // Reset after cleanup
    setTimeout(() => setCallStatus('idle'), 1000);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      
      // Re-add camera track if video call
      if (callType === 'video') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        // Replace video track with screen share
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.current.getSenders().find(
          s => s.track.kind === 'video'
        );
        if (sender) sender.replaceTrack(videoTrack);
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setCallStatus('active');
      }
    });
    socket.on('ice-candidate', ({ candidate }) => {
      if (peerConnection.current) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
    socket.on('call-rejected', () => {
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 1000);
    });
    socket.on('call-ended', () => {
      endCall();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-rejected');
      socket.off('call-ended');
    };
  }, [socket]);

  return {
    localStream,
    remoteStream,
    callStatus,
    callType,
    isMuted,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    initCall,
    answerCall: handleIncomingCall,
    endCall,
    toggleMute,
    toggleScreenShare,
    rejectCall: () => {
      socket.emit('reject-call', { to: remoteUserId });
      endCall();
    }
  };
};