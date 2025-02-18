"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { usePeer } from "@/contexts/PeerContext";
import { Button } from "@/components/ui/button";
import { VideoCallControls } from "@/components/VideoCallControls";

export function VideoCallComponent() {
  const { remoteStream, localStream, mediaConnection, startCall, connectedPeerId, isCallActive } = usePeer();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

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
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full text-white px-4">

      {/* Video Container */}
      <div className="relative w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 aspect-auto rounded-xl overflow-hidden shadow-xl border border-gray-500 bg-zinc-800">
        {/* Remote Video */}
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Floating Local Video */}
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute border border-gray-500 shadow-lg rounded-lg 
                       bottom-2 right-2 w-1/4 sm:w-1/5 md:w-1/6 lg:w-1/5 xl:w-1/6"
          />
        )}
      </div>

  <div className="py-3" />

      {/* Show Start Call button only if no active call */}
      {!isCallActive ? (
        <Button
          onClick={initiateCall}
          className=" px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white shadow-lg transition-transform transform hover:scale-105"
        >
          Start Call
        </Button>
      ) : (
        <VideoCallControls />
      )}
    </div>
  );
}

export default VideoCallComponent;