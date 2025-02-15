"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Button } from "@/components/ui/button";
import { VideoCallControls } from "@/components/VideoCallControls";

export function VideoCallComponent() {
  const { remoteStream, localStream, connectedPeerId, startCall } = usePeer();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callStarted, setCallStarted] = useState(false);

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

  const initiateCall = () => {
    if (connectedPeerId) {
      startCall(connectedPeerId);
      setCallStarted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900 text-white">
      <h2 className="text-2xl font-semibold mb-4">Video Call</h2>
      <div className="relative w-full max-w-2xl aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-2 left-2 w-1/4 border border-white rounded-lg" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      </div>
      {!remoteStream && (
        <Button onClick={initiateCall} className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg">
          Start Call
        </Button>
      )}
      {remoteStream && <VideoCallControls />}
    </div>
  );
}

export default VideoCallComponent;
